import { describe, expect, it } from "vitest";
import {
    buildEvents,
    buildSchedule,
    describeEvent,
    horizonOf,
    STATUS_BAR_ICON,
    todayIndex,
    ROLLOVER_DELAY_MS,
} from "@/reminder/schedule";
import { weekBangumiData, wBangumi } from "@/test/mocks/fixtures/weekBangumi";

/**
 * 更新时刻，以 Unix 秒表示。
 *
 * @author sdttttt
 */
const PUB_TS = 1_800_000_000;

/**
 * 某个 `pub_ts` 偏移指定秒数后的毫秒时间戳。
 *
 * @author sdttttt
 */
function ms(pubTs: number): number {
    return pubTs * 1000;
}

describe("buildEvents", () => {
    it("yields one event per distinct publication instant", () => {
        const now = ms(PUB_TS) - 3_600_000;

        const events = buildEvents(
            [
                weekBangumiData({
                    seasons: [
                        wBangumi({ pub_ts: PUB_TS }),
                        wBangumi({ pub_ts: PUB_TS }),
                        wBangumi({ pub_ts: PUB_TS + 60 }),
                    ],
                }),
            ],
            now,
            0
        );

        expect(events).toHaveLength(2);
        expect(events[0].titles).toHaveLength(2);
        expect(events[1].titles).toHaveLength(1);
    });

    it("keeps the schedule order of the grouped titles", () => {
        const events = buildEvents(
            [
                weekBangumiData({
                    seasons: [
                        wBangumi({ title: "甲", pub_ts: PUB_TS }),
                        wBangumi({ title: "乙", pub_ts: PUB_TS }),
                    ],
                }),
            ],
            ms(PUB_TS) - 1_000,
            0
        );

        expect(events[0].titles).toEqual(["甲", "乙"]);
    });

    it("sorts the events by their firing instant", () => {
        const events = buildEvents(
            [
                weekBangumiData({
                    seasons: [
                        wBangumi({ pub_ts: PUB_TS + 600 }),
                        wBangumi({ pub_ts: PUB_TS + 60 }),
                        wBangumi({ pub_ts: PUB_TS + 3_600 }),
                    ],
                }),
            ],
            ms(PUB_TS) - 1_000,
            0
        );

        expect(events.map(event => event.pubTs)).toEqual([
            ms(PUB_TS + 60),
            ms(PUB_TS + 600),
            ms(PUB_TS + 3_600),
        ]);
    });

    it("skips a delayed season", () => {
        const events = buildEvents(
            [
                weekBangumiData({
                    seasons: [wBangumi({ pub_ts: PUB_TS, delay: 1 })],
                }),
            ],
            ms(PUB_TS) - 1_000,
            0
        );

        expect(events).toHaveLength(0);
    });

    it("skips a season without a publication instant", () => {
        const events = buildEvents(
            [weekBangumiData({ seasons: [wBangumi({ pub_ts: 0 })] })],
            ms(PUB_TS) - 1_000,
            0
        );

        expect(events).toHaveLength(0);
    });

    it("skips an episode that already published", () => {
        const events = buildEvents(
            [weekBangumiData({ seasons: [wBangumi({ pub_ts: PUB_TS })] })],
            ms(PUB_TS) + 1,
            0
        );

        expect(events).toHaveLength(0);
    });

    it("shifts the firing instant by the lead time", () => {
        const events = buildEvents(
            [weekBangumiData({ seasons: [wBangumi({ pub_ts: PUB_TS })] })],
            ms(PUB_TS) - 3_600_000,
            600
        );

        expect(events[0].at).toBe(ms(PUB_TS) - 600_000);
    });

    it("clamps the lead time to the remaining time", () => {
        const now = ms(PUB_TS) - 60_000;

        const events = buildEvents(
            [weekBangumiData({ seasons: [wBangumi({ pub_ts: PUB_TS })] })],
            now,
            3_600
        );

        expect(events[0].at).toBe(now);
    });

    it("treats a negative lead time as zero", () => {
        const events = buildEvents(
            [weekBangumiData({ seasons: [wBangumi({ pub_ts: PUB_TS })] })],
            ms(PUB_TS) - 3_600_000,
            -60
        );

        expect(events[0].at).toBe(ms(PUB_TS));
    });

    it("carries the publication wall clock", () => {
        const events = buildEvents(
            [
                weekBangumiData({
                    seasons: [wBangumi({ pub_ts: PUB_TS, pub_time: "19:30" })],
                }),
            ],
            ms(PUB_TS) - 1_000,
            0
        );

        expect(events[0].pubTime).toBe("19:30");
    });

    it("scans every day of the schedule", () => {
        const events = buildEvents(
            [
                weekBangumiData({ seasons: [wBangumi({ pub_ts: PUB_TS })] }),
                weekBangumiData({
                    seasons: [wBangumi({ pub_ts: PUB_TS + 86_400 })],
                }),
            ],
            ms(PUB_TS) - 1_000,
            0
        );

        expect(events).toHaveLength(2);
    });

    it("accepts an empty schedule", () => {
        expect(buildEvents([], Date.now(), 0)).toHaveLength(0);
    });
});

