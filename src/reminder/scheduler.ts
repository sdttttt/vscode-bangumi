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
export interface Scheduler {
    /** Replaces the armed schedule and arms its next deadline. */
    arm(schedule: Schedule): void;
    /** Cancels the pending timer. Safe to call at any time. */
    disarm(): void;
    /** Whether a timer is currently armed. */
    isArmed(): boolean;
}

/**
 * Creates a scheduler around the given clock.
 *
 * @param hooks callbacks fired by the timer
 * @param now clock, injectable so tests never depend on the wall clock
 * @author sdttttt
 */
export function useScheduler(
    hooks: SchedulerHooks,
    now: () => number
): Scheduler {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let schedule: Schedule | undefined;
    /* How many leading events of the armed schedule already fired. */
    let consumed = 0;

    const clearTimer = (): void => {
        if (undefined !== timer) {
            clearTimeout(timer);
            timer = undefined;
        }
    };

    const armNext = (): void => {
        if (!schedule) {
            return;
        }

        const event = schedule.events[consumed];
        const deadline = Math.min(
            event ? event.at : Number.POSITIVE_INFINITY,
            schedule.rolloverAt
        );

        if (!Number.isFinite(deadline)) {
            return;
        }

        const sleep = Math.max(0, Math.min(deadline - now(), MAX_SLEEP_MS));
        timer = setTimeout(tick, sleep);
    };

    const tick = (): void => {
        timer = undefined;

        if (!schedule) {
            return;
        }

        const at = now();

        /*
         * Events the machine slept through are consumed without a word: the
         * reminder is only useful while the episode is still fresh.
         */
        while (consumed < schedule.events.length) {
            const event = schedule.events[consumed];
            if (event.at > at) {
                break;
            }
            consumed += 1;
            if (GRACE_MS >= at - event.at) {
                hooks.onEvent(event);
            }
        }

        if (schedule.rolloverAt <= at) {
            /*
             * Drop the schedule before calling out: the callback is expected to
             * pull fresh data and arm a new schedule, and keeping the stale one
             * would make the next tick fire its leftovers again.
             */
            schedule = undefined;
            consumed = 0;
            hooks.onRollover();
            return;
        }

        armNext();
    };

    return {
        arm: next => {
            clearTimer();
            schedule = next;
            consumed = 0;
            armNext();
        },
        disarm: () => {
            clearTimer();
            schedule = undefined;
            consumed = 0;
        },
        isArmed: () => undefined !== timer,
    };
}
