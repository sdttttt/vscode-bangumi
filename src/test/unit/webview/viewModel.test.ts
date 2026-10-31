import { describe, expect, it } from "vitest";
import {
    HIDDEN_DAYS,
    toBangumiPayloads,
    toSeasonPayload,
    toWeekDayPayloads,
} from "@/webview/viewModel";
import { bangumi } from "@/test/mocks/fixtures/bangumi";
import {
    wBangumi,
    weekBangumi,
    weekBangumiData,
} from "@/test/mocks/fixtures/weekBangumi";

describe("toSeasonPayload", () => {
    it("maps the api fields to their render names", () => {
        const payload = toSeasonPayload(wBangumi());

        expect(payload.title).toBe("测试番剧");
        expect(payload.pubTime).toBe("20:00");
        expect(payload.pubIndex).toBe("第3话");
        expect(payload.url).toBe("https://www.bilibili.com/bangumi/play/ss1");
    });

    it("prefers the square cover for the list thumbnail", () => {
        const payload = toSeasonPayload(wBangumi());

        expect(payload.cover).toBe(
            "https://i0.hdslb.com/bfs/cover/a-square.jpg"
        );
    });

    it("turns the numeric delay flag into a boolean", () => {
        expect(toSeasonPayload(wBangumi({ delay: 1 })).delay).toBe(true);
        expect(toSeasonPayload(wBangumi({ delay: 0 })).delay).toBe(false);
    });

    it("keeps the delay details", () => {
        const payload = toSeasonPayload(
            wBangumi({
                delay: 1,
                delay_index: "第4话",
                delay_reason: "制作延期",
            })
        );

        expect(payload.delayIndex).toBe("第4话");
        expect(payload.delayReason).toBe("制作延期");
    });
});

describe("toWeekDayPayloads", () => {
    it("keeps every day when history is enabled", () => {
        const days = toWeekDayPayloads(weekBangumi(), true);

        expect(days).toHaveLength(7);
        expect(days[0].dayOfWeek).toBe(1);
    });

    it("drops the past days when history is disabled", () => {
        const days = toWeekDayPayloads(weekBangumi(), false);

        expect(days).toHaveLength(7 - HIDDEN_DAYS);
        expect(days[0].dayOfWeek).toBe(HIDDEN_DAYS + 1);
    });

    it("returns nothing for an empty schedule", () => {
        expect(toWeekDayPayloads([], true)).toHaveLength(0);
    });

    it("flags the day the API marked as today", () => {
        const days = toWeekDayPayloads(
            [
                weekBangumiData({ is_today: 1 }),
                weekBangumiData({ is_today: 0, date_ts: 0, date: "13-32" }),
            ],
            true
        );

        expect(days[0].isToday).toBe(true);
        expect(days[1].isToday).toBe(false);
    });

    it("resolves today through date_ts, not the local time zone", () => {
        const now = Date.UTC(2026, 9, 31, 4, 0);

        const days = toWeekDayPayloads(
            [
                weekBangumiData({
                    is_today: 0,
                    date_ts: Math.floor(Date.UTC(2026, 9, 31) / 1000),
                }),
            ],
            true,
            now
        );

        expect(days[0].isToday).toBe(true);
    });

    it("localises the weekday label", () => {
        const days = toWeekDayPayloads(weekBangumi(), true);

        expect(days[0].label).toBe("星期一");
        expect(days[6].label).toBe("星期日");
    });

    it("carries the seasons of every day", () => {
        const days = toWeekDayPayloads(weekBangumi(), true);

        expect(days[0].seasons).toHaveLength(1);
        expect(days[0].seasons[0].title).toBe("第1天的番剧");
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
