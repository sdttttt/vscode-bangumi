import * as vscode from "vscode";
import { getContext } from "../constants";
import {
    createWebviewHtml,
    getWebviewOptions,
    withAssets,
} from "../webview/host";
import type { ViewState, WebviewCommand } from "../webview/protocol";

/**
 * Abstract view.
 *
 * Owns the panel lifecycle and mirrors the data it is given into the webview.
 * Subclasses only decide *what* to render, never *how* the document is built.
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

    /*
     * Last state pushed to the panel. Replayed whenever the webview document is
     * recreated, which happens every time the panel is hidden and shown again
     * because `retainContextWhenHidden` is off.
     */
    private state: ViewState = { kind: "loading" };

    /**
     * initializer an instance of abstract view.
     */
    protected constructor() {
        this.columToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        this.panelView = undefined;
    }

    /**
     * Handles a command sent by the webview.
     *
     * Subclasses override the commands they understand and ignore the rest.
     *
     * @author sdttttt
     */
    protected handleWebviewCommand(_command: WebviewCommand): void {
        /* nothing to do by default */
    }

    /**
     * Wires the panel webview to this view.
     *
     * @author sdttttt
     */
    private bindWebview(panel: vscode.WebviewPanel): void {
        const context: vscode.ExtensionContext = getContext();
        const webview = panel.webview;

        webview.html = createWebviewHtml(webview, this.title);

        webview.onDidReceiveMessage(
            (command: WebviewCommand) => {
                if ("ready" === command.type) {
                    this.render(this.state);
                    return;
                }
                this.handleWebviewCommand(command);
            },
            null,
            context.subscriptions
        );
    }

    /**
     *  Quick Create a WebviewPanel
     *
     * @param {() => unknown} closeListener
     * @returns {vscode.WebviewPanel}
     * @author sdttttt
     */
    private createWebviewPanel(
        closeListener: () => unknown
    ): vscode.WebviewPanel {
        const context: vscode.ExtensionContext = getContext();

        const panel = vscode.window.createWebviewPanel(
            this.viewType,
            this.title,
            vscode.ViewColumn.Two,
            getWebviewOptions()
        );

        this.bindWebview(panel);
        panel.onDidDispose(closeListener, null, context.subscriptions);
        return panel;
    }

    /**
     *  Show WebViewPanel
     *
     * @param {(pv: vscode.WebviewPanel) => void} callback
     * @author sdttttt
     */
    protected openWebViewPanel(
        callback: (pv: vscode.WebviewPanel) => void
    ): void {
        if (this.panelView) {
            this.panelView.reveal(this.columToShowIn);
            callback(this.panelView);
        } else {
            this.panelView = this.createWebviewPanel(() => {
                this.panelView = undefined;
            });

            callback(this.panelView);
        }
    }

    /**
     * Sends a state to the webview, creating the panel when needed.
     *
     * @author sdttttt
     */
    protected render(state: ViewState): void {
        this.state = state;

        this.openWebViewPanel((panel: vscode.WebviewPanel) => {
            panel.webview.postMessage(withAssets(panel.webview, state));
        });
    }

    /**
     * Shows loading view
     *
     * @author sdttttt
     */
    protected showLoadingView(): void {
        this.render({ kind: "loading" });
    }

    /**
     * Show NotFound View.
     *
     * @protected
     * @memberof AbstractView
     * @author sdttttt
     */
    protected showNotFoundView(): void {
        this.render({ kind: "notFound" });
    }
}
