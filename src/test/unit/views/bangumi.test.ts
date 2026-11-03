import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BangumiApi } from "@/request";
import type { BangumisData } from "@/request/bilibili/schema";
import { bangumi, bangumisData } from "@/test/mocks/fixtures/bangumi";
import { createPanelStub, PanelStub } from "@/test/mocks/panel";
import {
    createAvailabilityStub,
    createNotifierStub,
    type AvailabilityStub,
    type NotifierStub,
} from "@/test/mocks/ports";
import { useAppState, type AppStore } from "@/state/app";
import { createWebviewHost } from "@/webview/host";
import { usePanel } from "@/views/panel";
import { createBangumiView, type BangumiView } from "@/views/bangumi";

/**
 * 构建独立的视图实例，每个用例因此都从关闭的面板开始。
 *
 * @author sdttttt
 */
function loadView(stubs: ReadonlyArray<PanelStub>): {
    view: BangumiView;
    state: AppStore;
    api: BangumiApi;
    notifier: NotifierStub;
    availability: AvailabilityStub;
    created: ReturnType<typeof vi.fn>;
} {
    const state = useAppState();
    const api: BangumiApi = {
        getIndexPage: vi.fn(),
        getBilibiliSchedule: vi.fn(),
        getBgmTvSchedule: vi.fn(),
    };
    const created = vi.fn();
    const panel = usePanel({
        viewType: "bangumiOpen.list",
        title: "番剧列表",
        host: createWebviewHost("/extension"),
        subscriptions: [],
        createPanel: () => {
            const next = stubs[created.mock.calls.length];
            created();
            return next.panel;
        },
    });
    const notifier = createNotifierStub();
    const availability = createAvailabilityStub();
    const view = createBangumiView({
        state,
        api,
        panel,
        notifier: notifier.notifier,
        availability: availability.availability,
    });
    panel.onCommand(view.handleCommand);

    return { view, state, api, notifier, availability, created };
}

/**
 * 交给请求层的地址中的某个查询参数。
 *
 * @author sdttttt
 */
function requestedParameter(api: BangumiApi, name: string): string | null {
    const url = vi.mocked(api.getIndexPage).mock.calls.at(-1)?.[0] ?? "";

    return new URLSearchParams(url.split("?")[1]).get(name);
}

