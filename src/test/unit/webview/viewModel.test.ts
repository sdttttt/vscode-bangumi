import { describe, expect, it } from "vitest";
import {
    toBangumiPayloads,
    toSeasonPayload,
    toWeekDayPayloads,
} from "@/webview/viewModel";
import { bangumi } from "@/test/mocks/fixtures/bangumi";
import { bgmCalendar } from "@/test/mocks/fixtures/bgm";
import {
    wBangumi,
    weekBangumi,
    weekBangumiData,
} from "@/test/mocks/fixtures/weekBangumi";
import {
    toScheduleFromBgmTv,
    toScheduleFromBilibili,
    type ScheduleItem,
} from "@/request/schedule";

describe("toSeasonPayload", () => {
    it("maps a bilibili item to its render names", () => {
        const schedule = toScheduleFromBilibili([weekBangumiData()]);
        const payload = toSeasonPayload(schedule.days[0].items[0]);

        expect(payload.title).toBe("测试番剧");
        expect(payload.pubTime).toBe("20:00");
        expect(payload.pubIndex).toBe("第3话");
        expect(payload.url).toBe("https://www.bilibili.com/bangumi/play/ss1");
        expect(payload.cover).toBe(
            "https://i0.hdslb.com/bfs/cover/a-square.jpg"
        );
    });

    it("turns the numeric delay flag into a boolean", () => {
        const delayed = toScheduleFromBilibili([
            weekBangumiData({ seasons: [wBangumi({ delay: 1 })] }),
        ]);
        const regular = toScheduleFromBilibili([
            weekBangumiData({ seasons: [wBangumi({ delay: 0 })] }),
        ]);

        expect(toSeasonPayload(delayed.days[0].items[0]).delay).toBe(true);
        expect(toSeasonPayload(regular.days[0].items[0]).delay).toBe(false);
    });

    it("moves the progress of a delayed item into the delay slot", () => {
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

        const payload = toSeasonPayload(schedule.days[0].items[0]);

        expect(payload.delayIndex).toBe("第4话");
        expect(payload.delayReason).toBe("制作延期");
        expect(payload.pubIndex).toBe("");
    });

    it("keeps the score and the original title when given", () => {
        const item: ScheduleItem = {
            title: "中文名",
            originalTitle: "原名",
            cover: "https://example.test/a.jpg",
            url: "https://example.test/1",
            pubTime: "",
            progress: "2026-10-01",
            delay: false,
            delayReason: "",
            score: 8,
        };

        const payload = toSeasonPayload(item);

        expect(payload.originalTitle).toBe("原名");
        expect(payload.score).toBe(8);
    });

    it("omits the optional fields when the source has none", () => {
        const item: ScheduleItem = {
            title: "中文名",
            cover: "",
            url: "https://example.test/1",
            pubTime: "",
            progress: "",
            delay: false,
            delayReason: "",
        };

        const payload = toSeasonPayload(item);

        expect("originalTitle" in payload).toBe(false);
        expect("score" in payload).toBe(false);
    });
});

