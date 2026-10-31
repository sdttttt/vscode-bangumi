import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScheduler, GRACE_MS, MAX_SLEEP_MS } from "@/reminder/scheduler";
import type { Schedule, ScheduleEvent } from "@/reminder/schedule";

/**
 * Builds an event that fires at the given instant.
 *
 * @author sdttttt
 */
function event(at: number, title = "甲"): ScheduleEvent {
    return { at, pubTs: at, pubTime: "20:00", titles: [title] };
}

/**
 * Builds a schedule from its events, with a far away rollover.
 *
 * @author sdttttt
 */
function schedule(
    events: ReadonlyArray<ScheduleEvent>,
    rolloverAt = Date.now() + 6 * 60 * 60 * 1000
): Schedule {
    return { events, rolloverAt };
}

describe("useScheduler", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 31, 12, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("fires an event at its instant", () => {
        const onEvent = vi.fn();
        const scheduler = useScheduler(
            { onEvent, onRollover: vi.fn() },
            Date.now
        );
        const at = Date.now() + 5_000;

        scheduler.arm(schedule([event(at)]));
        vi.advanceTimersByTime(4_999);
        expect(onEvent).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(onEvent).toHaveBeenCalledTimes(1);
        expect(onEvent.mock.calls[0][0].at).toBe(at);
    });

    it("fires every due event once, in order", () => {
        const fired: Array<string> = [];
        const scheduler = useScheduler(
            {
                onEvent: incoming => fired.push(incoming.titles[0]),
                onRollover: vi.fn(),
            },
            Date.now
        );
        const now = Date.now();

        scheduler.arm(
            schedule([
                event(now + 1_000, "甲"),
                event(now + 1_000, "乙"),
                event(now + 2_000, "丙"),
            ])
        );

        vi.advanceTimersByTime(2_000);
        expect(fired).toEqual(["甲", "乙", "丙"]);

        vi.advanceTimersByTime(60_000);
        expect(fired).toEqual(["甲", "乙", "丙"]);
    });

    it("skips an event missed beyond the grace window", () => {
        const onEvent = vi.fn();
        const scheduler = useScheduler(
            { onEvent, onRollover: vi.fn() },
            Date.now
        );
        const at = Date.now() + 1_000;

        scheduler.arm(schedule([event(at)]));
        /* The machine slept for an hour. */
        vi.setSystemTime(at + GRACE_MS + 1);
        vi.advanceTimersByTime(MAX_SLEEP_MS);

        expect(onEvent).not.toHaveBeenCalled();
    });

    it("still fires an event inside the grace window", () => {
        const onEvent = vi.fn();
        const scheduler = useScheduler(
            { onEvent, onRollover: vi.fn() },
            Date.now
        );
        const at = Date.now() + 1_000;

        scheduler.arm(schedule([event(at)]));
        /* The machine woke up late, but inside the grace window. */
        vi.setSystemTime(at + GRACE_MS - 1_000);
        vi.advanceTimersByTime(1_000);

        expect(onEvent).toHaveBeenCalledTimes(1);
    });

    it("never sleeps longer than the maximum span", () => {
        const onEvent = vi.fn();
        const scheduler = useScheduler(
            { onEvent, onRollover: vi.fn() },
            Date.now
        );

        scheduler.arm(schedule([event(Date.now() + 4 * 60 * 60 * 1000)]));

        vi.advanceTimersByTime(MAX_SLEEP_MS - 1);
        expect(onEvent).not.toHaveBeenCalled();
        expect(scheduler.isArmed()).toBe(true);
    });

    it("asks for a refresh once the day rolled over", () => {
        const onRollover = vi.fn();
        const scheduler = useScheduler(
            { onEvent: vi.fn(), onRollover },
            Date.now
        );
        const rolloverAt = Date.now() + 30_000;

        scheduler.arm(schedule([], rolloverAt));
        vi.advanceTimersByTime(30_000);

        expect(onRollover).toHaveBeenCalledTimes(1);
        expect(scheduler.isArmed()).toBe(false);
    });

    it("fires the due events before the rollover callback", () => {
        const order: Array<string> = [];
        const rolloverAt = Date.now() + 30_000;
        const scheduler = useScheduler(
            {
                onEvent: incoming => order.push(incoming.titles[0]),
                onRollover: () => order.push("rollover"),
            },
            Date.now
        );

        scheduler.arm(schedule([event(rolloverAt, "甲")], rolloverAt));
        vi.advanceTimersByTime(30_000);

        expect(order).toEqual(["甲", "rollover"]);
    });

    it("stops firing after disarm", () => {
        const onEvent = vi.fn();
        const scheduler = useScheduler(
            { onEvent, onRollover: vi.fn() },
            Date.now
        );

        scheduler.arm(schedule([event(Date.now() + 1_000)]));
        scheduler.disarm();
        vi.advanceTimersByTime(60_000);

        expect(onEvent).not.toHaveBeenCalled();
        expect(scheduler.isArmed()).toBe(false);
    });

    it("replaces the previous schedule when armed twice", () => {
        const onEvent = vi.fn();
        const scheduler = useScheduler(
            { onEvent, onRollover: vi.fn() },
            Date.now
        );
        const now = Date.now();

        scheduler.arm(schedule([event(now + 1_000, "旧")]));
        scheduler.arm(schedule([event(now + 2_000, "新")]));

        vi.advanceTimersByTime(1_500);
        expect(onEvent).not.toHaveBeenCalled();

        vi.advanceTimersByTime(500);
        expect(onEvent).toHaveBeenCalledTimes(1);
        expect(onEvent.mock.calls[0][0].titles[0]).toBe("新");
    });

    it("keeps a single timer while events are pending", () => {
        const scheduler = useScheduler(
            {
                onEvent: vi.fn(),
                onRollover: vi.fn(),
            },
            Date.now
        );
        const now = Date.now();

        scheduler.arm(
            schedule([
                event(now + 1_000),
                event(now + 2_000),
                event(now + 3_000),
            ])
        );

        expect(vi.getTimerCount()).toBe(1);
        vi.advanceTimersByTime(3_000);

        expect(vi.getTimerCount()).toBe(1);
    });

    it("arms nothing when the schedule has no deadline", () => {
        const scheduler = useScheduler(
            {
                onEvent: vi.fn(),
                onRollover: vi.fn(),
            },
            Date.now
        );

        scheduler.arm({ events: [], rolloverAt: Number.POSITIVE_INFINITY });

        expect(scheduler.isArmed()).toBe(false);
    });

    it("re-arms a schedule whose next event is already due", () => {
        const onEvent = vi.fn();
        const scheduler = useScheduler(
            { onEvent, onRollover: vi.fn() },
            Date.now
        );
        const now = Date.now();

        scheduler.arm(schedule([event(now), event(now + 1_000)]));
        vi.advanceTimersByTime(0);
        expect(onEvent).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1_000);
        expect(onEvent).toHaveBeenCalledTimes(2);
    });
});
