import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/preact";
import { WeekBangumiList } from "@webview/components/WeekBangumiList";
import { assets } from "@webview/test/fixtures";
import { AT_09_30, bgmDay, day, season } from "@webview/test/week";

describe("WeekBangumiList", () => {
    it("renders the bilibili schedule by default", () => {
        const { container } = render(
            <WeekBangumiList
                days={[day({ seasons: [season({ pubTime: "20:00" })] })]}
                assets={assets}
                now={AT_09_30}
            />
        );

        expect(container.querySelector(".time-point")?.textContent).toBe(
            "20:00"
        );
        expect(container.querySelector(".week-source")?.textContent).toContain(
            "Bilibili"
        );
    });

    it("shows the bilibili clock even when the source is spelled out", () => {
        const { container } = render(
            <WeekBangumiList
                days={[day({ isToday: true })]}
                assets={assets}
                source="bilibili"
                now={AT_09_30}
            />
        );

        expect(container.querySelector(".now-marker")).toBeTruthy();
    });

    it("passes the switch callback to whichever page is on screen", () => {
        const onSwitchSource = vi.fn();

        const { container } = render(
            <WeekBangumiList
                days={[bgmDay()]}
                assets={assets}
                source="bangumi"
                onSwitchSource={onSwitchSource}
            />
        );

        fireEvent.click(container.querySelector(".week-source-switch")!);

        expect(onSwitchSource).toHaveBeenCalledWith("bilibili");
    });

    it("hides the switch without a callback", () => {
        const { container } = render(
            <WeekBangumiList days={[day()]} assets={assets} />
        );

        expect(container.querySelector(".week-source-switch")).toBeNull();
    });

    it("renders the Bangumi schedule for the bangumi source", () => {
        const { container } = render(
            <WeekBangumiList
                days={[bgmDay()]}
                assets={assets}
                source="bangumi"
            />
        );

        expect(container.querySelector(".week-source")).toBeTruthy();
        expect(container.querySelector(".time-point")).toBeNull();
        expect(container.querySelector(".now-marker")).toBeNull();
    });
});
