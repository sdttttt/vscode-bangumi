import { describe, expect, it } from "vitest";
import {
    toScheduleFromBgmTv,
    toScheduleFromBilibili,
} from "@/request/schedule";
import {
    bgmCalendar,
    bgmCalendarDay,
    bgmSubject,
} from "@/test/mocks/fixtures/bgm";
import {
    wBangumi,
    weekBangumi,
    weekBangumiData,
} from "@/test/mocks/fixtures/weekBangumi";

/**
 * 2026-10-31 是星期六，UTC+8 的中午。
 *
 * @author sdttttt
 */
const SATURDAY_NOON = Date.UTC(2026, 9, 31, 4, 0);

describe("toScheduleFromBilibili", () => {
    it("keeps the source and the slot flag", () => {
        const schedule = toScheduleFromBilibili(weekBangumi());

        expect(schedule.source).toBe("bilibili");
        expect(schedule.hasSlots).toBe(true);
    });

    it("carries every day and every season", () => {
        const schedule = toScheduleFromBilibili(weekBangumi());

        expect(schedule.days).toHaveLength(7);
        expect(schedule.days[0].items).toHaveLength(1);
        expect(schedule.days[0].items[0].title).toBe("第1天的番剧");
    });

    it("falls back to the wide cover when the square one is missing", () => {
        const schedule = toScheduleFromBilibili([
            weekBangumiData({
                seasons: [
                    wBangumi({
                        square_cover: "",
                        cover: "https://i0.hdslb.com/bfs/cover/wide.jpg",
                    }),
                ],
            }),
        ]);

        expect(schedule.days[0].items[0].cover).toBe(
            "https://i0.hdslb.com/bfs/cover/wide.jpg"
        );
    });

    it("keeps the publication slot of each season", () => {
        const schedule = toScheduleFromBilibili([weekBangumiData()]);

        expect(schedule.days[0].items[0].pubTime).toBe("20:00");
        expect(schedule.days[0].items[0].progress).toBe("第3话");
    });

    it("normalises missing string fields to empty strings", () => {
        /*
         * 复现（L8，见 TODO.md）：实测接口在 delay=0 时整体省略 delay 字段，
         * pub_time 一旦缺失，Webview 的 pubTimeMinute 会在渲染期对
         * undefined.trim() 抛错崩掉整个周番表。
         */
        const schedule = toScheduleFromBilibili([
            weekBangumiData({
                seasons: [
                    wBangumi({
                        title: undefined as unknown as string,
                        pub_time: undefined as unknown as string,
                        pub_index: undefined as unknown as string,
                        delay_index: undefined as unknown as string,
                        delay_reason: undefined as unknown as string,
                    }),
                ],
            }),
        ]);

        const item = schedule.days[0].items[0];

        expect(item.title).toBe("");
        expect(item.pubTime).toBe("");
        expect(item.progress).toBe("");
        expect(item.delayReason).toBe("");
    });

    it("uses the delay progress when the season was postponed", () => {
        const schedule = toScheduleFromBilibili([
            weekBangumiData({
                seasons: [
                    wBangumi({
                        delay: 1,
                        delay_index: "第4话",
                        delay_reason: "制作延期",
                    }),
                ],
            }),
        ]);

        const item = schedule.days[0].items[0];

        expect(item.delay).toBe(true);
        expect(item.progress).toBe("第4话");
        expect(item.delayReason).toBe("制作延期");
    });

    it("flags the day the API marked as today", () => {
        const schedule = toScheduleFromBilibili(
            [
                weekBangumiData({ date: "10-30", is_today: 0 }),
                weekBangumiData({ date: "10-31", is_today: 1 }),
            ],
            SATURDAY_NOON
        );

        expect(schedule.days[0].isToday).toBe(false);
        expect(schedule.days[1].isToday).toBe(true);
    });

    it("returns no day for an empty response", () => {
        expect(toScheduleFromBilibili([]).days).toHaveLength(0);
    });
});

