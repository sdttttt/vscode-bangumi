import { describe, expect, it } from "vitest";
import {
    BILIBILI_OFFSET_MS,
    dayDistance,
    dayKey,
    formatMinuteOfDay,
    isCurrentDay,
    minuteOfDay,
    nextDayStart,
    toBilibiliTime,
} from "@/utils/clock";

/**
 * 某个 UTC+8 墙上时钟时刻对应的毫秒时间戳。
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

describe("dayDistance", () => {
    it("is zero within the same UTC+8 day", () => {
        const now = atUtc8(2026, 10, 31, 0, 1);
        const later = atUtc8(2026, 10, 31, 23, 59);

        expect(dayDistance(now, later)).toBe(0);
    });

    it("is one across the next UTC+8 midnight", () => {
        const now = atUtc8(2026, 10, 31, 23, 59);
        const next = atUtc8(2026, 11, 1, 0, 1);

        expect(dayDistance(now, next)).toBe(1);
    });
});

describe("minuteOfDay", () => {
    it("counts the minutes since UTC+8 midnight", () => {
        expect(minuteOfDay(atUtc8(2026, 10, 31, 0, 0))).toBe(0);
        expect(minuteOfDay(atUtc8(2026, 10, 31, 9, 30))).toBe(570);
        expect(minuteOfDay(atUtc8(2026, 10, 31, 23, 59))).toBe(1439);
    });

    it("ignores the local time zone", () => {
        const epoch = Date.UTC(2026, 9, 31, 1, 30);

        expect(minuteOfDay(epoch)).toBe(570);
    });
});

describe("formatMinuteOfDay", () => {
    it("pads both parts to two digits", () => {
        expect(formatMinuteOfDay(0)).toBe("00:00");
        expect(formatMinuteOfDay(545)).toBe("09:05");
        expect(formatMinuteOfDay(1439)).toBe("23:59");
    });

    it("round trips with minuteOfDay", () => {
        const epoch = atUtc8(2026, 10, 31, 17, 12);

        expect(formatMinuteOfDay(minuteOfDay(epoch))).toBe("17:12");
    });
});
