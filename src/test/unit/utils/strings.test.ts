import { afterEach, describe, expect, it, vi } from "vitest";
import {
    currentTimestamp,
    getFromIndexSameUpdateBangumi,
    getTodayIndexInWeekBangumi,
    isToday,
    numberOfStringPlus,
    randomInteger,
    toMinuteFromSecode,
    toWeekDay,
} from "@/utils/strings";
import { wBangumi, weekBangumiData } from "@/test/mocks/fixtures/weekBangumi";

describe("toWeekDay", () => {
    it.each([
        [1, "星期一"],
        [2, "星期二"],
        [3, "星期三"],
        [4, "星期四"],
        [5, "星期五"],
        [6, "星期六"],
        [7, "星期日"],
    ])("maps day %i to %s", (day, expected) => {
        expect(toWeekDay(day)).toBe(expected);
    });

    it.each([0, 8, -1])(
        "returns an empty string for out of range day %i",
        day => {
            expect(toWeekDay(day)).toBe("");
        }
    );
});

describe("isToday", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("matches a month-day string built from the current date", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 31, 12, 0));

        expect(isToday("10-31")).toBe(true);
    });

    it("does not match a neighbouring day", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 31, 12, 0));

        expect(isToday("10-30")).toBe(false);
        expect(isToday("11-1")).toBe(false);
    });

    it("handles the last day of a month without padding", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 0, 31, 23, 59));

        expect(isToday("1-31")).toBe(true);
        expect(isToday("01-31")).toBe(false);
    });
});

describe("currentTimestamp", () => {
    it("returns the current epoch time in milliseconds", () => {
        vi.useFakeTimers();
        const now = new Date(2026, 9, 31, 12, 0);
        vi.setSystemTime(now);

        expect(currentTimestamp()).toBe(now.getTime());

        vi.useRealTimers();
    });
});

describe("getTodayIndexInWeekBangumi", () => {
    it("returns the index of the day matching today", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2025, 0, 3, 12, 0));

        const bangumis = [
            weekBangumiData({ date: "1-2" }),
            weekBangumiData({ date: "1-3" }),
            weekBangumiData({ date: "1-4" }),
        ];

        expect(getTodayIndexInWeekBangumi(bangumis)).toBe(1);

        vi.useRealTimers();
    });

    it("returns undefined when today is not in the schedule", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2025, 0, 9, 12, 0));

        const bangumis = [weekBangumiData({ date: "1-2" })];

        expect(getTodayIndexInWeekBangumi(bangumis)).toBeUndefined();

        vi.useRealTimers();
    });

    it("returns undefined for an empty schedule", () => {
        expect(getTodayIndexInWeekBangumi([])).toBeUndefined();
    });
});

describe("getFromIndexSameUpdateBangumi", () => {
    it("collects the consecutive entries sharing the same pub_time", () => {
        const bangumis = [
            wBangumi({ title: "a", pub_time: "20:00" }),
            wBangumi({ title: "b", pub_time: "20:00" }),
            wBangumi({ title: "c", pub_time: "21:00" }),
        ];

        const result = getFromIndexSameUpdateBangumi(bangumis, 0);

        expect(result.map(item => item.title)).toEqual(["a", "b"]);
    });

    it("stops at the first entry with a different pub_time", () => {
        const bangumis = [
            wBangumi({ title: "a", pub_time: "19:00" }),
            wBangumi({ title: "b", pub_time: "20:00" }),
            wBangumi({ title: "c", pub_time: "20:00" }),
        ];

        const result = getFromIndexSameUpdateBangumi(bangumis, 1);

        expect(result.map(item => item.title)).toEqual(["b", "c"]);
    });

    it("returns a single entry when the group has only one member", () => {
        const bangumis = [wBangumi({ title: "solo", pub_time: "20:00" })];

        expect(getFromIndexSameUpdateBangumi(bangumis, 0)).toHaveLength(1);
    });
});

describe("toMinuteFromSecode", () => {
    it.each([
        [0, 0],
        [1, 1],
        [5, 1],
        [30, 1],
        [60, 1],
        [61, 2],
        [119, 2],
        [120, 2],
        [121, 3],
    ])("rounds %i seconds up to %i minute(s)", (seconds, expected) => {
        expect(toMinuteFromSecode(seconds)).toBe(expected);
    });
});

describe("numberOfStringPlus", () => {
    it("adds to a numeric string", () => {
        expect(numberOfStringPlus("2024", 1)).toBe("2025");
    });

    it("treats a non numeric string as zero", () => {
        expect(numberOfStringPlus("abc", 2)).toBe("2");
    });
});

describe("randomInteger", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("maps Math.random into the half open range [min, max)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);
        expect(randomInteger(4, 15)).toBe(4);

        vi.spyOn(Math, "random").mockReturnValue(0.999);
        expect(randomInteger(4, 15)).toBe(14);
    });

    it("never produces the exclusive upper bound", () => {
        const values = new Set<number>();
        for (let i = 0; 2_000 > i; i += 1) {
            values.add(randomInteger(0, 2));
        }

        expect([...values].sort()).toEqual([0, 1]);
    });
});