describe("horizonOf", () => {
    it("covers the rest of today and the whole of tomorrow", () => {
        const now = Date.UTC(2026, 9, 31, 4, 0);

        /* 2026-11-02 00:00 UTC+8，也就是明天的结束时刻。 */
        expect(horizonOf(now)).toBe(Date.UTC(2026, 10, 2) - 8 * 3_600_000);
    });
});

describe("buildSchedule", () => {
    it("arms the rollover after the next day starts", () => {
        const now = Date.UTC(2026, 9, 31, 4, 0);

        const schedule = buildSchedule([], now, 0);

        expect(schedule.rolloverAt).toBe(
            Date.UTC(2026, 10, 1) - 8 * 3_600_000 + ROLLOVER_DELAY_MS
        );
    });

    it("drops events beyond the horizon", () => {
        const now = Date.UTC(2026, 9, 31, 4, 0);
        const beyond = Math.floor(horizonOf(now) / 1000) + 3_600;

        const schedule = buildSchedule(
            [weekBangumiData({ seasons: [wBangumi({ pub_ts: beyond })] })],
            now,
            0
        );

        expect(schedule.events).toHaveLength(0);
    });
});

describe("todayIndex", () => {
    it("finds the day flagged by the API", () => {
        const days = [
            weekBangumiData({ is_today: 0 }),
            weekBangumiData({ is_today: 1 }),
        ];

        expect(todayIndex(days, Date.now())).toBe(1);
    });

    it("falls back to date_ts", () => {
        const now = Date.UTC(2026, 9, 31, 4, 0);
        const days = [
            weekBangumiData({
                is_today: 0,
                date_ts: Math.floor(Date.UTC(2026, 9, 29, 16) / 1000),
            }),
            weekBangumiData({
                is_today: 0,
                date_ts: Math.floor(Date.UTC(2026, 9, 30, 16) / 1000),
            }),
        ];

        expect(todayIndex(days, now)).toBe(1);
    });

    it("returns undefined when no day matches", () => {
        expect(todayIndex([], Date.now())).toBeUndefined();
    });
});

describe("describeEvent", () => {
    /** 2026-11-01 12:00 UTC+8。 */
    const now = Date.UTC(2026, 10, 1, 4, 0);

    it("leads with the time so the width stays stable", () => {
        expect(
            describeEvent(
                { at: 0, pubTs: now, pubTime: "20:00", titles: ["甲"] },
                now
            )
        ).toBe(`${STATUS_BAR_ICON} 20:00 甲`);
    });

    it("counts a group instead of listing it", () => {
        expect(
            describeEvent(
                { at: 0, pubTs: now, pubTime: "20:00", titles: ["甲", "乙"] },
                now
            )
        ).toBe(`${STATUS_BAR_ICON} 20:00 2部番`);
    });

    it("marks an update that happens tomorrow", () => {
        const tomorrow = now + 24 * 60 * 60 * 1000;

        expect(
            describeEvent(
                { at: 0, pubTs: tomorrow, pubTime: "09:00", titles: ["甲"] },
                now
            )
        ).toBe(`${STATUS_BAR_ICON} 明日 09:00 甲`);
    });

    it("drops the book quotes", () => {
        const text = describeEvent(
            { at: 0, pubTs: now, pubTime: "20:00", titles: ["甲"] },
            now
        );

        expect(text).not.toContain("《");
    });

    it("truncates a long title on a code point boundary", () => {
        const text = describeEvent(
            {
                at: 0,
                pubTs: now,
                pubTime: "20:00",
                titles: ["一个特别特别特别长的番剧名称"],
            },
            now
        );

        expect(text).toBe(`${STATUS_BAR_ICON} 20:00 一个特别特别特…`);
    });

    it("keeps an emoji title intact", () => {
        const text = describeEvent(
            {
                at: 0,
                pubTs: now,
                pubTime: "20:00",
                titles: ["番剧🎬🎬🎬🎬🎬🎬🎬🎬🎬"],
            },
            now
        );

        expect(text).not.toContain("\uFFFD");
        expect(text.endsWith("…")).toBe(true);
    });
});
