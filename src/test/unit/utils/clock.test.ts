import { describe, expect, it } from "vitest";
import {
    BILIBILI_OFFSET_MS,
    dayKey,
    isCurrentDay,
    nextDayStart,
    toBilibiliTime,
} from "@/utils/clock";

/**
 * Epoch ms of a UTC+8 wall clock instant.
 *
 * @author sdttttt
 */
function atUtc8(
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0
): number {
    return Date.UTC(year, month - 1, day, hour, minute) - BILIBILI_OFFSET_MS;
}

describe("toBilibiliTime", () => {
    it("shifts an instant onto the UTC+8 wall clock", () => {
        const epoch = Date.UTC(2026, 9, 31, 4, 0);

        expect(toBilibiliTime(epoch)).toBe(epoch + BILIBILI_OFFSET_MS);
    });
});

describe("dayKey", () => {
    it("formats the UTC+8 day without padding", () => {
        expect(dayKey(atUtc8(2026, 1, 3, 12))).toBe("1-3");
        expect(dayKey(atUtc8(2026, 10, 31, 23, 59))).toBe("10-31");
    });

    it("rolls over at UTC+8 midnight, not UTC midnight", () => {
        expect(dayKey(atUtc8(2026, 10, 31, 23, 59))).toBe("10-31");
        expect(dayKey(atUtc8(2026, 11, 1, 0, 1))).toBe("11-1");
    });
});

describe("nextDayStart", () => {
    it("returns the next UTC+8 midnight", () => {
        const now = atUtc8(2026, 10, 31, 12);

        expect(nextDayStart(now)).toBe(atUtc8(2026, 11, 1, 0));
    });

    it("moves to the following day when already past midnight", () => {
        const now = atUtc8(2026, 11, 1, 0, 30);

        expect(nextDayStart(now)).toBe(atUtc8(2026, 11, 2, 0));
    });
});

describe("isCurrentDay", () => {
    it("trusts the is_today flag", () => {
        const day = { date: "1-1", date_ts: 0, is_today: 1 };

        expect(isCurrentDay(day, atUtc8(2030, 5, 5, 12))).toBe(true);
    });

    it("falls back to date_ts when the flag is missing", () => {
        const now = atUtc8(2026, 10, 31, 12);
        const day = {
            date: "6-6",
            date_ts: Math.floor(atUtc8(2026, 10, 31) / 1000),
            is_today: 0,
        };

        expect(isCurrentDay(day, now)).toBe(true);
    });

    it("rejects a neighbouring day", () => {
        const now = atUtc8(2026, 10, 31, 12);
        const day = {
            date: "10-30",
            date_ts: Math.floor(atUtc8(2026, 10, 30) / 1000),
            is_today: 0,
        };

        expect(isCurrentDay(day, now)).toBe(false);
    });

    it("falls back to the date string without a timestamp", () => {
        const now = atUtc8(2026, 10, 31, 12);

        expect(
            isCurrentDay({ date: "10-31", date_ts: 0, is_today: 0 }, now)
        ).toBe(true);
        expect(
            isCurrentDay({ date: "4-1", date_ts: 0, is_today: 0 }, now)
        ).toBe(false);
    });
});
