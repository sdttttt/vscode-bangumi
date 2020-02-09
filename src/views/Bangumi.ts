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
 * @param bangumis
 * @author sdttttt
 */
function createBangumiView(bangumis: BangumisResponse) {

  const context: vscode.ExtensionContext = getExtensionContext();

  if (flag) { return; }

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

  vscode.window.showInformationMessage(` Oh! a total of ${bangumis.data.list.length} !`);

  panel.onDidDispose(
    () => { flag = false; },
    null,
    context.subscriptions
  );
}

/**
 * Opens bangumi View
 * @author sdttttt
 */
export function openBangumi() {
  getAllBangumi(bangumiUrl, createBangumiView);
}