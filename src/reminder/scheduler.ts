import type { Schedule, ScheduleEvent } from "./schedule";

/**
 * 单个定时器最长可休眠的时长。
 *
 * 休眠更久会在系统挂起或系统时钟跳变时失效，所以调度器至少每隔这么久醒来
 * 一次，重新评估日程。
 *
 * @author sdttttt
 */
export const MAX_SLEEP_MS = 30 * 60 * 1000;

/**
 * 事件可以迟到多久仍然值得通知。
 *
 * 比这更早的事件是机器休眠期间错过的；事后告知用户只是噪声，起不到提醒作用。
 *
 * @author sdttttt
 */
export const GRACE_MS = 5 * 60 * 1000;

/**
 * 调度器的回调。
 *
 * @author sdttttt
 */
export interface SchedulerHooks {
    /** 每个到期事件调用一次，按日程顺序。 */
    readonly onEvent: (event: ScheduleEvent) => void;
    /** 日期已变、需要重新拉取日程时调用。 */
    readonly onRollover: () => void;
}

/**
 * 整个日程最多只保留一个已装载的定时器。
 *
 * 每次醒来都重新装载会替换掉上一个定时器，因此已触发的句柄不会累积；
 * 每次休眠都以 `MAX_SLEEP_MS` 为上限，机器挂起或时钟跳变半小时内即可察觉。
 *
 * @author sdttttt
 */
export interface Scheduler {
    /** 替换已装载的日程，并装载它的下一个截止时刻。 */
    arm(schedule: Schedule): void;
    /** 取消待触发的定时器。任何时候调用都安全。 */
    disarm(): void;
    /** 当前是否装载了定时器。 */
    isArmed(): boolean;
}

/**
 * 围绕给定时钟创建一个调度器。
 *
 * @param hooks 定时器触发时调用的回调
 * @param now 时钟，可注入，测试因此不依赖真实时间
 * @author sdttttt
 */
export function useScheduler(
    hooks: SchedulerHooks,
    now: () => number
): Scheduler {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let schedule: Schedule | undefined;
    /* 已装载日程中，前面多少个事件已经触发。 */
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
         * 机器休眠期间错过的事件会被静默消费：只有剧集还热乎时提醒才有意义。
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
             * 先清空日程再回调：回调应当拉取新数据并装载新日程，若保留旧日程，
             * 下一次 tick 会把它剩下的内容再触发一遍。
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
