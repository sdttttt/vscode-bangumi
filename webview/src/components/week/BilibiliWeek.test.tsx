import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/preact";
import { BilibiliWeek } from "@webview/components/week/BilibiliWeek";
import {
    NOW_DONE_LABEL,
    NOW_EMPTY_LABEL,
    NOW_LABEL,
    NOW_TICK_MS,
} from "@webview/components/week/marker";
import { assets } from "@webview/test/fixtures";
import { AT_08_00, AT_09_30, AT_23_00, day, season } from "@webview/test/week";

describe("BilibiliWeek", () => {
    it("renders every given day", () => {
        render(
            <BilibiliWeek
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
            <BilibiliWeek days={[day({ isToday: true })]} assets={assets} />
        );

        expect(container.querySelector(".item.today")).toBeTruthy();
        expect(
            container.querySelector(".today-badge img")?.getAttribute("src")
        ).toBe(assets.todayBadge);
    });

    it("hides the badge when no assets were sent", () => {
        const { container } = render(
            <BilibiliWeek days={[day({ isToday: true })]} assets={undefined} />
        );

        expect(container.querySelector(".today-badge")).toBeNull();
    });

    it("renders one time point per publication slot", () => {
        const { container } = render(
            <BilibiliWeek
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
            <BilibiliWeek
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
            <BilibiliWeek
                days={[day({ seasons: [season({ pubIndex: "第9话" })] })]}
                assets={assets}
            />
        );

        expect(screen.getByText("第9话")).toBeTruthy();
    });

    it("links every season to its play page", () => {
        const { container } = render(
            <BilibiliWeek
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
            <BilibiliWeek days={[]} assets={assets} />
        );

        expect(container.querySelectorAll(".item")).toHaveLength(0);
    });

    it("uses section elements for each day", () => {
        const { container } = render(
            <BilibiliWeek
                days={[day({ date: "1-1" }), day({ date: "1-2" })]}
                assets={assets}
            />
        );

        expect(container.querySelectorAll("section.item")).toHaveLength(2);
    });

    it("makes the whole season row a single link", () => {
        const { container } = render(
            <BilibiliWeek
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
            <BilibiliWeek
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
                <BilibiliWeek
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
                <BilibiliWeek days={[day({ date: "1-1" })]} assets={assets} />
            );

            expect(scrollIntoView).not.toHaveBeenCalled();
        } finally {
            Element.prototype.scrollIntoView = original;
        }
    });
});

describe("now marker", () => {
    it("draws the marker in the current day only", () => {
        const { container } = render(
            <BilibiliWeek
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
            <BilibiliWeek
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
            <BilibiliWeek
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
            <BilibiliWeek
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
            <BilibiliWeek
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
            <BilibiliWeek
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
            <BilibiliWeek
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
            <BilibiliWeek
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
            <BilibiliWeek
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
            <BilibiliWeek
                days={[day({ isToday: true, seasons: [] })]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(container.querySelectorAll(".now-marker")).toHaveLength(1);
    });

    it("omits the marker when the schedule has no current day", () => {
        const { container } = render(
            <BilibiliWeek
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
                <BilibiliWeek days={[pinnedDay]} assets={assets} />
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
                <BilibiliWeek days={[pinnedDay]} assets={assets} />
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
                <BilibiliWeek days={[pinnedDay]} assets={assets} />
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
            <BilibiliWeek days={[pinnedDay]} assets={assets} now={AT_09_30} />
        );

        expect(setInterval).not.toHaveBeenCalled();
    });
});

describe("BilibiliWeek source note", () => {
    it("shows where the schedule comes from", () => {
        render(<BilibiliWeek days={[day()]} assets={assets} />);

        expect(screen.getByRole("note").textContent).toContain("Bilibili");
    });

    it("tells the reader the slots are Beijing time", () => {
        render(<BilibiliWeek days={[day()]} assets={assets} />);

        expect(screen.getByRole("note").textContent).toContain("北京时间");
    });
});
