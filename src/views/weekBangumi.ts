import type { Availability } from "../availability";
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
    /** 两个来源的可用性，用于区分「没有数据」与「连不上」。 */
    readonly availability: Availability;
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
    const { api, panel, settings, availability } = options;

    /*
     * 面板自己记住用户从顶部按钮选中的来源。
     *
     * 它只在这次面板生命周期内有效，既不会写回设置项，也不会影响提醒与状态栏；
     * 关闭面板后重新打开会退回设置项里的来源。
     */
    let currentSource: WeekSourceKind | undefined;

    /* 每次渲染自增，用于丢弃后到的旧响应。 */
    let renderToken = 0;

    /*
     * 面板被用户关闭后在途的响应全部作废：迟到的数据不该把面板重新拉起来。
     * 用户再次执行命令时 render() 会先自增，新请求照常渲染。
     */
    panel.onDidClose(() => {
        renderToken += 1;
    });

    /* 当前面板是否正停在「暂时不可用」占位页上，用于恢复后自动重绘。 */
    let showingUnavailable = false;

    /**
     * 渲染统一模型。
     *
     * `fallback` 只在「用户要的是 Bangumi，拿回来的却是 B 站」时为真：那就是
     * 来源回退，界面需要在提示条上说明原因。
     */
    const createWeekBangumiView = (schedule: WeeklySchedule): void => {
        panel.show({
            kind: "weekBangumi",
            source: schedule.source,
            fallback:
                "bangumi" === sourceOf() && "bilibili" === schedule.source,
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

        /*
         * 每次渲染自增，后到的旧响应因此不会覆盖新选择：切源之后先发的请求
         * 可能晚于新请求返回，若直接渲染，面板内容会与按钮上的来源不一致。
         */
        const token = ++renderToken;

        loadSchedule()
            .then(schedule => {
                if (token !== renderToken) {
                    return;
                }

                if (schedule) {
                    showingUnavailable = false;
                    createWeekBangumiView(schedule);
                    return;
                }

                /*
                 * 两个来源都拉不到时给出「暂时不可用」，而不是「没有找到」：
                 * 后者会让用户以为今天真的没有番剧，前者才说明问题在网络上。
                 */
                if (availability.isDown()) {
                    showingUnavailable = true;
                    panel.showUnavailable();
                    return;
                }

                /* 没有数据时给出「未找到」，否则面板会一直停在加载态。 */
                showingUnavailable = false;
                panel.showNotFound();
            })
            .catch(() => {
                if (token !== renderToken) {
                    return;
                }

                if (availability.isDown()) {
                    showingUnavailable = true;
                    panel.showUnavailable();
                    return;
                }

                showingUnavailable = false;
                panel.showNotFound();
            });
    };

    /*
     * 恢复后自动重绘：占位页本身没有重试按钮，用户没有别的办法让面板回来。
     * 只在这一份占位页正显示时重绘，避免打断用户已经切走的其它内容。
     */
    availability.onDidChange(down => {
        if (!down && showingUnavailable) {
            render();
        }
    });

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
