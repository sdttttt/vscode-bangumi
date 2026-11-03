import type { Availability } from "../availability";
import type { Notifier } from "../notifier";
import type { BangumiApi } from "../request";
import { buildBangumiUrl } from "../request/bilibili/query";
import type { BangumisData } from "../request/bilibili/schema";
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
    /** 两个来源的可用性，用于区分「没有数据」与「连不上」。 */
    readonly availability: Availability;
}

/**
 * 番剧列表视图的命令。
 *
 * @author sdttttt
 */
export interface BangumiView {
    /** 在当前页打开番剧列表。 */
    openBangumi(): Promise<void>;
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
export function createBangumiView(options: BangumiViewOptions): BangumiView {
    const { state, api, panel, notifier, availability } = options;

    /* 当前面板是否正停在「暂时不可用」占位页上，用于恢复后自动重绘。 */
    let showingUnavailable = false;

    /**
     * 渲染一页番剧结果。
     */
    const createBangumiView = (bangumiRes: BangumisData | undefined): void => {
        if (!bangumiRes) {
            showingUnavailable = availability.isDown();

            if (showingUnavailable) {
                panel.showUnavailable();
                return;
            }

            panel.showNotFound();
            return;
        }

        showingUnavailable = false;

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

    const openBangumi = async (): Promise<void> => {
        panel.showLoading();

        try {
            const bangumiRes = await api.getIndexPage(
                buildBangumiUrl(state.getQuery(), state.getPage())
            );
            createBangumiView(bangumiRes);
        } catch {
            /*
             * 请求层通常已经上报过失败，这里只兜底把面板落到「未找到」，
             * 不让 rejection 逃出去把面板留在加载态。
             */
            panel.showNotFound();
        }
    };

    /*
     * 恢复后自动重绘：占位页本身没有重试按钮，用户没有别的办法让面板回来。
     */
    availability.onDidChange(down => {
        if (!down && showingUnavailable) {
            openBangumi();
        }
    });

    const view: BangumiView = {
        openBangumi,

        nextPage: () => {
            state.setPage(state.getPage() + 1);
            showPageNumber();
            void openBangumi();
        },

        backPage: () => {
            if (1 < state.getPage()) {
                state.setPage(state.getPage() - 1);
                showPageNumber();
                void openBangumi();
                return;
            }

            state.setPage(1);
            notifier.info("真的一滴都没有了！");
            void openBangumi();
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
