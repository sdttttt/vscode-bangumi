import { getWeekBangumi } from "../request/bangumi";
import * as vscode from "vscode";
import WeekBangumisHTMLGenerator from "../html/week_bangumi_html";
import { WeekBangumiData } from '../request/structure';
import AbstractView from './view';

/**
 * Week Bangumi View
 * 
 * @class
 * @author sdttttt
 */
export default new class WeekBangumisView extends AbstractView {
  protected readonly viewType = "html";
  protected readonly title = "Week Bangumis";

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
    const that = this;

    getWeekBangumi().then((result: Array<WeekBangumiData> | undefined) => {
      if (result) {
        that.createWeekBangumiView(result);
      }
    });
  }
};
