import type { BangumiApi } from "../request";
import type { Settings } from "../configuration";
import type { WeekSourceKind, WeeklySchedule } from "../request/schedule";
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

    /*
     * 面板自己记住用户从顶部按钮选中的来源。
     *
     * 它只在这次面板生命周期内有效，既不会写回设置项，也不会影响提醒与状态栏；
     * 关闭面板后重新打开会退回设置项里的来源。
     */
    let currentSource: WeekSourceKind | undefined;

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
     * 当前应当使用的来源：面板内的临时选择优先，其次才是设置项。
     */
    const sourceOf = (): WeekSourceKind =>
        currentSource ?? settings.weekSource();

    /**
     * 按来源拉取统一模型。Bangumi 的收录更全，但没有播出时刻，因此不能用于提醒。
     *
     * 只把显式的 `bilibili` 交给 B 站实现，其余一律走默认的 Bangumi，与设置项的
     * 回退规则保持一致。
     */
    const loadSchedule = (): Promise<WeeklySchedule | undefined> =>
        "bilibili" === sourceOf()
            ? api.getBilibiliSchedule()
            : api.getBgmTvSchedule();

    const render = (): void => {
        panel.showLoading();

        loadSchedule().then(schedule => {
            if (schedule) {
                createWeekBangumiView(schedule);
            }
        });
    };

    const view: WeekBangumiView = {
        openWeekBangumi: () => {
            /* 命令重新打开面板时，放弃上一次的临时选择。 */
            currentSource = undefined;
            render();
        },

        handleCommand: command => {
            if ("weekBangumi:refresh" === command.type) {
                render();
                return;
            }

            if ("weekBangumi:switchSource" === command.type) {
                if (command.source !== sourceOf()) {
                    currentSource = command.source;
                    render();
                }
            }
        },
    };

    return view;
}
