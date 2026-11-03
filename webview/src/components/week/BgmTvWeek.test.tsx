import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/preact";
import { BgmTvWeek } from "@webview/components/week/BgmTvWeek";
import { NOW_TICK_MS } from "@webview/components/week/marker";
import { assets } from "@webview/test/fixtures";
import { AT_09_30, bgmDay, season } from "@webview/test/week";

describe("BgmTvWeek", () => {
    it("renders no time point without a publication slot", () => {
        const { container } = render(
            <BgmTvWeek days={[bgmDay()]} assets={assets} />
        );

        expect(container.querySelectorAll(".time-point")).toHaveLength(0);
    });

    it("renders no now marker without a publication slot", () => {
        const { container } = render(
            <BgmTvWeek days={[bgmDay()]} assets={assets} />
        );

        expect(container.querySelector(".now-marker")).toBeNull();
    });

    it("renders the cover in a portrait frame", () => {
        const { container } = render(
            <BgmTvWeek
                days={[
                    bgmDay({
                        seasons: [
                            season({ cover: "https://lain.bgm.tv/a.jpg" }),
                        ],
                    }),
                ]}
                assets={assets}
            />
        );

        const image = container.querySelector(".season-poster-image");

        expect(image?.getAttribute("src")).toBe("https://lain.bgm.tv/a.jpg");
        expect(container.querySelector(".season-cover")).toBeNull();
    });

    it("shows the source note", () => {
        render(<BgmTvWeek days={[bgmDay()]} assets={assets} />);

        expect(screen.getByRole("note").textContent).toContain("Bangumi");
    });

    it("offers a switch back to Bilibili", () => {
        render(
            <BgmTvWeek
                days={[bgmDay()]}
                assets={assets}
                onSwitchSource={vi.fn()}
            />
        );

        expect(screen.getByRole("button").textContent).toContain(
            "切换到 bilibili"
        );
    });

    it("calls back with the other source when the switch is clicked", () => {
        const onSwitchSource = vi.fn();
        render(
            <BgmTvWeek
                days={[bgmDay()]}
                assets={assets}
                onSwitchSource={onSwitchSource}
            />
        );

        fireEvent.click(screen.getByRole("button"));

        expect(onSwitchSource).toHaveBeenCalledWith("bilibili");
    });

    it("hides the switch when the host cannot switch", () => {
        render(
            <BgmTvWeek
                days={[bgmDay()]}
                assets={assets}
                onSwitchSource={undefined}
            />
        );

        expect(screen.queryByRole("button")).toBeNull();
    });

    it("shows the score of a subject when there is one", () => {
        render(
            <BgmTvWeek
                days={[bgmDay({ seasons: [season({ score: 8.24 })] })]}
                assets={assets}
            />
        );

        expect(screen.getByText("评分 8.2")).toBeTruthy();
    });

    it("omits the progress row when it is empty", () => {
        const { container } = render(
            <BgmTvWeek
                days={[
                    bgmDay({
                        seasons: [season({ pubTime: "", pubIndex: "" })],
                    }),
                ]}
                assets={assets}
            />
        );

        expect(container.querySelector(".season-part")).toBeNull();
    });

    it("prefixes the first air date so it is not read as this week", () => {
        const { container } = render(
            <BgmTvWeek
                days={[
                    bgmDay({
                        seasons: [
                            season({ pubTime: "", pubIndex: "2026-10-01" }),
                        ],
                    }),
                ]}
                assets={assets}
            />
        );

        expect(container.querySelector(".season-part")?.textContent).toBe(
            "首播 2026-10-01"
        );
    });

    it("uses the original title as a hover hint", () => {
        const { container } = render(
            <BgmTvWeek
                days={[
                    bgmDay({
                        seasons: [
                            season({
                                title: "测试",
                                originalTitle: "テスト",
                            }),
                        ],
                    }),
                ]}
                assets={assets}
            />
        );

        expect(
            container.querySelector(".season-title")?.getAttribute("title")
        ).toBe("テスト");
    });
    it("marks the current day with the today badge", () => {
        const { container } = render(
            <BgmTvWeek
                days={[bgmDay({ isToday: true })]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(container.querySelector(".item.today")).toBeTruthy();
        expect(
            container.querySelector(".today-badge img")?.getAttribute("src")
        ).toBe(assets.image);
    });

    it("hides the today badge when no assets were sent", () => {
        const { container } = render(
            <BgmTvWeek
                days={[bgmDay({ isToday: true })]}
                assets={undefined}
                now={AT_09_30}
            />
        );

        expect(container.querySelector(".today-badge")).toBeNull();
    });

    it("styles the current day header differently", () => {
        const { container } = render(
            <BgmTvWeek
                days={[bgmDay({ isToday: true }), bgmDay({ date: "10-30" })]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(container.querySelectorAll(".day-title-today")).toHaveLength(1);
    });

    it("stops marking the day once the clock crosses midnight", () => {
        /*
         * 复现（H4，见 TODO.md）：isToday 是宿主推送的静态载荷，面板跨过
         * UTC+8 午夜后它就过期了——「今天」徽标与样式不能一直挂在昨天的列上。
         */
        vi.useFakeTimers();
        /* 2026-10-31 23:59 UTC+8。 */
        vi.setSystemTime(Date.UTC(2026, 9, 31, 15, 59));

        try {
            const { container } = render(
                <BgmTvWeek days={[bgmDay({ isToday: true })]} assets={assets} />
            );

            expect(container.querySelector(".item.today")).toBeTruthy();

            /* 2026-11-01 00:01 UTC+8；让时钟订阅走一拍才会重渲染。 */
            vi.setSystemTime(Date.UTC(2026, 9, 31, 16, 1));
            act(() => {
                vi.advanceTimersByTime(NOW_TICK_MS);
            });

            expect(container.querySelector(".item.today")).toBeNull();
            expect(container.querySelector(".today-badge")).toBeNull();
        } finally {
            vi.useRealTimers();
        }
    });

    it("links every subject to its page", () => {
        const { container } = render(
            <BgmTvWeek
                days={[
                    bgmDay({ seasons: [season({ url: "https://bgm.tv/x" })] }),
                ]}
                assets={assets}
            />
        );

        expect(
            container.querySelector('a[href="https://bgm.tv/x"]')
        ).toBeTruthy();
    });

    it("renders nothing for an empty schedule", () => {
        const { container } = render(<BgmTvWeek days={[]} assets={assets} />);

        expect(container.querySelectorAll(".item")).toHaveLength(0);
    });

    it("keeps the whole row a single link", () => {
        const { container } = render(
            <BgmTvWeek days={[bgmDay()]} assets={assets} />
        );

        const row = container.querySelector(".bangumi");
        expect(row?.tagName).toBe("A");
        expect(row?.querySelectorAll("a")).toHaveLength(0);
    });
});
