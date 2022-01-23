import { getWeekBangumi } from "../request/bangumi";
import * as vscode from "vscode";
import WeekBangumisHTMLGenerator from "../html/weekBangumiHtml";
import { WeekBangumiData } from "../request/structure";
import AbstractView from "./view";

/**
 * Week Bangumi View
 *
 * @class
 * @export
 * @author sdttttt
 */
export default new (class WeekBangumisView extends AbstractView {
	protected readonly viewType = "html";
	protected readonly title = "Week Bangumis";

	private remindTimers: Array<NodeJS.Timeout> = [];

	constructor() {
		super();
	}

	/**
	 * Creates Week bangumi view
	 *
	 * @param {Array<WeekBangumiData>} data
	 * @author sdttttt
	 */
	private createWeekBangumiView(data: Array<WeekBangumiData>): void {
		this.openWebViewPanel((pv: vscode.WebviewPanel) => {
			pv.webview.html = WeekBangumisHTMLGenerator.generateHTML(data);
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
})();
