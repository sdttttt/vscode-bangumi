import { getWeekBangumi } from "../request/bangumi";
import * as vscode from "vscode";
import WeekBangumisHTMLGenerator from "../html/week_bangumi_html";
import { WeekBangumiData } from '../request/structure';
import AbstractView from './view';
import { isToday, currentTimestamp } from '../utils/strings';
import { isEmptyArray } from '../utils/type';

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
  async startBangumiUpdateReminder() {
    let bangumisData: Array<WeekBangumiData> | undefined =
      await getWeekBangumi();

    if (!bangumisData) {
      vscode.window.showWarningMessage("有这种事？每周番剧获取失败！🅰");
      return;
    } else {
      vscode.window.showWarningMessage("正在载入...");
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

    /**
     * 首先这里只遍历2次
     * 分别是今天和明天.
     * 应该不会有 **整整把vscode开了三天的人吧** 💠
     *
     * 然后便利这这两天所有的番剧
     * 超过当前时间戳的,也就是未来
     * 会开启一个定时器，时间到了就提醒开发者🦐
     */
    for (let i = todayIndex; i <= todayIndex + 1; i++) {
      for (const bangumi of bangumisData[i].seasons) {
        const bangumiTime: number = bangumi.pub_ts * 1000;
        if (currentTime < bangumiTime) {
          const timeDifference: number = bangumiTime - currentTime;

          const timer: NodeJS.Timeout = setTimeout((bangumiName: string) => {
            vscode.window.showInformationMessage(`
              SDTTTTT: 《${bangumiName}》 更新🌶！
            `);
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
