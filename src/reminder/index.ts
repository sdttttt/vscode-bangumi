import * as vscode from "vscode";
import type { Notifier } from "../notifier";
import { affectsReminder, type Settings } from "../configuration";
import type { Commands } from "../commands";
import type { WeekBangumiData } from "../request/bilibili/structure";
import type { WeeklySchedule } from "../request/schedule";
import {
    REMIND_ACTION,
    updatedMessage,
    upcomingMessage,
} from "../utils/display";
import { nextDayStart } from "../utils/clock";
import { describeNotice } from "./notice";
import {
    buildSchedule,
    ROLLOVER_DELAY_MS,
    todayIndex,
    type Schedule,
    type ScheduleEvent,
} from "./schedule";
import type { Scheduler } from "./scheduler";
import type { StatusBar } from "./statusBar";
import { summarizeToday, type TodaySummary } from "./summary";

/**
 * 无法拉取周番数据时的重试间隔。
 *
 * 提醒是扩展里唯一需要独自扛过断网的部分，因此它会重试，而不是让状态栏在
 * 本次会话余下的时间里一直空着。
 *
 * @author sdttttt
 */
const RETRY_DELAYS_MS: ReadonlyArray<number> = [30_000, 120_000, 600_000];

/**
 * 拉取周番数据。可注入，测试因此不会触碰网络，会话也可以传入自己的 `BangumiApi`。
 *
 * @author sdttttt
 */
export type WeekSource = () => Promise<Array<WeekBangumiData> | undefined>;

/**
 * 拉取统一模型的周番数据，用于状态栏的当日概览。
 *
 * Bangumi 没有播出时刻，算不出提醒事件，但它的「今天有哪些番剧」正是该模式下
 * 状态栏要展示的内容，因此概览走这条通道。
 *
 * @author sdttttt
 */
export type OverviewSource = () => Promise<WeeklySchedule | undefined>;

/**
 * 扩展入口使用的提醒能力。
 *
 * @author sdttttt
 */
export interface Reminder {
    /** 启动提醒，并跟随相关设置的变更。 */
    start(): Promise<void>;
    /** 重新拉取日程并重新装载提醒。 */
    refresh(): Promise<void>;
    /** 播报一个到期事件，并把它从状态栏移除。 */
    fire(event: ScheduleEvent): void;
    /** 释放所有定时器、状态栏条目与设置监听。 */
    dispose(): void;
}

/**
 * 提醒所需的依赖。
 *
 * @author sdttttt
 */
export interface ReminderOptions {
    /** 拉取 B 站的周番数据，用于带播出时刻的提醒。 */
    readonly source: WeekSource;
    /** 拉取统一模型，用于 Bangumi 模式下的今日概览。 */
    readonly overview: OverviewSource;
    /** 由组合根持有的状态栏条目。 */
    readonly statusBar: StatusBar;
    /** 由组合根持有的调度器。 */
    readonly scheduler: Scheduler;
    /** 本次会话的设置。 */
    readonly settings: Settings;
    /** 面向用户的输出。 */
    readonly notifier: Notifier;
    /** 执行扩展命令。 */
    readonly commands: Commands;
    /** 订阅设置变更，并返回可释放对象。 */
    readonly onSettingsChanged: (
        listener: (affected: (section: string) => boolean) => void
    ) => vscode.Disposable;
    readonly now?: () => number;
}

/**
 * 调度更新提醒，并负责状态栏条目。
 *
 * 整个日程被收敛为单个已装载的定时器：调度器在下一个截止时刻醒来（以半小时为上限），
 * 把每个到期事件按更新分组各发一条通知，然后重新装载。日程切换之间不会累积任何东西，
 * `refresh()` 也是幂等的。
 *
 * @author sdttttt
 */
