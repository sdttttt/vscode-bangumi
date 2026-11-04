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

    it("ignores messages that are not a view state", () => {
        /*
         * 复现（M11，见 TODO.md）：宿主与页面共用 window.message 通道，
         * 形状不对的杂音此前会照单全收并持久化——文档重建时首渲染即抛错，
         * ready 永远发不出去，面板从此空白。
         */
        render(<Root />);

        act(() => {
            window.dispatchEvent(
                new MessageEvent("message", { data: { kind: "bogus" } })
            );
        });

        expect(vsCodeApi.setState).not.toHaveBeenCalled();
    });

    it("accepts every kind the host can push", () => {
        /*
         * 回归：入站守卫的种类表曾漏掉 unavailable——双源停摆时宿主推送的
         * 占位页被静默丢弃，面板停在旧内容上。逐个种类走消息通道推送，
         * 守卫今后漏掉 ViewKind 的任何成员都会在这里先红；此前的 App 用例
         * 直接渲染状态、绕过了通道，因此测不到守卫漏项。
         */
        const states: Array<ViewState> = [
            { kind: "loading" },
            { kind: "notFound" },
            list(),
            schedule(),
        ];

        render(<Root />);

        for (const state of states) {
            push(state);
            expect(vsCodeApi.setState).toHaveBeenCalledWith(state);
        }

        push(viewState({ kind: "unavailable" }));
        expect(screen.getByText(/暂时连不上/)).toBeTruthy();
    });

    it("recovers from a render error by asking for a replay", () => {
        /*
         * 复现（M11，见 TODO.md）：持久化的坏状态让首渲染抛错后，此前
         * 整棵树卸载、effect 停摆，面板永久空白。错误边界应接住并重发
         * ready 换取好状态。
         */
        vsCodeApi.getState.mockReturnValue({
            kind: "bogus",
        } as unknown as ViewState);

        render(<Root />);

        expect(screen.getByText(/渲染失败/)).toBeTruthy();
    });
});
