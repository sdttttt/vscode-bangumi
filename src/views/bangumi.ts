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
 * 番剧列表视图的依赖。
 *
 * 面板由组合根创建后传入：视图只决定「渲染什么」，从不决定「面板怎么创建」。
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
 * 番剧列表视图的命令。
 *
 * @author sdttttt
 */
export interface BangumiView {
    /** 在当前页打开番剧列表。 */
    openBangumi(): void;
    /** 展示下一页。 */
    nextPage(): void;
    /** 展示上一页；已经是第一页时给出提示。 */
    backPage(): void;
    /** 让用户输入页码并打开该页。 */
    jumpPage(): Promise<void>;
    /** 分派 Webview 发来的命令。 */
    handleCommand(command: WebviewCommand): void;
}

/**
 * 创建一次扩展会话的番剧列表视图。
 *
 * @author sdttttt
 */
export function useBangumiView(options: BangumiViewOptions): BangumiView {
    const { state, api, panel, notifier } = options;

    /**
     * 渲染一页番剧结果。
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
     * 提示当前页码。
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