describe("toWeekDayPayloads", () => {
    it("keeps every day when history is enabled", () => {
        const days = toWeekDayPayloads(
            toScheduleFromBilibili(weekBangumi()),
            true
        );

        expect(days).toHaveLength(7);
        expect(days[0].dayOfWeek).toBe(1);
    });

    it("drops the days before today when history is disabled", () => {
        const schedule = toScheduleFromBilibili(
            [
                weekBangumiData({
                    date: "10-29",
                    day_of_week: 4,
                    is_today: 0,
                }),
                weekBangumiData({
                    date: "10-30",
                    day_of_week: 5,
                    is_today: 0,
                }),
                weekBangumiData({
                    date: "10-31",
                    day_of_week: 6,
                    is_today: 1,
                }),
                weekBangumiData({ date: "11-1", day_of_week: 7, is_today: 0 }),
                weekBangumiData({ date: "11-2", day_of_week: 1, is_today: 0 }),
            ],
            Date.UTC(2026, 9, 31, 4, 0)
        );

        const days = toWeekDayPayloads(schedule, false);

        expect(days).toHaveLength(3);
        expect(days[0].isToday).toBe(true);
        expect(days.map(day => day.date)).toEqual(["10-31", "11-1", "11-2"]);
    });

    it("does not depend on how many past days the api returns", () => {
        const past = Array.from({ length: 6 }, (_, index) =>
            weekBangumiData({
                date: `10-${25 + index}`,
                is_today: 0,
                date_ts: 0,
            })
        );
        const today = weekBangumiData({ date: "10-31", is_today: 1 });
        const future = weekBangumiData({ date: "11-1", is_today: 0 });

        const days = toWeekDayPayloads(
            toScheduleFromBilibili([...past, today, future]),
            false
        );

        expect(days).toHaveLength(2);
        expect(days[0].isToday).toBe(true);
    });

    it("keeps every day when today is missing from the response", () => {
        const schedule = toScheduleFromBilibili(weekBangumi());

        expect(toWeekDayPayloads(schedule, false)).toHaveLength(7);
    });

    it("returns nothing for an empty schedule", () => {
        const schedule = toScheduleFromBilibili([]);

        expect(toWeekDayPayloads(schedule, true)).toHaveLength(0);
    });

    it("flags the day the API marked as today", () => {
        const days = toWeekDayPayloads(
            toScheduleFromBilibili([
                weekBangumiData({ is_today: 1 }),
                weekBangumiData({ is_today: 0, date_ts: 0, date: "13-32" }),
            ]),
            true
        );

        expect(days[0].isToday).toBe(true);
        expect(days[1].isToday).toBe(false);
    });

    it("resolves today through date_ts, not the local time zone", () => {
        const now = Date.UTC(2026, 9, 31, 4, 0);
        const days = toWeekDayPayloads(
            toScheduleFromBilibili(
                [
                    weekBangumiData({
                        is_today: 0,
                        date_ts: Math.floor(Date.UTC(2026, 9, 31) / 1000),
                    }),
                ],
                now
            ),
            true
        );

        expect(days[0].isToday).toBe(true);
    });

    it("localises the weekday label", () => {
        const days = toWeekDayPayloads(
            toScheduleFromBilibili(weekBangumi()),
            true
        );

        expect(days[0].label).toBe("星期一");
        expect(days[6].label).toBe("星期日");
    });

    it("carries the seasons of every day", () => {
        const days = toWeekDayPayloads(
            toScheduleFromBilibili(weekBangumi()),
            true
        );

        expect(days[0].seasons).toHaveLength(1);
        expect(days[0].seasons[0].title).toBe("第1天的番剧");
    });

    it("tags every day with the source", () => {
        const days = toWeekDayPayloads(
            toScheduleFromBilibili(weekBangumi()),
            true
        );

        expect(days.every(day => "bilibili" === day.source)).toBe(true);
    });

    it("always renders seven Bangumi days, ignoring history", () => {
        const schedule = toScheduleFromBgmTv(
            bgmCalendar(),
            Date.UTC(2026, 9, 31, 4, 0)
        );

        expect(toWeekDayPayloads(schedule, false)).toHaveLength(7);
        expect(toWeekDayPayloads(schedule, true)).toHaveLength(7);
    });
});

describe("toBangumiPayloads", () => {
    it("maps the api fields to their render names", () => {
        const [payload] = toBangumiPayloads([bangumi()]);

        expect(payload.title).toBe("测试番剧");
        expect(payload.indexShow).toBe("全12话");
        expect(payload.order).toBe("1.2万追番");
        expect(payload.link).toBe("https://www.bilibili.com/bangumi/play/ss1");
    });

    it("turns the numeric finish flag into a boolean", () => {
        const [finished] = toBangumiPayloads([bangumi({ is_finish: 1 })]);
        const [running] = toBangumiPayloads([bangumi({ is_finish: 0 })]);

        expect(finished.finish).toBe(true);
        expect(running.finish).toBe(false);
    });

    it("keeps an empty badge as an empty string", () => {
        const [payload] = toBangumiPayloads([bangumi({ badge: "" })]);

        expect(payload.badge).toBe("");
    });

    it("returns nothing for an empty list", () => {
        expect(toBangumiPayloads([])).toHaveLength(0);
    });
});