describe("Bangumi view", () => {
    let view: BangumiView;
    let state: AppStore;
    let api: BangumiApi;
    let notifier: NotifierStub;
    let availability: AvailabilityStub;
    let created: ReturnType<typeof vi.fn>;
    let stub: PanelStub;

    beforeEach(() => {
        stub = createPanelStub();
        ({ view, state, api, notifier, availability, created } = loadView([
            stub,
            stub,
        ]));
    });

    it("opens a panel that boots the bundled webview", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(stub.webview.html).toContain("<!DOCTYPE html>");
        expect(stub.webview.html).toContain("main.js");
        expect(stub.webview.html).toContain("main.css");
    });

    it("enables scripts and restricts local resources", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(stub.webview.html).toContain("main.js");
    });

    it("posts the loading state first", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(stub.posted().at(-1)?.kind).toBe("loading");
    });

    it("renders the bangumi list once the request resolves", async () => {
        vi.mocked(api.getIndexPage).mockResolvedValue(bangumisData());

        view.openBangumi();

        await vi.waitFor(() => {
            const state = stub.posted().at(-1);
            expect(state?.kind).toBe("bangumi");
            expect(state?.bangumis?.[0].title).toBe("测试番剧");
        });
    });

    it("passes the current page to the webview", async () => {
        vi.mocked(api.getIndexPage).mockResolvedValue(bangumisData());

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.page).toBe(1);
        });
    });

    it("maps the api fields into render payloads", async () => {
        vi.mocked(api.getIndexPage).mockResolvedValue(
            bangumisData({ list: [] })
        );

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.bangumis).toHaveLength(0);
        });
    });

    it("renders the not found view when the request fails", async () => {
        vi.mocked(api.getIndexPage).mockResolvedValue(undefined);

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("notFound");
        });
    });

    it("falls back to the not found view when the request rejects", async () => {
        vi.mocked(api.getIndexPage).mockRejectedValue(new Error("timeout"));

        view.openBangumi();

        /*
         * rejection 必须被视图接住：面板不能停在加载态，
         * 也不能把 rejection 泄漏成 unhandled rejection。
         */
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("notFound");
        });
    });

    it("renders the unavailable view when every source is down", async () => {
        availability.setDown(true);
        vi.mocked(api.getIndexPage).mockResolvedValue(undefined);

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("unavailable");
        });
    });

    it("reloads the page once the sources recover", async () => {
        availability.setDown(true);
        vi.mocked(api.getIndexPage).mockResolvedValue(undefined);
        view.openBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("unavailable");
        });

        vi.mocked(api.getIndexPage).mockResolvedValue(bangumisData());
        availability.setDown(false);

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("bangumi");
        });
    });

    it("replays the last state when the webview asks to be ready", async () => {
        vi.mocked(api.getIndexPage).mockResolvedValue(bangumisData());
        view.openBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("bangumi");
        });

        stub.receive({ type: "ready" });

        expect(stub.posted().at(-1)?.kind).toBe("bangumi");
    });

    it("requests the first page of the unfiltered query by default", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(requestedParameter(api, "page")).toBe("1");
        expect(requestedParameter(api, "area")).toBe("-1");
    });

    it("increments the page on nextPage", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));

        view.nextPage();

        expect(notifier.info).toHaveBeenCalledWith("第2页");
        expect(requestedParameter(api, "page")).toBe("2");
    });

    it("decrements the page on backPage", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));
        view.nextPage();
        notifier.info.mockClear();

        view.backPage();

        expect(notifier.info).toHaveBeenCalledWith("第1页");
        expect(requestedParameter(api, "page")).toBe("1");
    });

    it("stays on the first page when going back", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));

        view.backPage();

        expect(notifier.info).toHaveBeenCalledWith("真的一滴都没有了！");
        expect(requestedParameter(api, "page")).toBe("1");
    });

    it("jumps to the page entered by the user", async () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));
        notifier.ask.mockResolvedValue("9");

        await view.jumpPage();

        expect(requestedParameter(api, "page")).toBe("9");
    });

    it("rejects a non numeric page and keeps the current one", async () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));
        notifier.ask.mockResolvedValue("abc");

        await view.jumpPage();

        expect(notifier.info).toHaveBeenCalledWith(
            expect.stringContaining("页码必须是大于 0 的数字")
        );
        expect(state.getPage()).toBe(1);
    });

    it.each(["-3", "2.5", "Infinity"])(
        "rejects the non positive integer page %j and keeps the current one",
        async input => {
            /*
             * 复现（M7，见 TODO.md）：校验只有 `0 === number`，负数、小数与
             * Infinity 全部穿过并写入 state。修复后页码应保持不变。
             */
            vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));
            notifier.ask.mockResolvedValue(input);

            await view.jumpPage();

            expect(state.getPage()).toBe(1);
        }
    );

    it("stays silent when the user dismisses the input box", async () => {
        /*
         * 复现（M7，见 TODO.md）：Esc 取消输入（undefined → 0）会误弹
         * 「页码必须是大于 0 的数字」。取消即静默，不应有任何提示。
         */
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));
        notifier.ask.mockResolvedValue(undefined);

        await view.jumpPage();

        expect(notifier.info).not.toHaveBeenCalled();
        expect(state.getPage()).toBe(1);
    });

    it("reuses the open panel instead of creating a second one", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));

        view.openBangumi();
        view.nextPage();

        expect(stub.reveal).toHaveBeenCalled();
    });

    it("opens a fresh panel after the previous one was closed", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));

        view.openBangumi();
        stub.dispose();
        view.openBangumi();

        expect(created).toHaveBeenCalledTimes(2);
    });

    it("drops a stale response that arrives after a newer request", async () => {
        /*
         * 复现（M5，见 TODO.md）：page=2 的请求 A 在途时又发了 page=3 的
         * 请求 B；B 先返回渲染第 3 页，A 后返回会把第 2 页的内容渲染出来，
         * 页码标签却写着 3。修复后旧响应必须被丢弃。
         */
        let resolveStale: (value: BangumisData) => void = () => undefined;
        vi.mocked(api.getIndexPage)
            .mockReturnValueOnce(
                new Promise<BangumisData>(resolve => {
                    resolveStale = resolve;
                })
            )
            .mockResolvedValueOnce(
                bangumisData({ list: [bangumi({ title: "第三页番剧" })] })
            );

        view.nextPage();
        view.nextPage();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.bangumis?.[0]?.title).toBe(
                "第三页番剧"
            );
            expect(stub.posted().at(-1)?.page).toBe(3);
        });

        resolveStale(bangumisData({ list: [bangumi({ title: "旧页番剧" })] }));
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(stub.posted().at(-1)?.bangumis?.[0]?.title).toBe("第三页番剧");
        expect(stub.posted().at(-1)?.page).toBe(3);
    });

    it("does not resurrect a closed panel when a late response arrives", async () => {
        /*
         * 复现（M6，见 TODO.md）：请求在途时用户关闭面板，响应迟到后
         * 面板不应被重新拉起来。
         */
        let resolveLate: (value: BangumisData) => void = () => undefined;
        vi.mocked(api.getIndexPage).mockReturnValueOnce(
            new Promise<BangumisData>(resolve => {
                resolveLate = resolve;
            })
        );

        view.openBangumi();
        expect(created).toHaveBeenCalledTimes(1);

        stub.dispose();
        resolveLate(bangumisData());
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(created).toHaveBeenCalledTimes(1);
    });

    it("routes the pager commands sent by the webview", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));
        view.openBangumi();
        notifier.info.mockClear();

        stub.receive({ type: "bangumi:nextPage" });

        expect(notifier.info).toHaveBeenCalledWith("第2页");
    });

    it("ignores the back command while on the first page", () => {
        vi.mocked(api.getIndexPage).mockReturnValue(new Promise(() => {}));
        view.openBangumi();
        notifier.info.mockClear();

        stub.receive({ type: "bangumi:backPage" });

        expect(notifier.info).toHaveBeenCalledWith("真的一滴都没有了！");
    });
});
