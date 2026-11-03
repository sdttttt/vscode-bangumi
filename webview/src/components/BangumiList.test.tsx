import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/preact";
import { BangumiList } from "@webview/components/BangumiList";
import type { BangumiPayload } from "@shared/webview/protocol";

/**
 * 一份完整的番剧渲染载荷。
 *
 * @author sdttttt
 */
const payload = (overrides: Partial<BangumiPayload> = {}): BangumiPayload => ({
    badge: "会员专享",
    cover: "https://example.test/cover.jpg",
    finish: true,
    indexShow: "全12话",
    link: "https://example.test/play/ss1",
    order: "1.2万追番",
    title: "测试番剧",
    ...overrides,
});

/**
 * 渲染列表，并传入可断言的翻页处理器。
 *
 * @author sdttttt
 */
function renderList(
    overrides: {
        bangumis?: Array<BangumiPayload>;
        page?: number;
    } = {}
) {
    const onNextPage = vi.fn();
    const onBackPage = vi.fn();
    const onJumpPage = vi.fn();

    const result = render(
        <BangumiList
            bangumis={overrides.bangumis ?? [payload()]}
            page={overrides.page}
            onNextPage={onNextPage}
            onBackPage={onBackPage}
            onJumpPage={onJumpPage}
        />
    );

    return { ...result, onNextPage, onBackPage, onJumpPage };
}

describe("BangumiList", () => {
    it("renders one block per bangumi", () => {
        renderList({
            bangumis: [
                payload({ title: "番剧甲" }),
                payload({ title: "番剧乙", link: "https://example.test/ss2" }),
            ],
        });

        expect(screen.getByText("番剧甲")).toBeTruthy();
        expect(screen.getByText("番剧乙")).toBeTruthy();
    });

    it("uses a smaller heading for long titles", () => {
        const { container } = render(
            <BangumiList
                bangumis={[
                    payload({ title: "短标题" }),
                    payload({
                        title: "这是一个非常非常长的番剧标题超过十七个字",
                        link: "https://example.test/ss2",
                    }),
                ]}
                page={1}
                onNextPage={vi.fn()}
                onBackPage={vi.fn()}
                onJumpPage={vi.fn()}
            />
        );

        expect(container.querySelectorAll("h3")).toHaveLength(1);
        expect(container.querySelectorAll("h4").length).toBeGreaterThan(0);
    });

    it("marks a finished bangumi", () => {
        renderList({ bangumis: [payload({ finish: true })] });

        expect(screen.getByText("已完结")).toBeTruthy();
    });

    it("marks an unfinished bangumi", () => {
        renderList({ bangumis: [payload({ finish: false })] });

        expect(screen.getByText("未完结")).toBeTruthy();
    });

    it("falls back to a placeholder when the badge is empty", () => {
        renderList({ bangumis: [payload({ badge: "" })] });

        expect(screen.getByText("白嫖")).toBeTruthy();
    });

    it("shows the badge when it is present", () => {
        renderList({ bangumis: [payload({ badge: "限时免费" })] });

        expect(screen.getByText("限时免费")).toBeTruthy();
    });

    it("shows the current page", () => {
        renderList({ page: 7 });

        expect(screen.getByText("第 7 页")).toBeTruthy();
    });

    it("falls back to the first page when none is given", () => {
        renderList({ page: undefined });

        expect(screen.getByText("第 1 页")).toBeTruthy();
    });

    it("renders an empty frame instead of a broken image without a cover", () => {
        /*
         * 复现（L9，见 TODO.md）：空 cover 的 img 在 CSP 下必然失败，
         * 只剩破图图标；与 Placeholder 的守卫保持一致。
         */
        const { container } = renderList({
            bangumis: [payload({ cover: "" })],
        });

        expect(container.querySelector("img.cover-image")).toBeNull();
        expect(container.querySelector(".cover-media")).toBeTruthy();
    });

    it("renders a plain card when the link is missing", () => {
        /*
         * 复现（L10，见 TODO.md）：空 href 会把 webview 自身的文档地址
         * 转发出去打开，行为无意义；降级为不可点的卡片。
         */
        const { container } = renderList({ bangumis: [payload({ link: "" })] });

        expect(container.querySelector('a[href=""]')).toBeNull();
        expect(screen.getByText("测试番剧")).toBeTruthy();
    });

    it("links to the bangumi page", () => {
        const { container } = renderList({
            bangumis: [payload({ link: "https://example.test/play/ss9" })],
        });

        expect(
            container.querySelector('a[href="https://example.test/play/ss9"]')
        ).toBeTruthy();
    });

    it("renders no rows for an empty list", () => {
        const { container } = renderList({ bangumis: [] });

        expect(container.querySelectorAll(".cover")).toHaveLength(0);
    });

    it("makes the whole card a single link", () => {
        const { container } = renderList({
            bangumis: [payload({ link: "https://a.test/ss1" })],
        });

        const card = container.querySelector(".cover");
        expect(card?.tagName).toBe("A");
        expect(card?.getAttribute("href")).toBe("https://a.test/ss1");
        expect(card?.querySelectorAll("a")).toHaveLength(0);
    });

    it("reports pager clicks to the host", () => {
        const handlers = renderList();

        screen.getByText("下一页").click();
        screen.getByText("上一页").click();
        screen.getByText("跳页").click();

        expect(handlers.onNextPage).toHaveBeenCalledTimes(1);
        expect(handlers.onBackPage).toHaveBeenCalledTimes(1);
        expect(handlers.onJumpPage).toHaveBeenCalledTimes(1);
    });
});