export function useReminder(options: ReminderOptions): Reminder {
    const source = options.source;
    const overviewSource = options.overview;
    const now = options.now ?? Date.now;
    const statusBar = options.statusBar;
    const scheduler = options.scheduler;
    const settings = options.settings;
    const notifier = options.notifier;
    const onSettingsChanged = options.onSettingsChanged;
    const commands = options.commands;

    let events: ReadonlyArray<ScheduleEvent> = [];
    /* Bangumi 模式下的当日概览；为 `undefined` 时状态栏走「下一场更新」。 */
    let overview: TodaySummary | undefined;
    let listener: vscode.Disposable | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    /* 每次刷新自增，避免慢响应覆盖更新的结果。 */
    let generation = 0;
    let retryAttempt = 0;
    let warnedMissingToday = false;
    let disposed = false;

    const cancelRetry = (): void => {
        if (undefined !== retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = undefined;
        }
    };

    const renderStatusBar = (at: number): void => {
        if (!settings.isDisplayStatusBar()) {
            statusBar.hide();
            return;
        }

        /*
         * 概览模式下没有事件，`fire()` 因此仍然安全：它重绘的会是同一份概览，
         * 而不是把条目标成「下一场更新」再因为空列表而隐藏。
         */
        if (overview) {
            statusBar.showSummary(overview);
            return;
        }

        statusBar.show(
            events.filter(event => event.at > at),
            at
        );
    };

    const fire = (event: ScheduleEvent): void => {
        const notice = describeNotice(event, now());

        const message =
            "published" === notice.kind
                ? updatedMessage(event.titles)
                : upcomingMessage(event.titles, notice.minutes);

        void notifier.action(message, REMIND_ACTION).then(chosen => {
            if (chosen) {
                commands.execute("weekBangumi");
            }
        });

        const at = now();
        events = events.filter(other => other.at > at);
        renderStatusBar(at);
    };

    const scheduleRetry = (): void => {
        const delay =
            RETRY_DELAYS_MS[Math.min(retryAttempt, RETRY_DELAYS_MS.length - 1)];
        retryAttempt += 1;
        retryTimer = setTimeout(() => {
            retryTimer = undefined;
            void refresh();
        }, delay);
    };

    const refresh = async (): Promise<void> => {
        if (disposed) {
            return;
        }

        const current = ++generation;
        cancelRetry();
        scheduler.disarm();

        if ("bangumi" === settings.weekSource()) {
            await refreshSummary(current);
            return;
        }

        /* 回到 B 站来源后，状态栏不再展示概览，避免它残留到下一次渲染。 */
        overview = undefined;

        let days: Array<WeekBangumiData> | undefined;
        try {
            days = await source();
        } catch {
            days = undefined;
        }

        /* 更新的刷新或 dispose 会让本次响应作废。 */
        if (current !== generation || disposed) {
            return;
        }

        if (!days) {
            scheduleRetry();
            return;
        }

        retryAttempt = 0;
        const at = now();

        if (!warnedMissingToday && undefined === todayIndex(days, at)) {
            warnedMissingToday = true;
            notifier.info("没有找到今日的番剧数据，提醒可能不准确。");
        }

        const schedule: Schedule = buildSchedule(
            days,
            at,
            settings.reminderAheadTime()
        );
        events = schedule.events;
        scheduler.arm(schedule);
        renderStatusBar(at);
    };

    /**
     * Bangumi 模式下的刷新：不装载任何提醒事件，只把当天的番剧概览写进状态栏。
     *
     * 虽然没有事件，仍然要装载跨日时刻：概览跟着「今天」走，过了午夜必须重新拉取，
     * 否则状态栏会一直停在昨天的列表上。
     */
    const refreshSummary = async (current: number): Promise<void> => {
        let schedule: WeeklySchedule | undefined;
        try {
            schedule = await overviewSource();
        } catch {
            schedule = undefined;
        }

        if (current !== generation || disposed) {
            return;
        }

        if (!schedule) {
            scheduleRetry();
            return;
        }

        retryAttempt = 0;
        events = [];
        overview = summarizeToday(schedule);

        const at = now();
        renderStatusBar(at);

        scheduler.arm({
            events: [],
            rolloverAt: nextDayStart(at) + ROLLOVER_DELAY_MS,
        });
    };

    const apply = async (): Promise<void> => {
        if (disposed) {
            return;
        }

        /*
         * Bangumi 没有播出时刻，提醒无法成立，因此该来源下不做开关判断，
         * 只刷新状态栏概览；状态栏本身仍受 `DisplayStatusBar` 控制，
         * 关掉时连请求都不必发出。
         */
        if ("bangumi" === settings.weekSource()) {
            if (!settings.isDisplayStatusBar()) {
                generation += 1;
                cancelRetry();
                scheduler.disarm();
                overview = undefined;
                statusBar.hide();
                return;
            }

            await refresh();
            return;
        }

        if (!settings.isReminderEnabled()) {
            generation += 1;
            cancelRetry();
            scheduler.disarm();
            overview = undefined;
            statusBar.hide();
            return;
        }

        await refresh();
    };

    return {
        start: async () => {
            disposed = false;
            listener?.dispose();
            listener = onSettingsChanged(affected => {
                if (affectsReminder(affected)) {
                    void apply();
                }
            });

            await apply();
        },
        refresh,
        fire,
        dispose: () => {
            disposed = true;
            generation += 1;
            cancelRetry();
            scheduler.disarm();
            listener?.dispose();
            listener = undefined;
            statusBar.dispose();
        },
    };
}
