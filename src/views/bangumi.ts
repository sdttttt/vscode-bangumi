import type { Notifier } from "../notifier";
import type { BangumiApi } from "../request/bangumi";
import { buildBangumiUrl } from "../request/query";
import type { BangumisData } from "../request/structure";
import type { AppStore } from "../state/app";
import { toNumber } from "../utils/type";
import { toBangumiPayloads } from "../webview/viewModel";
import type { WebviewCommand } from "../webview/protocol";
import type { Panel } from "./panel";

/**
 * Dependencies of the bangumi list view.
 *
 * The panel is built by the composition root and handed in: a view decides
 * *what* to render, never *how* the panel is created.
 *
 * @author sdttttt
 */
export interface BangumiViewOptions {
    readonly state: AppStore;
    readonly api: BangumiApi;
    readonly panel: Panel;
    readonly notifier: Notifier;
}

/**
 * The commands of the bangumi list view.
 *
 * @author sdttttt
 */
export interface BangumiView {
    /** Opens the bangumi list at the current page. */
    openBangumi(): void;
    /** Shows the next page. */
    nextPage(): void;
    /** Shows the previous page, or says there is none. */
    backPage(): void;
    /** Asks the user for a page number and opens it. */
    jumpPage(): Promise<void>;
    /** Routes a command sent by the webview. */
    handleCommand(command: WebviewCommand): void;
}

/**
 * Creates the bangumi list view of one extension session.
 *
 * @author sdttttt
 */
export function useBangumiView(options: BangumiViewOptions): BangumiView {
    const { state, api, panel, notifier } = options;

    /**
     * Renders a page of bangumi results.
     */
    const createBangumiView = (bangumiRes: BangumisData | undefined): void => {
        if (!bangumiRes) {
            panel.showNotFound();
            return;
        }

        panel.show({
            kind: "bangumi",
            page: state.getPage(),
            bangumis: toBangumiPayloads(bangumiRes.list),
        });
    };

    /**
     * Shows the number of the current page.
     */
    const showPageNumber = (): void => {
        notifier.info(`第${state.getPage()}页`);
    };

    const openBangumi = (): void => {
        panel.showLoading();

        api.getAllBangumi(
            buildBangumiUrl(state.getQuery(), state.getPage())
        ).then(createBangumiView);
    };

    const view: BangumiView = {
        openBangumi,

        nextPage: () => {
            state.setPage(state.getPage() + 1);
            showPageNumber();
            openBangumi();
        },

        backPage: () => {
            if (1 < state.getPage()) {
                state.setPage(state.getPage() - 1);
                showPageNumber();
                openBangumi();
                return;
            }

            state.setPage(1);
            notifier.info("真的一滴都没有了！");
            openBangumi();
        },

        jumpPage: async () => {
            const inputOptions = {
                value: "1",
                prompt: "提示：如果一直停留在加载中，通常是这一页没有数据了。",
            };

            const text = await notifier.ask(inputOptions);
            const number = toNumber(text);
            if (0 === number) {
                notifier.info("页码必须是大于 0 的数字，大小不做限制。");
                return;
            }

            state.setPage(number);
            openBangumi();
        },

        handleCommand: command => {
            switch (command.type) {
                case "bangumi:nextPage":
                    view.nextPage();
                    break;
                case "bangumi:backPage":
                    view.backPage();
                    break;
                case "bangumi:jumpPage":
                    void view.jumpPage();
                    break;
            }
        },
    };

    return view;
}
