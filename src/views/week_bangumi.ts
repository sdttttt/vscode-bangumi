import { getWeekBangumi } from "../request/bangumi";
import * as vscode from "vscode";
import WeekBangumisHTMLGenerator from "../html/week_bangumi_html";
import { WeekBangumiData } from '../request/structure';
import AbstractView from './view';
import { isToday, currentTimestamp } from '../utils/strings';
import { isEmptyArray } from '../utils/type';
import { getConfig } from '../configuration';

/**
 * Week Bangumi View
 *
 * @class
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
   * TODO: NOT TEST
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

    let todayIndex: number = 0;


    // 🌶个索引才是今天呢？
    for (let i = 0; i < bangumisData.length; i++) {
      if (isToday(bangumisData[i].date)) {
        todayIndex = i;
        break;
      }
    }

    const currentTime: number = currentTimestamp();

    for (let i = todayIndex; i <= todayIndex + 1; i++) {
      for (const bangumi of bangumisData[i].seasons) {
        const bangumiTime: number = bangumi.pub_ts * 1000;
        if (currentTime < bangumiTime) {
          const timeDifference: number = bangumiTime - currentTime;

          const timer: NodeJS.Timeout = setTimeout((bangumiName: string) => {
            const useReminder: any = getConfig("BangumiOpen.EnableReminder");
            if(!<boolean>useReminder) {
              return;
            }
            vscode.window.showInformationMessage(`
              《${bangumiName}》 更新啦！🎉
              `, "Open WeekBangumi").then((result: string | undefined) => {
                if (result) {
                  vscode.commands.executeCommand("weekBangumi");
                }
              });
          }, timeDifference, bangumi.title);

          this.remindTimers.push(timer);
        }
      }
    }
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
