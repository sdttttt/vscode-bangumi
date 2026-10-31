import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/preact";
import {
    describeGap,
    describeNow,
    groupByPubTime,
    markerIndex,
    nextGapMinutes,
    NOW_DONE_LABEL,
    NOW_EMPTY_LABEL,
    NOW_LABEL,
    NOW_TICK_MS,
    pubTimeMinute,
    WeekBangumiList,
} from "@webview/components/WeekBangumiList";
import type { SeasonGroup } from "@webview/components/WeekBangumiList";
import type { SeasonPayload, WeekDayPayload } from "@shared/webview/protocol";
import { assets } from "@webview/test/fixtures";

/**
 * A UTC+8 instant used to pin the "you are here" marker.
 *
 * @author sdttttt
 */
const AT_09_30 = Date.UTC(2026, 9, 31, 1, 30);

/**
 * A UTC+8 instant after every publication slot of the fixture.
 *
 * @author sdttttt
 */
const AT_23_00 = Date.UTC(2026, 9, 31, 15, 0);

/**
 * A UTC+8 instant before every publication slot of the fixture.
 *
 * @author sdttttt
 */
const AT_08_00 = Date.UTC(2026, 9, 31, 0, 0);

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
        expect(screen.getByText("20:00")).toBeTruthy();
        expect(screen.getByText("21:00")).toBeTruthy();
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

    it("uses section elements for each day", () => {
        const { container } = render(
            <WeekBangumiList
                days={[day({ date: "1-1" }), day({ date: "1-2" })]}
                assets={assets}
            />
        );

        expect(container.querySelectorAll("section.item")).toHaveLength(2);
    });

    it("makes the whole season row a single link", () => {
        const { container } = render(
            <WeekBangumiList
                days={[day({ seasons: [season({ url: "https://a.test/1" })] })]}
                assets={assets}
            />
        );

        const row = container.querySelector(".bangumi");
        expect(row?.tagName).toBe("A");
        expect(row?.getAttribute("href")).toBe("https://a.test/1");
        expect(row?.querySelectorAll("a")).toHaveLength(0);
    });

    it("keeps the delay marker on the row for styling", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        seasons: [season({ delay: true, delayReason: "延期" })],
                    }),
                ]}
                assets={assets}
            />
        );

        const row = container.querySelector(".bangumi.delay");
        expect(row).toBeTruthy();
        expect(row?.classList.contains("bangumi")).toBe(true);
    });

    it("scrolls the current day into view", () => {
        const scrollIntoView = vi.fn();
        const original = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = scrollIntoView;

        try {
            render(
                <WeekBangumiList
                    days={[
                        day({ date: "1-1" }),
                        day({ date: "1-2", isToday: true }),
                    ]}
                    assets={assets}
                />
            );

            expect(scrollIntoView).toHaveBeenCalledTimes(1);
            const self = scrollIntoView.mock.instances[0] as Element;
            expect(self.classList.contains("today")).toBe(true);
        } finally {
            Element.prototype.scrollIntoView = original;
        }
    });

    it("does not scroll when the schedule has no today", () => {
        const scrollIntoView = vi.fn();
        const original = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = scrollIntoView;

        try {
            render(
                <WeekBangumiList
                    days={[day({ date: "1-1" })]}
                    assets={assets}
                />
            );

            expect(scrollIntoView).not.toHaveBeenCalled();
        } finally {
            Element.prototype.scrollIntoView = original;
        }
    });
});

describe("pubTimeMinute", () => {
    it("converts a slot label into its minute of the day", () => {
        expect(pubTimeMinute("00:00")).toBe(0);
        expect(pubTimeMinute("09:30")).toBe(570);
        expect(pubTimeMinute("23:59")).toBe(1439);
    });

    it("accepts an unpadded hour", () => {
        expect(pubTimeMinute("9:05")).toBe(545);
    });

    it("rejects a label that is not a wall clock", () => {
        expect(pubTimeMinute("")).toBeUndefined();
        expect(pubTimeMinute("24:00")).toBeUndefined();
        expect(pubTimeMinute("20:60")).toBeUndefined();
        expect(pubTimeMinute("今晚八点")).toBeUndefined();
    });
});

