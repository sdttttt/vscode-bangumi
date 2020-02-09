import * as vscode from "vscode";
import { getAllBangumi } from "../request/bangumi";
import { getExtensionContext } from "../utils/context";
import * as HtmlUtils from '../views/bangumi_html';
import { BangumiUrl } from "../utils/constant";
import { BangumisResponse } from "../request/structure";

// flag => windows whether is open
let flag: boolean = false;

// Bangumi Url Object => build Bangumi Url
const bangumiUrl: BangumiUrl = new BangumiUrl();

/**
 * Creates bangumi view
 *
 * @param bangumis
 * @author sdttttt
 */
function createBangumiView(bangumis: BangumisResponse) {

  const context: vscode.ExtensionContext = getExtensionContext();

  const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
    "Hello",
    "Bangumis",
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: false,
      enableFindWidget: true
    }
  );

  flag = true;

  panel.webview.html = HtmlUtils.generateHTML(bangumis.data.list);

  panel.onDidDispose(
    () => { flag = false; },
    null,
    context.subscriptions
  );
}

/**
 * Opens bangumi View
 *
 * @author sdttttt
 */
export function openBangumi() {
  if (flag) {
    vscode.window.showWarningMessage("Bangumis has been opened!");
    return;
  }
  vscode.window.showInformationMessage("opening Bangumi ...");
  getAllBangumi(bangumiUrl, createBangumiView);
}