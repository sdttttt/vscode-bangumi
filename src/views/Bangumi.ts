import * as vscode from "vscode";
import { getAllBangumi } from "../request/bangumi";
import * as HtmlUtils from '../views/bangumi_html';
import { BangumiUrl } from "../utils/bangumi_url";
import { BangumisResponse } from "../request/structure";
import { globalVar } from '../utils/constant';

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
 *  show View
 *  need Callback function
 *
 * @param {(pv: vscode.WebviewPanel) => void} callback
 */
function initWebViewPanel(callback: (pv: vscode.WebviewPanel) => void) {

  if (panelView) {
    panelView.reveal(columnToShowIn);
    callback(panelView);
  } else {
    panelView = vscode.window.createWebviewPanel(
      "Hello",
      "Bangumis",
      vscode.ViewColumn.Two,
      {
        retainContextWhenHidden: false,
        enableFindWidget: true
      }
  );

  callback(panelView);
    // Close Event
    panelView.onDidDispose(
      () => {
        vscode.window.showInformationMessage("Shit");
        panelView = undefined;
      },
      null,
      globalVar().context.subscriptions
    );
  }
}

let pageNumber: number = 1;

/**
 * Creates bangumi view
 *
 * @param bangumis
 * @author sdttttt
 */
function createBangumiView(bangumis: BangumisResponse) {
  initWebViewPanel(
    (pv: vscode.WebviewPanel) => {
      pv.webview.html = HtmlUtils.generateHTML(bangumis.data.list);
    }
  );
}

/**
 * show number of Page
 * @author sdttttt
 */
function showPageNumber() {
  vscode.window.showInformationMessage(`现在是第${pageNumber}页哦~`);
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