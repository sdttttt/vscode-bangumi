import type { BangumiApi } from "../request/bangumi";
import type { WeekBangumiData } from "../request/structure";
import type { Settings } from "../configuration";
import { toWeekDayPayloads } from "../webview/viewModel";
import type { WebviewCommand } from "../webview/protocol";
import type { Panel } from "./panel";

/**
 * 周番表视图的依赖。
 *
 * @author sdttttt
 */
export interface WeekBangumiViewOptions {
    readonly api: BangumiApi;
    readonly panel: Panel;
    readonly settings: Settings;
}

/**
 * 周番表视图的命令。
 *
 * @author sdttttt
 */
export interface WeekBangumiView {
    /** 打开周番表，或刷新已打开的面板。 */
    openWeekBangumi(): void;
    /** 分派 Webview 发来的命令。 */
    handleCommand(command: WebviewCommand): void;
}

/**
 * 创建一次扩展会话的周番表视图。
 *
 * @author sdttttt
 */
export function useWeekBangumiView(
    options: WeekBangumiViewOptions
): WeekBangumiView {
    const { api, panel, settings } = options;

    /**
     * 渲染接口返回的周番数据。
     */
    const createWeekBangumiView = (data: Array<WeekBangumiData>): void => {
        panel.show({
            kind: "weekBangumi",
            days: toWeekDayPayloads(data, settings.isDisplayHistory()),
        });
    };

    const view: WeekBangumiView = {
        openWeekBangumi: () => {
            panel.showLoading();

            api.getWeekBangumi().then(
                (result: Array<WeekBangumiData> | undefined) => {
                    if (result) {
                        createWeekBangumiView(result);
                    }
                }
            );
        },

        handleCommand: command => {
            if ("weekBangumi:refresh" === command.type) {
                view.openWeekBangumi();
            }
        },
    };

    return view;
}
