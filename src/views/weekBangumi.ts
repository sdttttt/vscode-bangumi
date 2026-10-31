import type { BangumiApi } from "../request/bangumi";
import type { WeekBangumiData } from "../request/structure";
import type { Settings } from "../configuration";
import { toWeekDayPayloads } from "../webview/viewModel";
import type { WebviewCommand } from "../webview/protocol";
import type { Panel } from "./panel";

/**
 * Dependencies of the weekly schedule view.
 *
 * @author sdttttt
 */
export interface WeekBangumiViewOptions {
    readonly api: BangumiApi;
    readonly panel: Panel;
    readonly settings: Settings;
}

/**
 * The commands of the weekly schedule view.
 *
 * @author sdttttt
 */
export interface WeekBangumiView {
    /** Opens the schedule, or refreshes the open panel. */
    openWeekBangumi(): void;
    /** Routes a command sent by the webview. */
    handleCommand(command: WebviewCommand): void;
}

/**
 * Creates the weekly schedule view of one extension session.
 *
 * @author sdttttt
 */
export function useWeekBangumiView(
    options: WeekBangumiViewOptions
): WeekBangumiView {
    const { api, panel, settings } = options;

    /**
     * Renders the schedule sent by the API.
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