describe("markerIndex", () => {
    const groups = (times: Array<string>): Array<SeasonGroup> =>
        times.map(pubTime => ({ pubTime, seasons: [season({ pubTime })] }));

    it("stays above the first slot before it airs", () => {
        expect(markerIndex(groups(["09:00", "20:00"]), 480)).toBe(0);
    });

    it("sits right after a slot that already aired", () => {
        expect(markerIndex(groups(["09:00", "20:00"]), 540)).toBe(1);
    });

    it("treats the exact slot minute as already aired", () => {
        expect(markerIndex(groups(["09:00", "20:00"]), 540)).toBe(1);
    });

    it("moves below every slot late in the day", () => {
        expect(markerIndex(groups(["09:00", "20:00"]), 1439)).toBe(2);
    });

    it("has no slot to guard against on an empty day", () => {
        expect(markerIndex([], 600)).toBe(0);
    });

    it("stops at a slot it cannot parse", () => {
        expect(markerIndex(groups(["09:00", "拖更", "20:00"]), 1439)).toBe(1);
    });
});

describe("nextGapMinutes", () => {
    const groups = (times: Array<string>): Array<SeasonGroup> =>
        times.map(pubTime => ({ pubTime, seasons: [season({ pubTime })] }));

    it("measures the wait until the next slot", () => {
        expect(nextGapMinutes(groups(["09:00", "20:00"]), 570)).toBe(630);
    });

    it("skips the slots that already aired", () => {
        expect(nextGapMinutes(groups(["09:00", "10:00", "20:00"]), 720)).toBe(
            480
        );
    });

    it("counts a slot airing right now as already aired", () => {
        expect(nextGapMinutes(groups(["20:00", "21:00"]), 1200)).toBe(60);
        expect(nextGapMinutes(groups(["20:00"]), 1200)).toBeUndefined();
    });

    it("has nothing left after the last slot", () => {
        expect(nextGapMinutes(groups(["09:00"]), 1439)).toBeUndefined();
    });

    it("has nothing for a day without slots", () => {
        expect(nextGapMinutes([], 600)).toBeUndefined();
    });

    it("skips a malformed slot and still finds the next one", () => {
        expect(nextGapMinutes(groups(["09:00", "拖更", "20:00"]), 720)).toBe(
            480
        );
    });
});

describe("describeGap", () => {
    it("counts minutes below an hour", () => {
        expect(describeGap(0)).toBe("还有 0 分钟");
        expect(describeGap(45)).toBe("还有 45 分钟");
        expect(describeGap(59)).toBe("还有 59 分钟");
    });

    it("counts whole hours without the minutes part", () => {
        expect(describeGap(60)).toBe("还有 1 小时");
        expect(describeGap(120)).toBe("还有 2 小时");
    });

    it("keeps the minutes of a mixed duration", () => {
        expect(describeGap(61)).toBe("还有 1 小时 1 分");
        expect(describeGap(630)).toBe("还有 10 小时 30 分");
    });
});

describe("describeNow", () => {
    const groups = (times: Array<string>): Array<SeasonGroup> =>
        times.map(pubTime => ({ pubTime, seasons: [season({ pubTime })] }));

    it("describes the wait until the next slot", () => {
        expect(describeNow(groups(["09:00", "20:00"]), 570)).toBe(
            "还有 10 小时 30 分"
        );
    });

    it("flags a finished day", () => {
        expect(describeNow(groups(["09:00"]), 1439)).toBe(NOW_DONE_LABEL);
    });

    it("flags an empty day", () => {
        expect(describeNow([], 600)).toBe(NOW_EMPTY_LABEL);
    });
});