describe("toScheduleFromBgmTv", () => {
    it("drops items without an air date instead of crashing", () => {
        /*
         * 复现（M4，见 TODO.md）：items 里混进 null 或缺 air_date 的条目
         * 时，排序比较器直接读不到字段抛 TypeError，整页渲染失败。
         */
        const days = [bgmCalendarDay({ items: [bgmSubject(), null as never] })];

        const schedule = toScheduleFromBgmTv(days, SATURDAY_NOON);

        const total = schedule.days.reduce(
            (count, day) => count + day.items.length,
            0
        );
        expect(total).toBe(1);
    });

    it("marks the source as slot-less", () => {
        const schedule = toScheduleFromBgmTv(bgmCalendar(), SATURDAY_NOON);

        expect(schedule.source).toBe("bangumi");
        expect(schedule.hasSlots).toBe(false);
    });

    it("always returns seven days ordered by weekday", () => {
        const schedule = toScheduleFromBgmTv(bgmCalendar(), SATURDAY_NOON);

        expect(schedule.days.map(day => day.dayOfWeek)).toEqual([
            1, 2, 3, 4, 5, 6, 7,
        ]);
    });

    it("leaves the publication slot empty", () => {
        const schedule = toScheduleFromBgmTv(bgmCalendar(), SATURDAY_NOON);

        expect(schedule.days[0].items[0].pubTime).toBe("");
    });

    it("puts the first air date into the progress slot", () => {
        const schedule = toScheduleFromBgmTv(
            [
                bgmCalendarDay({
                    items: [bgmSubject({ air_date: "2026-10-01" })],
                }),
            ],
            SATURDAY_NOON
        );

        expect(schedule.days[0].items[0].progress).toBe("2026-10-01");
    });

    it("upgrades the http addresses of the api", () => {
        const schedule = toScheduleFromBgmTv(bgmCalendar(), SATURDAY_NOON);
        const item = schedule.days[0].items[0];

        expect(item.cover).toBe("https://lain.bgm.tv/pic/cover/c/a.jpg");
        expect(item.url).toBe("https://bgm.tv/subject/1");
    });

    it("prefers the common cover over the tiny grid one", () => {
        const schedule = toScheduleFromBgmTv(bgmCalendar(), SATURDAY_NOON);

        expect(schedule.days[0].items[0].cover).toContain("/cover/c/");
    });

    it("falls back to the original name when the chinese one is missing", () => {
        const schedule = toScheduleFromBgmTv(
            [
                bgmCalendarDay({
                    items: [bgmSubject({ name: "テスト", name_cn: "" })],
                }),
            ],
            SATURDAY_NOON
        );

        const item = schedule.days[0].items[0];

        expect(item.title).toBe("テスト");
        expect("originalTitle" in item).toBe(false);
    });

    it("keeps the original name as a subtitle when it differs", () => {
        const schedule = toScheduleFromBgmTv(
            [
                bgmCalendarDay({
                    items: [bgmSubject({ name: "テスト", name_cn: "测试" })],
                }),
            ],
            SATURDAY_NOON
        );

        expect(schedule.days[0].items[0].originalTitle).toBe("テスト");
    });

    it("falls back through the other sizes when the common one is missing", () => {
        const schedule = toScheduleFromBgmTv(
            [
                bgmCalendarDay({
                    items: [
                        bgmSubject({
                            images: {
                                large: "",
                                common: "",
                                medium: "http://lain.bgm.tv/m.jpg",
                                small: "http://lain.bgm.tv/s.jpg",
                                grid: "",
                            },
                        }),
                    ],
                }),
            ],
            SATURDAY_NOON
        );

        expect(schedule.days[0].items[0].cover).toBe(
            "https://lain.bgm.tv/m.jpg"
        );
    });

    it("falls all the way back to the grid cover", () => {
        const schedule = toScheduleFromBgmTv(
            [
                bgmCalendarDay({
                    items: [
                        bgmSubject({
                            images: {
                                large: "",
                                common: "",
                                medium: "",
                                small: "",
                                grid: "http://lain.bgm.tv/g.jpg",
                            },
                        }),
                    ],
                }),
            ],
            SATURDAY_NOON
        );

        expect(schedule.days[0].items[0].cover).toBe(
            "https://lain.bgm.tv/g.jpg"
        );
    });

    it("keeps an empty cover when the api has no image", () => {
        const schedule = toScheduleFromBgmTv(
            [bgmCalendarDay({ items: [bgmSubject({ images: null })] })],
            SATURDAY_NOON
        );

        expect(schedule.days[0].items[0].cover).toBe("");
    });

    it("keeps the score when the api has one", () => {
        const schedule = toScheduleFromBgmTv(
            [
                bgmCalendarDay({
                    items: [bgmSubject({ rating: { score: 7.5, total: 10 } })],
                }),
            ],
            SATURDAY_NOON
        );

        expect(schedule.days[0].items[0].score).toBe(7.5);
    });

    it("drops the score when nobody rated the subject", () => {
        const schedule = toScheduleFromBgmTv(
            [
                bgmCalendarDay({
                    items: [bgmSubject({ rating: { score: 0, total: 0 } })],
                }),
            ],
            SATURDAY_NOON
        );

        expect("score" in schedule.days[0].items[0]).toBe(false);
    });

    it("drops the score when the api has no rating at all", () => {
        const schedule = toScheduleFromBgmTv(
            [bgmCalendarDay({ items: [bgmSubject({ rating: undefined })] })],
            SATURDAY_NOON
        );

        expect("score" in schedule.days[0].items[0]).toBe(false);
    });

    it("marks the weekday of the current day", () => {
        const schedule = toScheduleFromBgmTv(bgmCalendar(), SATURDAY_NOON);
        const today = schedule.days.filter(day => day.isToday);

        expect(today).toHaveLength(1);
        expect(today[0].dayOfWeek).toBe(6);
    });

    it("labels a sunday as weekday seven", () => {
        const schedule = toScheduleFromBgmTv(
            bgmCalendar(),
            Date.UTC(2026, 10, 1, 4, 0)
        );

        expect(schedule.days.find(day => day.isToday)?.dayOfWeek).toBe(7);
    });

    it("derives the date of every day from the current one", () => {
        const schedule = toScheduleFromBgmTv(bgmCalendar(), SATURDAY_NOON);

        /* 10-31 是周六，因此周六当天、周一是 10-26、周日是 11-1。 */
        expect(schedule.days[5].date).toBe("10-31");
        expect(schedule.days[0].date).toBe("10-26");
        expect(schedule.days[6].date).toBe("11-1");
    });

    it("sorts the items of a day by the first air date, newest first", () => {
        const schedule = toScheduleFromBgmTv(
            [
                bgmCalendarDay({
                    items: [
                        bgmSubject({
                            name: "旧",
                            name_cn: "旧",
                            air_date: "2026-01-01",
                        }),
                        bgmSubject({
                            name: "新",
                            name_cn: "新",
                            air_date: "2026-10-01",
                        }),
                        bgmSubject({
                            name: "中",
                            name_cn: "中",
                            air_date: "2026-05-01",
                        }),
                    ],
                }),
            ],
            SATURDAY_NOON
        );

        expect(schedule.days[0].items.map(item => item.title)).toEqual([
            "新",
            "中",
            "旧",
        ]);
    });

    it("breaks an air date tie by the original name", () => {
        const schedule = toScheduleFromBgmTv(
            [
                bgmCalendarDay({
                    items: [
                        bgmSubject({ name: "b", name_cn: "乙" }),
                        bgmSubject({ name: "a", name_cn: "甲" }),
                    ],
                }),
            ],
            SATURDAY_NOON
        );

        expect(schedule.days[0].items.map(item => item.title)).toEqual([
            "甲",
            "乙",
        ]);
    });

    it("merges the days the api splits across entries", () => {
        const schedule = toScheduleFromBgmTv(
            [...bgmCalendar(), ...bgmCalendar()],
            SATURDAY_NOON
        );

        expect(schedule.days[0].items).toHaveLength(2);
    });

    it("returns seven empty days for an empty response", () => {
        const schedule = toScheduleFromBgmTv([], SATURDAY_NOON);

        expect(schedule.days).toHaveLength(7);
        expect(schedule.days.every(day => 0 === day.items.length)).toBe(true);
    });
});
