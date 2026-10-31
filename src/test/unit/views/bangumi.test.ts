import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BangumiApi } from "@/request/bangumi";
import { bangumisData } from "@/test/mocks/fixtures/bangumi";
import { createPanelStub, PanelStub } from "@/test/mocks/panel";
import { createNotifierStub, type NotifierStub } from "@/test/mocks/ports";
import { useAppState, type AppStore } from "@/state/app";
import { useWebviewHost } from "@/webview/host";
import { usePanel } from "@/views/panel";
import { useBangumiView, type BangumiView } from "@/views/bangumi";

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
    created: ReturnType<typeof vi.fn>;
} {
    const state = useAppState();
    const api: BangumiApi = {
        getAllBangumi: vi.fn(),
        getWeekBangumi: vi.fn(),
    };
    const created = vi.fn();
    const panel = usePanel({
        viewType: "bangumiOpen.list",
        title: "番剧列表",
        host: useWebviewHost("/extension"),
        subscriptions: [],
        createPanel: () => {
            const next = stubs[created.mock.calls.length];
            created();
            return next.panel;
        },
    });
    const notifier = createNotifierStub();
    const view = useBangumiView({
        state,
        api,
        panel,
        notifier: notifier.notifier,
    });
    panel.onCommand(view.handleCommand);

    return { view, state, api, notifier, created };
}

/**
 * 交给请求层的地址中的某个查询参数。
 *
 * @author sdttttt
 */
function requestedParameter(api: BangumiApi, name: string): string | null {
    const url = vi.mocked(api.getAllBangumi).mock.calls.at(-1)?.[0] ?? "";

    return new URLSearchParams(url.split("?")[1]).get(name);
}

describe("Bangumi view", () => {
    let view: BangumiView;
    let state: AppStore;
    let api: BangumiApi;
    let notifier: NotifierStub;
    let created: ReturnType<typeof vi.fn>;
    let stub: PanelStub;

    beforeEach(() => {
        stub = createPanelStub();
        ({ view, state, api, notifier, created } = loadView([stub, stub]));
    });

    it("opens a panel that boots the bundled webview", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(stub.webview.html).toContain("<!DOCTYPE html>");
        expect(stub.webview.html).toContain("main.js");
        expect(stub.webview.html).toContain("main.css");
    });

    it("enables scripts and restricts local resources", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(stub.webview.html).toContain("main.js");
    });

    it("posts the loading state first", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(stub.posted().at(-1)?.kind).toBe("loading");
    });

    it("renders the bangumi list once the request resolves", async () => {
        vi.mocked(api.getAllBangumi).mockResolvedValue(bangumisData());

        view.openBangumi();

        await vi.waitFor(() => {
            const state = stub.posted().at(-1);
            expect(state?.kind).toBe("bangumi");
            expect(state?.bangumis?.[0].title).toBe("测试番剧");
        });
    });

    it("passes the current page to the webview", async () => {
        vi.mocked(api.getAllBangumi).mockResolvedValue(bangumisData());

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.page).toBe(1);
        });
    });

    it("maps the api fields into render payloads", async () => {
        vi.mocked(api.getAllBangumi).mockResolvedValue(
            bangumisData({ list: [] })
        );

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.bangumis).toHaveLength(0);
        });
    });

    it("renders the not found view when the request fails", async () => {
        vi.mocked(api.getAllBangumi).mockResolvedValue(undefined);

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("notFound");
        });
    });

    it("replays the last state when the webview asks to be ready", async () => {
        vi.mocked(api.getAllBangumi).mockResolvedValue(bangumisData());
        view.openBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("bangumi");
        });

        stub.receive({ type: "ready" });

        expect(stub.posted().at(-1)?.kind).toBe("bangumi");
    });

    it("requests the first page of the unfiltered query by default", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(requestedParameter(api, "page")).toBe("1");
        expect(requestedParameter(api, "area")).toBe("-1");
    });

    it("increments the page on nextPage", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.nextPage();

        expect(notifier.info).toHaveBeenCalledWith("第2页");
        expect(requestedParameter(api, "page")).toBe("2");
    });

    it("decrements the page on backPage", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));
        view.nextPage();
        notifier.info.mockClear();

        view.backPage();

        expect(notifier.info).toHaveBeenCalledWith("第1页");
        expect(requestedParameter(api, "page")).toBe("1");
    });

    it("stays on the first page when going back", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.backPage();

        expect(notifier.info).toHaveBeenCalledWith("真的一滴都没有了！");
        expect(requestedParameter(api, "page")).toBe("1");
    });

    it("jumps to the page entered by the user", async () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));
        notifier.ask.mockResolvedValue("9");

        await view.jumpPage();

        expect(requestedParameter(api, "page")).toBe("9");
    });

    it("rejects a non numeric page and keeps the current one", async () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));
        notifier.ask.mockResolvedValue("abc");

        await view.jumpPage();

        expect(notifier.info).toHaveBeenCalledWith(
            expect.stringContaining("页码必须是大于 0 的数字")
        );
        expect(state.getPage()).toBe(1);
    });

    it("reuses the open panel instead of creating a second one", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();
        view.nextPage();

        expect(stub.reveal).toHaveBeenCalled();
    });

    it("opens a fresh panel after the previous one was closed", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();
        stub.dispose();
        view.openBangumi();

        expect(created).toHaveBeenCalledTimes(2);
    });

    it("routes the pager commands sent by the webview", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));
        view.openBangumi();
        notifier.info.mockClear();

        stub.receive({ type: "bangumi:nextPage" });

        expect(notifier.info).toHaveBeenCalledWith("第2页");
    });

    it("ignores the back command while on the first page", () => {
        vi.mocked(api.getAllBangumi).mockReturnValue(new Promise(() => {}));
        view.openBangumi();
        notifier.info.mockClear();

        stub.receive({ type: "bangumi:backPage" });

        expect(notifier.info).toHaveBeenCalledWith("真的一滴都没有了！");
    });
});
