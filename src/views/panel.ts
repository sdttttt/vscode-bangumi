import * as vscode from "vscode";
import type { WebviewHost } from "../webview/host";
import type { ViewState, WebviewCommand } from "../webview/protocol";

/**
 * What a panel needs to know about the view it hosts.
 *
 * @author sdttttt
 */
export interface PanelConfig {
    /** Webview panel type, unique per view. */
    readonly viewType: string;
    /** Document title shown by the editor chrome. */
    readonly title: string;
    /** Document factory of the same session. */
    readonly host: WebviewHost;
    /** Disposables of the same session, usually `context.subscriptions`. */
    readonly subscriptions: Array<vscode.Disposable>;
    /**
     * Creates the editor panel. Injected so the module never decides on its own
     * which column to open in, and so a test can install a panel double.
     */
    readonly createPanel: (
        viewType: string,
        title: string
    ) => vscode.WebviewPanel;
}

/**
 * The surface a view talks to.
 *
 * @author sdttttt
 */
export interface Panel {
    /** Sends a state to the webview, creating the panel when needed. */
    show(state: ViewState): void;
    showLoading(): void;
    showNotFound(): void;
    /**
     * Registers the command handler the webview messages are forwarded to.
     *
     * Registered by the composition root after the view exists, so the panel
     * never has to know which view it belongs to.
     */
    onCommand(handler: (command: WebviewCommand) => void): void;
}

/**
 * Creates the panel of one view.
 *
 * The panel is created on the first render and released when the user closes
 * it, and the last state is replayed whenever the webview document is
 * recreated — which happens every time the panel is hidden and shown again,
 * because `retainContextWhenHidden` is off.
 *
 * @author sdttttt
 */
export function usePanel(config: PanelConfig): Panel {
    let panel: vscode.WebviewPanel | undefined;
    let lastState: ViewState = { kind: "loading" };
    let commandHandler: (command: WebviewCommand) => void = () => undefined;

    const render = (state: ViewState): void => {
        lastState = state;

        if (!panel) {
            panel = config.createPanel(config.viewType, config.title);

            const webview = panel.webview;
            webview.html = config.host.html(webview, config.title);
            webview.onDidReceiveMessage(
                (command: WebviewCommand) => {
                    if ("ready" === command.type) {
                        webview.postMessage(
                            config.host.withAssets(webview, lastState)
                        );
                        return;
                    }
                    commandHandler(command);
                },
                null,
                config.subscriptions
            );

            panel.onDidDispose(
                () => {
                    panel = undefined;
                },
                null,
                config.subscriptions
            );
        } else {
            panel.reveal();
        }

        const webview = panel.webview;
        webview.postMessage(config.host.withAssets(webview, state));
    };

    return {
        show: render,
        showLoading: () => render({ kind: "loading" }),
        showNotFound: () => render({ kind: "notFound" }),
        onCommand: handler => {
            commandHandler = handler;
        },
    };
}
