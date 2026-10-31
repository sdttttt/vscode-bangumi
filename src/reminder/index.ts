import * as vscode from "vscode";
import type { Notifier } from "../notifier";
import { affectsReminder, type Settings } from "../configuration";
import type { Commands } from "../commands";
import type { WeekBangumiData } from "../request/structure";
import {
    REMIND_ACTION,
    updatedMessage,
    upcomingMessage,
} from "../utils/display";
import { describeNotice } from "./notice";
import {
    buildSchedule,
    todayIndex,
    type Schedule,
    type ScheduleEvent,
} from "./schedule";
import type { Scheduler } from "./scheduler";
import type { StatusBar } from "./statusBar";

/**
 * Delays used when the weekly schedule cannot be pulled.
 *
 * The reminder is the only part of the extension that has to survive a network
 * outage on its own, so it retries instead of leaving the status bar empty for
 * the rest of the session.
 *
 * @author sdttttt
 */
const RETRY_DELAYS_MS: ReadonlyArray<number> = [30_000, 120_000, 600_000];

/**
 * Pulls the weekly schedule. Injectable so tests never touch the network and
 * the session can hand in its own `BangumiApi`.
 *
 * @author sdttttt
 */
export type WeekSource = () => Promise<Array<WeekBangumiData> | undefined>;

/**
 * The reminder surface used by the extension entry.
 *
 * @author sdttttt
 */
export interface Reminder {
    /** Starts the reminder and follows the related settings. */
    start(): Promise<void>;
    /** Pulls the schedule again and re-arms the reminder. */
    refresh(): Promise<void>;
    /** Announces one due event and drops it from the status bar. */
    fire(event: ScheduleEvent): void;
    /** Releases every timer, the status bar entry and the settings listener. */
    dispose(): void;
}

/**
 * Dependencies of a reminder.
 *
 * @author sdttttt
 */
export interface ReminderOptions {
    /** Pulls the weekly schedule. */
    readonly source: WeekSource;
    /** Status bar entry owned by the composition root. */
    readonly statusBar: StatusBar;
    /** Scheduler owned by the composition root. */
    readonly scheduler: Scheduler;
    /** Settings of the session. */
    readonly settings: Settings;
    /** User facing output. */
    readonly notifier: Notifier;
    /** Runs the extension commands. */
    readonly commands: Commands;
    /** Subscribes to setting changes and returns the disposable. */
    readonly onSettingsChanged: (
        listener: (affected: (section: string) => boolean) => void
    ) => vscode.Disposable;
    readonly now?: () => number;
}

/**
 * Schedules the update reminders and owns the status bar entry.
 *
 * A whole schedule is reduced to a single armed timer: the scheduler wakes up
 * at the next deadline (bounded by half an hour), fires every due event as one
 * notification per update group, and re-arms. Nothing accumulates between
 * schedule changes, and `refresh()` is idempotent.
 *
 * @author sdttttt
 */
export function useReminder(options: ReminderOptions): Reminder {
    const source = options.source;
    const now = options.now ?? Date.now;
    const statusBar = options.statusBar;
    const scheduler = options.scheduler;
    const settings = options.settings;
    const notifier = options.notifier;
    const onSettingsChanged = options.onSettingsChanged;
    const commands = options.commands;

    let events: ReadonlyArray<ScheduleEvent> = [];
    let listener: vscode.Disposable | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    /* Bumped on every refresh so a slow response cannot overwrite a newer one. */
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

        let days: Array<WeekBangumiData> | undefined;
        try {
            days = await source();
        } catch {
            days = undefined;
        }

        /* A newer refresh, or a dispose, invalidates this response. */
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

    const apply = async (): Promise<void> => {
        if (disposed) {
            return;
        }

        if (!settings.isReminderEnabled()) {
            generation += 1;
            cancelRetry();
            scheduler.disarm();
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
