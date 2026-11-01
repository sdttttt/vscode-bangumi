import type { BangumiApi } from "../request";
import type { Settings } from "../configuration";
import type { WeeklySchedule } from "../request/schedule";
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
     * 渲染统一模型。
     */
    const createWeekBangumiView = (schedule: WeeklySchedule): void => {
        panel.show({
            kind: "weekBangumi",
            source: schedule.source,
            days: toWeekDayPayloads(schedule, settings.isDisplayHistory()),
        });
    };

    /**
     * 按设置项选择数据源。Bangumi 的收录更全，但没有播出时刻，因此不能用于提醒。
     */
    const loadSchedule = (): Promise<WeeklySchedule | undefined> =>
        "bangumi" === settings.weekSource()
            ? api.getBgmTvSchedule()
            : api.getBilibiliSchedule();

    const view: WeekBangumiView = {
        openWeekBangumi: () => {
            panel.showLoading();

            loadSchedule().then(schedule => {
                if (schedule) {
                    createWeekBangumiView(schedule);
                }
            });
        },

        handleCommand: command => {
            if ("weekBangumi:refresh" === command.type) {
                view.openWeekBangumi();
            }
        },
    };

    return view;
}
