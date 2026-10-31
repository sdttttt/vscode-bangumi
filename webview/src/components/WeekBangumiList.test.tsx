import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/preact";
import {
    groupByPubTime,
    WeekBangumiList,
} from "@webview/components/WeekBangumiList";
import type { SeasonPayload, WeekDayPayload } from "@shared/webview/protocol";
import { assets } from "@webview/test/fixtures";

/**
 * A season payload.
 *
 * @author sdttttt
 */
const season = (overrides: Partial<SeasonPayload> = {}): SeasonPayload => ({
    cover: "https://example.test/square.jpg",
    delay: false,
    delayIndex: "",
    delayReason: "",
    pubIndex: "第3话",
    pubTime: "20:00",
    title: "测试番剧",
    url: "https://example.test/ss1",
    ...overrides,
});

/**
 * A day payload.
 *
 * @author sdttttt
 */
const day = (overrides: Partial<WeekDayPayload> = {}): WeekDayPayload => ({
    date: "1-1",
    dayOfWeek: 1,
    label: "星期一",
    isToday: false,
    seasons: [season()],
    ...overrides,
});

describe("groupByPubTime", () => {
    it("groups adjacent seasons sharing a publication time", () => {
        const groups = groupByPubTime([
            season({ pubTime: "20:00", url: "a" }),
            season({ pubTime: "20:00", url: "b" }),
            season({ pubTime: "21:00", url: "c" }),
        ]);

        expect(groups).toHaveLength(2);
        expect(groups[0].seasons).toHaveLength(2);
        expect(groups[1].pubTime).toBe("21:00");
    });

    it("returns no group for an empty list", () => {
        expect(groupByPubTime([])).toHaveLength(0);
    });
});

describe("WeekBangumiList", () => {
    it("renders every given day", () => {
        render(
            <WeekBangumiList
                days={[
                    day({ date: "1-1", dayOfWeek: 1, label: "星期一" }),
                    day({ date: "1-2", dayOfWeek: 2, label: "星期二" }),
                ]}
                assets={assets}
            />
        );

        expect(screen.getByText("星期一")).toBeTruthy();
        expect(screen.getByText("星期二")).toBeTruthy();
    });

    it("marks the current day and shows its badge", () => {
        const { container } = render(
            <WeekBangumiList days={[day({ isToday: true })]} assets={assets} />
        );

        expect(container.querySelector(".item.today")).toBeTruthy();
        expect(
            container.querySelector(".today-badge img")?.getAttribute("src")
        ).toBe(assets.todayBadge);
    });

    it("hides the badge when no assets were sent", () => {
        const { container } = render(
            <WeekBangumiList
                days={[day({ isToday: true })]}
                assets={undefined}
            />
        );

        expect(container.querySelector(".today-badge")).toBeNull();
    });

    it("renders one time point per publication slot", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        seasons: [
                            season({ pubTime: "20:00", url: "a" }),
                            season({ pubTime: "20:00", url: "b" }),
                            season({ pubTime: "21:00", url: "c" }),
                        ],
                    }),
                ]}
                assets={assets}
            />
        );

        expect(container.querySelectorAll(".time-point")).toHaveLength(2);
        expect(screen.getByText("🕒20:00")).toBeTruthy();
        expect(screen.getByText("🕒21:00")).toBeTruthy();
    });

    it("marks a delayed bangumi with the delay block", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        seasons: [
                            season({
                                delay: true,
                                delayIndex: "第4话",
                                delayReason: "制作延期",
                            }),
                        ],
                    }),
                ]}
                assets={assets}
            />
        );

        expect(container.querySelector(".bangumi.delay")).toBeTruthy();
        expect(screen.getByText(/制作延期/)).toBeTruthy();
    });

    it("shows the published episode of a regular bangumi", () => {
        render(
            <WeekBangumiList
                days={[day({ seasons: [season({ pubIndex: "第9话" })] })]}
                assets={assets}
            />
        );

        expect(screen.getByText("第9话")).toBeTruthy();
    });

    it("links every season to its play page", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        seasons: [season({ url: "https://example.test/ss42" })],
                    }),
                ]}
                assets={assets}
            />
        );

        expect(
            container.querySelector('a[href="https://example.test/ss42"]')
        ).toBeTruthy();
    });

    it("renders nothing for an empty schedule", () => {
        const { container } = render(
            <WeekBangumiList days={[]} assets={assets} />
        );

        expect(container.querySelectorAll(".item")).toHaveLength(0);
    });
});
