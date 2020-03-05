import * as vscode from "vscode";
import { getAllBangumi } from "../request/bangumi";
import BangumisHTMLGenerator from '../html/bangumi_html';
import { BangumiUrl } from "../request/bangumi_url";
import { Bangumi, BangumisData } from '../request/structure';
import { toNumber } from '../utils/type';
import AbstractView from './view';

/**
 * Bangumi View.
 *
 * @class BangumisView
 * @author sdttttt
 */
export default new class BangumisView extends AbstractView {

  protected readonly viewType: string = "html";
  protected readonly title: string = "bangumis";

  private pageNumber: number;

  private readonly bangumiUrl: BangumiUrl;

  constructor() {
    super();
    this.bangumiUrl = new BangumiUrl;
    this.pageNumber = 1;
  }

  /**
    * Creates bangumi view
    *
    * @param bangumis
    * @author sdttttt
    */
  private createBangumiView(bangumiRes: BangumisData) {
    const bangumis: Array<Bangumi> = bangumiRes.list;

    this.openWebViewPanel(
      (pv: vscode.WebviewPanel) => {
        pv.webview.html = BangumisHTMLGenerator.generateHTML(bangumis);
      }
    );
  }

  /**
  * show number of Page
  * @author sdttttt
  */
  private showPageNumber() {
    vscode.window.showInformationMessage(`🐶 第${this.pageNumber}页`);
  }

  /**
  * Opens bangumi View
  *
  * @author sdttttt
  */
  openBangumi() {
    this.showLoadingView();
    const that = this;

    getAllBangumi(this.bangumiUrl.setPage(this.pageNumber))
      .then((data: BangumisData | undefined) => {
        if (data) {
          that.createBangumiView(data);
        }
      });
  }

  /**
  * Next Page
  *
  * @export
  * @author sdttttt
  */
  nextPage() {
    this.pageNumber++;
    this.showPageNumber();
    this.openBangumi();
  }

  /**
  *  back Page
  *
  * @export
  * @author sdttttt
  */
  backPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.showPageNumber();
      this.openBangumi();
    } else {
      this.pageNumber = 1;
      vscode.window.showInformationMessage("😰真的一滴都没有了!");
      this.openBangumi();
    }
  }

  /**
  * Jump to number of Page
  *
  * @export
  * @author sdttttt
  */
  jumpPage() {

    const inputOptions: vscode.InputBoxOptions = {
      value: "1",
      prompt: `TIP: 最大页数大概在150左右 🚀`
    };

    const inputResult = vscode.window.showInputBox(
      inputOptions
    );

    const that = this;

    inputResult.then((text: string | undefined) => {
      const number = toNumber(text);
      if (number === 0) {
        vscode.window.showInformationMessage(`
        输入的内容,不能是0或者非数字
        数字大小不做限制.
      `);
        return;
      } else {
        that.pageNumber = number;
        that.openBangumi();
      }
    });
  }
};
