import * as vscode from 'vscode';
import { createWebviewPanel } from '../utils/view';

/**
 * Abstract view.
 * 
 * @abstract
 * @class AbstractView
 * @author sdttttt
 */
export default abstract class AbstractView {

    protected abstract readonly viewType: string;
    protected abstract readonly title: string;

    protected panelView: vscode.WebviewPanel | undefined;
    protected columToShowIn: vscode.ViewColumn | undefined;

    /**
     * initializer an instance of abstract view.
     */
    protected constructor() {
        this.columToShowIn = vscode.window.activeTextEditor ?
            vscode.window.activeTextEditor.viewColumn :
            undefined;
        this.panelView = undefined;
    }

    /**
     *  Show WebViewPanel
     *  need Callback function
     *
     * @param {(pv: vscode.WebviewPanel) => void} callback
     */
    openWebViewPanel(callback: (pv: vscode.WebviewPanel) => void) {
        if (this.panelView) {
            this.panelView.reveal(this.columToShowIn);
            callback(this.panelView);
        } else {
            const that = this;
            this.panelView = createWebviewPanel("html", "Week Bangumis", () => {
                that.panelView = undefined;
            });

            callback(this.panelView);
        }
    }
}