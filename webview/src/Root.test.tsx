import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/preact";
import type { ViewState } from "@shared/webview/protocol";
import { Root } from "@webview/Root";
import { vsCodeApi } from "@webview/test/setup";
import { viewState } from "@webview/test/fixtures";

/**
 * 构建宿主为周番视图推送的状态。
 *
 * @author sdttttt
 */
const schedule = (): ViewState =>
    viewState({
        kind: "weekBangumi",
        days: [
            {
                date: "1-1",
                dayOfWeek: 1,
                label: "星期一",
                isToday: true,
                seasons: [],
            },
        ],
    });

/**
 * 构建宿主为索引列表推送的状态。
 *
 * @author sdttttt
 */
const list = (): ViewState =>
    viewState({
        kind: "bangumi",
        page: 1,
        bangumis: [
            {
                badge: "",
                cover: "https://example.test/a.jpg",
                finish: true,
                indexShow: "全12话",
                link: "https://example.test/ss1",
                order: "1",
                title: "番剧",
            },
        ],
    });

/**
 * 按扩展宿主的方式派发一份状态。
 *
 * @author sdttttt
 */
function push(state: ViewState): void {
    act(() => {
        window.dispatchEvent(new MessageEvent("message", { data: state }));
    });
}

describe("Root", () => {
    it("asks the host for data on mount", () => {
        render(<Root />);

        expect(vsCodeApi.postMessage).toHaveBeenCalledWith({ type: "ready" });
    });

    it("starts from the state the panel persisted", () => {
        vsCodeApi.getState.mockReturnValue(schedule());

        render(<Root />);

        expect(screen.getByText("星期一")).toBeTruthy();
    });

    it("renders the state pushed by the host", () => {
        render(<Root />);

        push(schedule());

        expect(screen.getByText("星期一")).toBeTruthy();
    });

    it("mirrors the pushed state into the panel storage", () => {
        render(<Root />);

        push(schedule());

        expect(vsCodeApi.setState).toHaveBeenCalledWith(schedule());
    });

    it("forwards the pager commands of the list to the host", () => {
        render(<Root />);
        push(list());

        screen.getByText("下一页").click();
        screen.getByText("上一页").click();
        screen.getByText("跳页").click();

        expect(vsCodeApi.postMessage).toHaveBeenCalledWith({
            type: "bangumi:nextPage",
        });
        expect(vsCodeApi.postMessage).toHaveBeenCalledWith({
            type: "bangumi:backPage",
        });
        expect(vsCodeApi.postMessage).toHaveBeenCalledWith({
            type: "bangumi:jumpPage",
        });
    });

    it("forwards the source switch to the host", () => {
        render(<Root />);
        push(schedule());

        screen.getByText("切换到 bilibili").click();

        expect(vsCodeApi.postMessage).toHaveBeenCalledWith({
            type: "weekBangumi:switchSource",
            source: "bilibili",
        });
    });

    it("replaces the previous state instead of appending", () => {
        render(<Root />);
        push(schedule());
        push(list());

        expect(screen.getByText("番剧")).toBeTruthy();
        expect(screen.queryByText("星期一")).toBeNull();
    });
});
