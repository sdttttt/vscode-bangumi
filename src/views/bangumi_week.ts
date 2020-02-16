import { getWeekBangumi } from "../request/bangumi";
import * as vscode from "vscode";
import { createWebviewPanel } from "../utils/view";
import { WeekBangumiData } from '../request/structure';
import { generateHTML } from "./bangumi_week_html";

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
      panelView = createWebviewPanel("html", "Week Bangumis", () => {
        panelView = undefined;
      });
  
      callback(panelView);
    }
}

/**
 * Creates Week bangumi view
 *
 * @param {Array<WeekBangumiData>} data
 * @author sdttttt
 */
function createWeekBangumiView(data: Array<WeekBangumiData>) {

    callWebViewPanel(
      (pv: vscode.WebviewPanel) => {
        pv.webview.html = generateHTML(data);
      }
    );
  }

export function openWeekBangumi() {
    getWeekBangumi(createWeekBangumiView);
}
