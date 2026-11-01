import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { BgmTvWeek } from "@webview/components/week/BgmTvWeek";
import { assets } from "@webview/test/fixtures";
import { bgmDay, season } from "@webview/test/week";

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
            <BgmTvWeek days={[bgmDay({ isToday: true })]} assets={assets} />
        );

        expect(container.querySelector(".item.today")).toBeTruthy();
        expect(
            container.querySelector(".today-badge img")?.getAttribute("src")
        ).toBe(assets.todayBadge);
    });

    it("hides the today badge when no assets were sent", () => {
        const { container } = render(
            <BgmTvWeek days={[bgmDay({ isToday: true })]} assets={undefined} />
        );

        expect(container.querySelector(".today-badge")).toBeNull();
    });

    it("styles the current day header differently", () => {
        const { container } = render(
            <BgmTvWeek
                days={[bgmDay({ isToday: true }), bgmDay({ date: "1-2" })]}
                assets={assets}
            />
        );

        expect(container.querySelectorAll(".day-title-today")).toHaveLength(1);
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
