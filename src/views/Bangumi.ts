import * as vscode from "vscode";
import { getAllBangumi } from "../request/bangumi";
import { getExtensionContext } from "../utils/context";
import * as HtmlUtils from '../views/bangumi_html';

// flag => windows whether is open
let flag: boolean = false;

/**
 * Creates bangumi view
 * @param data 
 * @author sdttttt
 */
function createBangumiView(data: any) {

  const context: vscode.ExtensionContext = getExtensionContext();

  if (flag) { return; }

  const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
    "zhui fan xiao zu jian",
    "test",
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: false,
      enableFindWidget: true
    }
  );

  flag = true;

  panel.webview.html = HtmlUtils.generateHTML(data);

  vscode.window.showInformationMessage(` Oh! a total of ${data.count} !`);

  panel.onDidDispose(
    () => { flag = false; },
    null,
    context.subscriptions
  );
}

/**
 * Opens bangumi
 * @author sdttttt
 */
export function openBangumi() {
  getAllBangumi(createBangumiView);
}