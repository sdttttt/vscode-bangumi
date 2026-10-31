import * as vscode from "vscode";
import {
    affectsReminder,
    getReminderAheadTime,
    isDisplayStatusBar,
    isReminderEnabled,
} from "../configuration";
import { getWeekBangumi } from "../request/bangumi";
import type { WeekBangumiData } from "../request/structure";
import {
    showBangumiUpdateRemind,
    showBeforeBangumiUpdateRemind,
} from "../utils/display";
import {
    buildSchedule,
    todayIndex,
    type Schedule,
    type ScheduleEvent,
} from "./schedule";
import { Scheduler } from "./scheduler";
import { ReminderStatusBar } from "./statusBar";

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
 * Remaining time under which an event is announced as already published.
 *
 * @author sdttttt
 */
const PUBLISHED_THRESHOLD_MS = 60_000;

/**
 * Pulls the weekly schedule. Injectable so tests never touch the network.
 *
 * @author sdttttt
 */
export type WeekSource = () => Promise<Array<WeekBangumiData> | undefined>;

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
export class Reminder implements vscode.Disposable {
    private readonly statusBar = new ReminderStatusBar("weekBangumi");

    private readonly scheduler: Scheduler;

    private readonly source: WeekSource;

    private readonly now: () => number;

    private events: ReadonlyArray<ScheduleEvent> = [];

    private listener: vscode.Disposable | undefined;

    private retryTimer: ReturnType<typeof setTimeout> | undefined;

    /** Bumped on every refresh so a slow response cannot overwrite a newer one. */
    private generation = 0;

    private retryAttempt = 0;

    private warnedMissingToday = false;

    private disposed = false;

    public constructor(
        source: WeekSource = getWeekBangumi,
        now: () => number = Date.now
    ) {
        this.source = source;
        this.now = now;
        this.scheduler = new Scheduler(
            {
                onEvent: event => this.notify(event),
                onRollover: () => {
                    void this.refresh();
                },
            },
            now
        );
    }

    /**
     * Starts the reminder and follows the related settings.
     *
     * @author sdttttt
     */
    public async start(): Promise<void> {
        this.disposed = false;
        this.listener?.dispose();
        this.listener = vscode.workspace.onDidChangeConfiguration(event => {
            if (
                affectsReminder(section => event.affectsConfiguration(section))
            ) {
                void this.apply();
            }
        });

        await this.apply();
    }

    /**
     * Pulls the schedule again and re-arms the reminder.
     *
     * Never rejects: a failed request is retried in the background.
     *
     * @author sdttttt
     */
    public async refresh(): Promise<void> {
        if (this.disposed) {
            return;
        }

        const generation = ++this.generation;
        this.cancelRetry();
        this.scheduler.disarm();

        let days: Array<WeekBangumiData> | undefined;
        try {
            days = await this.source();
        } catch {
            days = undefined;
        }

        /* A newer refresh, or a dispose, invalidates this response. */
        if (generation !== this.generation || this.disposed) {
            return;
        }

        if (!days) {
            this.scheduleRetry();
            return;
        }

        this.retryAttempt = 0;
        const now = this.now();

        if (!this.warnedMissingToday && undefined === todayIndex(days, now)) {
            this.warnedMissingToday = true;
            void vscode.window.showInformationMessage("没有找到今日的索引 ??");
        }

        const schedule: Schedule = buildSchedule(
            days,
            now,
            getReminderAheadTime()
        );
        this.events = schedule.events;
        this.scheduler.arm(schedule);
        this.renderStatusBar(now);
    }

    /**
     * Releases every timer, the status bar entry and the settings listener.
     *
     * @author sdttttt
     */
    public dispose(): void {
        this.disposed = true;
        this.generation += 1;
        this.cancelRetry();
        this.scheduler.disarm();
        this.listener?.dispose();
        this.listener = undefined;
        this.statusBar.dispose();
    }

    /**
     * Applies the settings: disabled means no timer and no status bar entry.
     *
     * @author sdttttt
     */
    private async apply(): Promise<void> {
        if (this.disposed) {
            return;
        }

        if (!isReminderEnabled()) {
            this.generation += 1;
            this.cancelRetry();
            this.scheduler.disarm();
            this.statusBar.hide();
            return;
        }

        await this.refresh();
    }

    private notify(event: ScheduleEvent): void {
        const remain = event.pubTs - this.now();

        if (PUBLISHED_THRESHOLD_MS >= remain) {
            showBangumiUpdateRemind(event.titles);
        } else {
            showBeforeBangumiUpdateRemind(
                event.titles,
                Math.ceil(remain / 60_000)
            );
        }

        const now = this.now();
        this.events = this.events.filter(other => other.at > now);
        this.renderStatusBar(now);
    }

    private renderStatusBar(now: number): void {
        if (!isDisplayStatusBar()) {
            this.statusBar.hide();
            return;
        }

        this.statusBar.show(this.events.filter(event => event.at > now));
    }

    private scheduleRetry(): void {
        const delay =
            RETRY_DELAYS_MS[
                Math.min(this.retryAttempt, RETRY_DELAYS_MS.length - 1)
            ];
        this.retryAttempt += 1;
        this.retryTimer = setTimeout(() => {
            this.retryTimer = undefined;
            void this.refresh();
        }, delay);
    }

    private cancelRetry(): void {
        if (undefined !== this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = undefined;
        }
    }
}

/**
 * Module level singleton, matching the other views of the extension.
 *
 * @author sdttttt
 */
export default new Reminder();
