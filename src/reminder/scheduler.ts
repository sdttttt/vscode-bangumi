import type { Schedule, ScheduleEvent } from "./schedule";

/**
 * Longest a single timer may sleep.
 *
 * A longer sleep would be lost across a system suspend or a wall clock change,
 * so the scheduler wakes up at least this often and re-evaluates the schedule.
 *
 * @author sdttttt
 */
export const MAX_SLEEP_MS = 30 * 60 * 1000;

/**
 * How late an event may fire and still be worth a notification.
 *
 * Anything older than this was missed while the machine was asleep; telling the
 * user about it afterwards is noise, not a reminder.
 *
 * @author sdttttt
 */
export const GRACE_MS = 5 * 60 * 1000;

/**
 * Callbacks of the scheduler.
 *
 * @author sdttttt
 */
export interface SchedulerHooks {
    /** Called once per due event, in schedule order. */
    readonly onEvent: (event: ScheduleEvent) => void;
    /** Called when the day changed and the schedule has to be pulled again. */
    readonly onRollover: () => void;
}

/**
 * Keeps at most one timer armed for the whole schedule.
 *
 * Re-arming on every wake up replaces the previous timer, so triggered handles
 * never accumulate, and each sleep is bounded by `MAX_SLEEP_MS` so a suspended
 * machine or a clock jump is noticed within half an hour.
 *
 * @author sdttttt
 */
export class Scheduler {
    private timer: ReturnType<typeof setTimeout> | undefined;

    private schedule: Schedule | undefined;

    /** How many leading events of the armed schedule already fired. */
    private consumed = 0;

    public constructor(
        private readonly hooks: SchedulerHooks,
        private readonly now: () => number = Date.now
    ) {}

    /**
     * Replaces the armed schedule and arms its next deadline.
     *
     * @author sdttttt
     */
    public arm(schedule: Schedule): void {
        this.clearTimer();
        this.schedule = schedule;
        this.consumed = 0;
        this.armNext();
    }

    /**
     * Cancels the pending timer. Safe to call at any time.
     *
     * @author sdttttt
     */
    public disarm(): void {
        this.clearTimer();
        this.schedule = undefined;
        this.consumed = 0;
    }

    /**
     * Whether a timer is currently armed.
     *
     * @author sdttttt
     */
    public get armed(): boolean {
        return undefined !== this.timer;
    }

    private clearTimer(): void {
        if (undefined !== this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }

    private pending(): ScheduleEvent | undefined {
        return this.schedule?.events[this.consumed];
    }

    private armNext(): void {
        const schedule = this.schedule;
        if (!schedule) {
            return;
        }

        const now = this.now();
        const event = this.pending();
        const deadline = Math.min(
            event ? event.at : Number.POSITIVE_INFINITY,
            schedule.rolloverAt
        );

        if (!Number.isFinite(deadline)) {
            return;
        }

        const sleep = Math.max(0, Math.min(deadline - now, MAX_SLEEP_MS));
        this.timer = setTimeout(() => this.tick(), sleep);
    }

    private tick(): void {
        this.timer = undefined;

        const schedule = this.schedule;
        if (!schedule) {
            return;
        }

        const now = this.now();

        /*
         * Events the machine slept through are consumed without a word: the
         * reminder is only useful while the episode is still fresh.
         */
        while (this.consumed < schedule.events.length) {
            const event = schedule.events[this.consumed];
            if (event.at > now) {
                break;
            }
            this.consumed += 1;
            if (GRACE_MS >= now - event.at) {
                this.hooks.onEvent(event);
            }
        }

        if (schedule.rolloverAt <= now) {
            /*
             * Drop the schedule before calling out: the callback is expected to
             * pull fresh data and arm a new schedule, and keeping the stale one
             * would make the next tick fire its leftovers again.
             */
            this.schedule = undefined;
            this.consumed = 0;
            this.hooks.onRollover();
            return;
        }

        this.armNext();
    }
}
