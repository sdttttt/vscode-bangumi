/// <reference types="node" />
/// <reference types="mocha" />
import * as vscode from "vscode";
import { WeekBangumiData } from "../request/structure";
declare const _default: {
    readonly viewType: "html";
    readonly title: "Week Bangumis";
    remindTimers: Array<NodeJS.Timeout>;
    /**
     * Creates Week bangumi view
     *
     * @param {Array<WeekBangumiData>} data
     * @author sdttttt
     */
    createWeekBangumiView(data: Array<WeekBangumiData>): void;
    /**
     * Opens week bangumi
     *
     * @author sdttttt
     */
    openWeekBangumi(): void;
    panelView: vscode.WebviewPanel | undefined;
    columToShowIn: vscode.ViewColumn | undefined;
    createWebviewPanel(closeListener: () => unknown): vscode.WebviewPanel;
    openWebViewPanel(callback: (pv: vscode.WebviewPanel) => void): void;
    showLoadingView(): void;
    showNotFoundView(): void;
};
/**
 * Week Bangumi View
 *
 * @class
 * @export
 * @author sdttttt
 */
export default _default;
