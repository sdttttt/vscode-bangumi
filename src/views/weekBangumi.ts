import { getWeekBangumi } from "../request/bangumi";
import { WeekBangumiData } from "../request/structure";
import { isDisplayHistory } from "../configuration";
import { toWeekDayPayloads } from "../webview/viewModel";
import type { WebviewCommand } from "../webview/protocol";
import AbstractView from "./view";

/**
 * Week Bangumi View
 *
 * @class
 * @export
 * @author sdttttt
 */
export default new (class WeekBangumisView extends AbstractView {
    protected readonly viewType = "bangumiOpen.week";
    protected readonly title = "Week Bangumis";

    constructor() {
        super();
    }

    /**
     * Renders the schedule sent by the API.
     *
     * @author sdttttt
     */
    private createWeekBangumiView(data: Array<WeekBangumiData>): void {
        this.render({
            kind: "weekBangumi",
            days: toWeekDayPayloads(data, isDisplayHistory()),
        });
    }

    /**
     * Opens week bangumi
     *
     * @author sdttttt
     */
    openWeekBangumi(): void {
        this.showLoadingView();

        getWeekBangumi().then((result: Array<WeekBangumiData> | undefined) => {
            if (result) {
                this.createWeekBangumiView(result);
            }
        });
    }

    /**
     * Routes the refresh command sent by the webview.
     *
     * @author sdttttt
     */
    protected handleWebviewCommand(command: WebviewCommand): void {
        if ("weekBangumi:refresh" === command.type) {
            this.openWeekBangumi();
        }
    }
})();