describe("now marker", () => {
    it("draws the marker in the current day only", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({ date: "1-1", isToday: false }),
                    day({ date: "1-2", isToday: true }),
                ]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(container.querySelectorAll(".now-marker")).toHaveLength(1);
        expect(
            container.querySelector(".item.today")?.querySelector(".now-marker")
        ).toBeTruthy();
    });

    it("labels the marker with the hint and the countdown", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        isToday: true,
                        seasons: [season({ pubTime: "20:00" })],
                    }),
                ]}
                assets={assets}
                now={AT_09_30}
            />
        );

        const marker = container.querySelector(".now-marker");
        expect(marker?.textContent).toContain(NOW_LABEL);
        expect(marker?.textContent).toContain("还有 10 小时 30 分");
        expect(marker?.getAttribute("role")).toBe("separator");
    });

    it("counts down to the next slot instead of showing the clock", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        isToday: true,
                        seasons: [
                            season({ pubTime: "09:00", url: "a" }),
                            season({ pubTime: "10:15", url: "b" }),
                        ],
                    }),
                ]}
                assets={assets}
                now={AT_09_30}
            />
        );

        const marker = container.querySelector(".now-marker");
        expect(marker?.textContent).toContain("还有 45 分钟");
        expect(marker?.textContent).not.toContain("09:30");
    });

    it("announces both the clock and the countdown to assistive technology", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        isToday: true,
                        seasons: [season({ pubTime: "20:00" })],
                    }),
                ]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(
            container.querySelector(".now-marker")?.getAttribute("aria-label")
        ).toBe("当前时间 09:30，还有 10 小时 30 分");
    });

    it("says the day is over once the last slot aired", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        isToday: true,
                        seasons: [season({ pubTime: "09:00" })],
                    }),
                ]}
                assets={assets}
                now={AT_23_00}
            />
        );

        expect(container.querySelector(".now-marker")?.textContent).toContain(
            NOW_DONE_LABEL
        );
    });

    it("says the day is empty when it has no slot at all", () => {
        const { container } = render(
            <WeekBangumiList
                days={[day({ isToday: true, seasons: [] })]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(container.querySelector(".now-marker")?.textContent).toContain(
            NOW_EMPTY_LABEL
        );
    });

    it("places the marker after the slots that already aired", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        isToday: true,
                        seasons: [
                            season({ pubTime: "09:00", url: "a" }),
                            season({ pubTime: "20:00", url: "b" }),
                        ],
                    }),
                ]}
                assets={assets}
                now={AT_09_30}
            />
        );

        const children = Array.from(
            container.querySelector(".timeline")?.children ?? []
        );
        expect(children.map(child => child.className)).toEqual([
            "time-group",
            "now-marker",
            "time-group",
        ]);
    });

    it("keeps the marker below the last slot after the day aired", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        isToday: true,
                        seasons: [season({ pubTime: "09:00" })],
                    }),
                ]}
                assets={assets}
                now={AT_23_00}
            />
        );

        const children = Array.from(
            container.querySelector(".timeline")?.children ?? []
        );
        expect(children.map(child => child.className)).toEqual([
            "time-group",
            "now-marker",
        ]);
    });

    it("keeps the marker above the first slot early in the day", () => {
        const { container } = render(
            <WeekBangumiList
                days={[
                    day({
                        isToday: true,
                        seasons: [season({ pubTime: "20:00" })],
                    }),
                ]}
                assets={assets}
                now={AT_09_30}
            />
        );

        const children = Array.from(
            container.querySelector(".timeline")?.children ?? []
        );
        expect(children.map(child => child.className)).toEqual([
            "now-marker",
            "time-group",
        ]);
    });

    it("still marks the current time on a day without any slot", () => {
        const { container } = render(
            <WeekBangumiList
                days={[day({ isToday: true, seasons: [] })]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(container.querySelectorAll(".now-marker")).toHaveLength(1);
    });

    it("omits the marker when the schedule has no current day", () => {
        const { container } = render(
            <WeekBangumiList
                days={[day({ isToday: false })]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(container.querySelector(".now-marker")).toBeNull();
    });
});

describe("now marker clock", () => {
    const pinnedDay = day({
        isToday: true,
        seasons: [
            season({ pubTime: "09:00", url: "a" }),
            season({ pubTime: "20:00", url: "b" }),
        ],
    });

    it("follows the system clock when no instant is given", () => {
        vi.useFakeTimers();
        vi.setSystemTime(AT_09_30);

        try {
            const { container } = render(
                <WeekBangumiList days={[pinnedDay]} assets={assets} />
            );

            expect(
                container.querySelector(".now-marker")?.textContent
            ).toContain("还有 10 小时 30 分");
        } finally {
            vi.useRealTimers();
        }
    });

    it("moves down the timeline as the clock advances", () => {
        vi.useFakeTimers();
        vi.setSystemTime(AT_09_30);

        try {
            const { container } = render(
                <WeekBangumiList days={[pinnedDay]} assets={assets} />
            );
            const order = (): Array<string> =>
                Array.from(
                    container.querySelector(".timeline")?.children ?? []
                ).map(child => child.className);
            expect(order()).toEqual(["time-group", "now-marker", "time-group"]);

            act(() => {
                vi.setSystemTime(AT_08_00);
                vi.advanceTimersByTime(NOW_TICK_MS);
            });

            expect(order()).toEqual(["now-marker", "time-group", "time-group"]);
        } finally {
            vi.useRealTimers();
        }
    });

    it("refreshes the marker when the panel becomes visible again", () => {
        vi.useFakeTimers();
        vi.setSystemTime(AT_09_30);

        try {
            const { container } = render(
                <WeekBangumiList days={[pinnedDay]} assets={assets} />
            );

            vi.setSystemTime(AT_08_00);
            act(() => {
                document.dispatchEvent(new Event("visibilitychange"));
            });

            expect(
                container.querySelector(".now-marker")?.textContent
            ).toContain("还有 1 小时");
        } finally {
            vi.useRealTimers();
        }
    });

    it("does not tick when the state pins the instant", () => {
        const setInterval = vi.spyOn(globalThis, "setInterval");

        render(
            <WeekBangumiList
                days={[pinnedDay]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(setInterval).not.toHaveBeenCalled();
    });
});
