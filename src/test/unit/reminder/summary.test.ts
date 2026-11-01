import { describe, expect, it } from "vitest";
import {
    describeSummary,
    describeSummaryLabel,
    describeSummaryTooltip,
    summarizeToday,
    SUMMARY_EMPTY_TEXT,
    SUMMARY_ICON,
    SUMMARY_TOOLTIP_TITLES,
} from "@/reminder/summary";
import { STATUS_BAR_NAME_COLUMNS } from "@/reminder/schedule";
import type { ScheduleDay, WeeklySchedule } from "@/request/schedule";

/**
 * 构造一份统一模型，只有第一天是今天。
 *
 * @author sdttttt
 */
function weekSchedule(
    titles: Array<string>,
    overrides: Partial<ScheduleDay> = {}
): WeeklySchedule {
    return {
        source: "bangumi",
        hasSlots: false,
        days: [
            {
                dayOfWeek: 6,
                date: "10-31",
                isToday: true,
                items: titles.map(title => ({
                    title,
                    cover: "",
                    url: "",
                    pubTime: "",
                    progress: "",
                    delay: false,
                    delayReason: "",
                })),
                ...overrides,
            },
            {
                dayOfWeek: 7,
                date: "11-1",
                isToday: false,
                items: [],
            },
        ],
    };
}

describe("summarizeToday", () => {
    it("collects the titles of the day flagged as today", () => {
        const summary = summarizeToday(weekSchedule(["甲", "乙"]));

        expect(summary).toEqual({ date: "10-31", titles: ["甲", "乙"] });
    });

    it("keeps an empty list instead of hiding the day", () => {
        expect(summarizeToday(weekSchedule([]))?.titles).toEqual([]);
    });

    it("returns undefined when no day is flagged", () => {
        expect(
            summarizeToday(weekSchedule(["甲"], { isToday: false }))
        ).toBeUndefined();
    });
});

describe("describeSummary", () => {
    it("leads with the icon and the section name", () => {
        expect(describeSummary({ date: "10-31", titles: ["甲"] })).toBe(
            `${SUMMARY_ICON} 今日 甲`
        );
    });

    it("truncates a long title to the status bar budget", () => {
        /* 半角字符各占一列，预期值因此可以直接按列数推算。 */
        const long = "a".repeat(STATUS_BAR_NAME_COLUMNS + 5);

        const text = describeSummary({ date: "10-31", titles: [long] });

        expect(text).toBe(
            `${SUMMARY_ICON} 今日 ${"a".repeat(STATUS_BAR_NAME_COLUMNS - 1)}…`
        );
    });

    it("collapses several titles into a count", () => {
        expect(
            describeSummary({ date: "10-31", titles: ["甲", "乙", "丙"] })
        ).toBe(`${SUMMARY_ICON} 今日 3部番`);
    });

    it("says so when nothing airs today", () => {
        expect(describeSummary({ date: "10-31", titles: [] })).toBe(
            `${SUMMARY_ICON} ${SUMMARY_EMPTY_TEXT}`
        );
    });
});

describe("describeSummaryTooltip", () => {
    it("leads with the date", () => {
        const tooltip = describeSummaryTooltip({
            date: "10-31",
            titles: ["甲", "乙"],
        });

        expect(tooltip).toBe("今日（10-31）\n《甲》、《乙》");
    });

    it("keeps only the date when nothing airs today", () => {
        expect(describeSummaryTooltip({ date: "10-31", titles: [] })).toBe(
            "今日（10-31）"
        );
    });

    it("caps a long list and reports the total", () => {
        const titles = Array.from(
            { length: SUMMARY_TOOLTIP_TITLES + 3 },
            (_, index) => `番${index}`
        );

        const tooltip = describeSummaryTooltip({ date: "10-31", titles });

        expect(tooltip.endsWith(`等 ${titles.length} 部`)).toBe(true);
        expect(tooltip).not.toContain(`《番${SUMMARY_TOOLTIP_TITLES}》`);
    });
});

describe("describeSummaryLabel", () => {
    it("reads the whole list", () => {
        expect(
            describeSummaryLabel({ date: "10-31", titles: ["甲", "乙"] })
        ).toBe("今日（10-31）有 2 部番剧更新：《甲》、《乙》");
    });

    it("reads an empty day as such", () => {
        expect(describeSummaryLabel({ date: "10-31", titles: [] })).toBe(
            "今日（10-31）没有番剧更新"
        );
    });
});
