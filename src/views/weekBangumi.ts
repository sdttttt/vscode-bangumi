"use strict";

import { getWeekBangumi } from "../request/bangumi";
import * as vscode from "vscode";
import WeekBangumisHTMLGenerator from "../html/weekBangumiHtml";
import { WeekBangumiData } from "../request/structure";
import AbstractView from "./view";
import { currentTimestamp, getTodayIndexInWeekBangumi, toMinuteFromSecode } from "../utils/strings";
import { isEmptyArray } from "../utils/type";
import { getReminderAheadTime } from "../configuration";

/**
 * Week Bangumi View
 *
 * @class
 * @export
 * @author sdttttt
 */
export default new class WeekBangumisView extends AbstractView {
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
  private createWeekBangumiView(data: Array<WeekBangumiData>) {
  	this.openWebViewPanel(
  		(pv: vscode.WebviewPanel) => {
  			pv.webview.html = WeekBangumisHTMLGenerator.generateHTML(data);
  		}
  	);
  }

  /**
   * Opens week bangumi
   *
   * @author sdttttt
   */
  openWeekBangumi() {
  	this.showLoadingView();
  	const that = this;

  	getWeekBangumi().then((result: Array<WeekBangumiData> | undefined) => {
  		if (result) {
  			that.createWeekBangumiView(result);
  		}
  	});
  }

  /**
 * Reminders bangumi update
 *
 * @returns
 * @async
 * @author sdttttt
 */
  async enableBangumiUpdateReminder() {
  	let bangumisData: Array<WeekBangumiData> | undefined =
    await getWeekBangumi();

  	if (!bangumisData) {
  		vscode.window.showWarningMessage("有这种事？每周番剧获取失败！🅰");
  		return;
  	}

  	let todayIndex: number | undefined = getTodayIndexInWeekBangumi(bangumisData);
  	if (!todayIndex) {
  		vscode.window.showInformationMessage("没有找到今日的索引 ??");
  		return;
  	}

  	const currentTime: number = currentTimestamp();
  	let aheadTime: number = getReminderAheadTime();

  	for (let i = todayIndex; i <= todayIndex + 1; i++) {
  		for (const bangumi of bangumisData[i].seasons) {
  			const bangumiTime: number = bangumi.pub_ts * 1000;
  			if (currentTime < bangumiTime && bangumi.delay !== 1) {
  				const timeDifference: number = bangumiTime - currentTime;
  				const timer: NodeJS.Timeout = this.makeRemind(
  					bangumi.title, timeDifference, aheadTime);

  				this.remindTimers.push(timer);
  			}
  		}
  	}
  }

  /**
   * Makes remind
   *
   * @param bangumiName 
   * @param time 
   * @returns remind 
   * @author sdttttt
   */
  private makeRemind(bangumiName: string, timeDifference: number, aheadTime: number): NodeJS.Timeout {

  	let aheadTimeM: number = aheadTime * 1000;

  	return setTimeout(async () => {
  		if (aheadTime === 0) {
  			vscode.window.showInformationMessage(`
        《${bangumiName}》 更新啦！🎉
        `, "Open WeekBangumi").then((result: string | undefined) => {
  				if (result) {
  					vscode.commands.executeCommand("weekBangumi");
  				}
  			});
  		} else {
  			let minute = toMinuteFromSecode(aheadTime);
  			vscode.window.showInformationMessage(`
        《${bangumiName}》 还有${minute}分钟就更新啦！ 🎉
        `, "Open WeekBangumi").then((result: string | undefined) => {
  				if (result) {
  					vscode.commands.executeCommand("weekBangumi");
  				}
  			});
  		}
  	}, timeDifference - aheadTimeM);
  }

  /**
 * Destroy reminder
 *
 * @author sdttttt
 */
  destroyReminder() {
  	if (!isEmptyArray(this.remindTimers)) {
  		this.remindTimers.forEach((timer: NodeJS.Timeout) => {
  			clearTimeout(timer);
  		});
  		this.remindTimers = [];
  	}
  }
};
