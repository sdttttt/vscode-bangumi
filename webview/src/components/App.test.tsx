import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { App } from "@webview/components/App";
import { assets, viewState } from "@webview/test/fixtures";

/**
 * 用给定状态渲染根组件。
 *
 * @author sdttttt
 */
function renderApp(state: Parameters<typeof App>[0]["state"]) {
    return render(
        <App
            state={state}
            onNextPage={vi.fn()}
            onBackPage={vi.fn()}
            onJumpPage={vi.fn()}
        />
    );
}

describe("App", () => {
    it("shows the loading screen before any state arrives", () => {
        renderApp(undefined);

        expect(screen.getByText("加载中...")).toBeTruthy();
    });

    it("shows the loading screen and its animation", () => {
        const { container } = renderApp(viewState({ kind: "loading" }));

        expect(screen.getByText("加载中...")).toBeTruthy();
        expect(
            container.querySelector(".load-image")?.getAttribute("src")
        ).toBe(assets.image);
    });

    it("shows the not found screen with the placeholder image", () => {
        const { container } = renderApp(viewState({ kind: "notFound" }));

        expect(screen.getByText("没有找到数据！")).toBeTruthy();
        expect(
            container.querySelector(".load-image")?.getAttribute("src")
        ).toBe(assets.image);
    });

    it("omits the image when the host sent no assets", () => {
        const { container } = renderApp(
            viewState({ kind: "loading", assets: undefined })
        );

        expect(container.querySelector(".load-image")).toBeNull();
    });

    it("renders the index list", () => {
        renderApp(
            viewState({
                kind: "bangumi",
                page: 3,
                bangumis: [
                    {
                        badge: "",
                        cover: "https://example.test/a.jpg",
                        finish: false,
                        indexShow: "更新至第2话",
                        link: "https://example.test/ss1",
                        order: "9999",
                        title: "列表番剧",
                    },
                ],
            })
        );

        expect(screen.getByText("列表番剧")).toBeTruthy();
        expect(screen.getByText("第 3 页")).toBeTruthy();
    });

    it("renders the weekly schedule", () => {
        renderApp(
            viewState({
                kind: "weekBangumi",
                days: [
                    {
                        date: "1-6",
                        dayOfWeek: 6,
                        label: "星期六",
                        isToday: true,
                        seasons: [
                            {
                                cover: "https://example.test/s.jpg",
                                delay: false,
                                delayIndex: "",
                                delayReason: "",
                                pubIndex: "第1话",
                                pubTime: "22:00",
                                title: "周番",
                                url: "https://example.test/ss2",
                            },
                        ],
                    },
                ],
            })
        );

        expect(screen.getByText("星期六")).toBeTruthy();
        expect(screen.getByText("周番")).toBeTruthy();
    });

    it("renders an empty index list when no bangumi was sent", () => {
        const { container } = renderApp(
            viewState({ kind: "bangumi", page: 1, bangumis: undefined })
        );

        expect(container.querySelectorAll(".cover")).toHaveLength(0);
    });

    it("forwards the source switch from the schedule", () => {
        const onSwitchSource = vi.fn();
        render(
            <App
                state={viewState({ kind: "weekBangumi", days: [] })}
                onNextPage={vi.fn()}
                onBackPage={vi.fn()}
                onJumpPage={vi.fn()}
                onSwitchSource={onSwitchSource}
            />
        );

        fireEvent.click(screen.getByRole("button"));

        /* 缺省来源是 Bangumi，因此按钮切到另一边。 */
        expect(onSwitchSource).toHaveBeenCalledWith("bilibili");
    });

    it("renders an empty schedule when no day was sent", () => {
        const { container } = renderApp(
            viewState({ kind: "weekBangumi", days: undefined })
        );

        expect(container.querySelectorAll(".item")).toHaveLength(0);
    });
});
