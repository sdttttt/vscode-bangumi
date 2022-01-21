import * as vscode from "vscode";
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
    protected constructor();
    /**
     *  Quick Create a WebviewPanel
     *
     * @export
     * @param {string} viewType
     * @param {string} title
     * @param {() => any} listener
     * @returns {vscode.WebviewPanel}
     *
     * @author sdttttt
     */
    private createWebviewPanel;
    /**
     *  Show WebViewPanel
     *  need Callback function
     *
     * @param {(pv: vscode.WebviewPanel) => void} callback
     */
    protected openWebViewPanel(callback: (pv: vscode.WebviewPanel) => void): void;
    /**
     * Shows loading view
     *
     * @author sdttttt
     */
    protected showLoadingView(): void;
    /**
     * Show NotFound View.
     *
     * @protected
     * @memberof AbstractView
     * @author sdttttt
     */
    protected showNotFoundView(): void;
}
