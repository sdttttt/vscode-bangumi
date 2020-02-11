import * as vscode from "vscode";
import { getAllBangumi } from "../request/bangumi";
import * as HtmlUtils from './bangumi_html';
import { BangumiUrl } from "../utils/bangumi_url";
import { BangumisResponse, Bangumi } from '../request/structure';
import { globalVar } from '../constant';
import { createWebviewPanel } from "../utils/view";
import { toNumber } from '../utils/type';

export let context: vscode.ExtensionContext | undefined = undefined;

// Bangumi Url Object => build Bangumi Url
const bangumiUrl: BangumiUrl = new BangumiUrl();

// Bangumi WebviewPanel
let panelView: vscode.WebviewPanel | undefined = undefined;

// column To show In
const columnToShowIn: vscode.ViewColumn | undefined = vscode.window.activeTextEditor ?
  vscode.window.activeTextEditor.viewColumn :
  undefined;

/**
 *  Show WebViewPanel
 *  need Callback function
 *
 * @param {(pv: vscode.WebviewPanel) => void} callback
 */
function callWebViewPanel(callback: (pv: vscode.WebviewPanel) => void) {

  if (panelView) {
    panelView.reveal(columnToShowIn);
    callback(panelView);
  } else {
    panelView = createWebviewPanel("html", "Bangumis", () => {
      panelView = undefined;
    });

    callback(panelView);
  }
}

let pageNumber: number = 1;

/**
 * Creates bangumi view
 *
 * @param bangumis
 * @author sdttttt
 */
function createBangumiView(bangumiRes: BangumisResponse) {

  const bangumis: Array<Bangumi> = bangumiRes.data.list;

  if (bangumis.length === 0) {
    vscode.window.showInformationMessage(`
        💀没有数据可以渲染
    `);
    return;
  }

  callWebViewPanel(
    (pv: vscode.WebviewPanel) => {
      pv.webview.html = HtmlUtils.generateHTML(bangumis);
    }
  );
}

/**
 * show number of Page
 * @author sdttttt
 */
function showPageNumber() {
  vscode.window.showInformationMessage(`✔ 第${pageNumber}页`);
}

/**
 * Opens bangumi View
 *
 * @author sdttttt
 */
export function openBangumi() {
  getAllBangumi(
    bangumiUrl.setPage(pageNumber)
    , createBangumiView);
}

/**
 * Next Page
 *
 * @export
 * @author sdttttt
 */
export function nextPage() {
  pageNumber++;
  showPageNumber();
  openBangumi();
}

/**
 *  back Page
 *
 * @export
 * @author sdttttt
 */
export function backPage() {
  if (pageNumber > 1) {
    pageNumber--;
    showPageNumber();
    openBangumi();
  } else {
    pageNumber = 1;
    vscode.window.showInformationMessage("😰真的一滴都没有了!");
    openBangumi();
  }
}


/**
 * Jump to number of Page
 *
 * @export
 * @author sdttttt
 */
export function jumpPage() {

  const inputOptions: vscode.InputBoxOptions = {
    value: "1",
    prompt: `TIP: 最大页数大概在50左右 ❤`
  };

  const inputResult = vscode.window.showInputBox(
    inputOptions
  );

  inputResult.then((text: string | undefined) => {
    const number = toNumber(text);
    if (number === 0) {
      vscode.window.showInformationMessage(`
        输入的内容,不能是0或者非数字
        数字大小不做限制.
      `);
      return;
    } else {
      pageNumber = number;
      openBangumi();
    }
  });
}