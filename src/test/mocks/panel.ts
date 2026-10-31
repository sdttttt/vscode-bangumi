import { vi } from "vitest";
import type { Uri, Webview, WebviewPanel } from "vscode";
import type { ViewState } from "@/webview/protocol";

/**
 * A `WebviewPanel` double that records what the extension posts to it.
 *
 * The stub also answers `asWebviewUri` so the host can build the document and
 * the asset URIs without a real editor.
 *
 * @author sdttttt
 */
export interface PanelStub {
    panel: WebviewPanel;
    webview: {
        html: string;
        postMessage: ReturnType<typeof vi.fn>;
        onDidReceiveMessage: ReturnType<typeof vi.fn>;
    };
    reveal: ReturnType<typeof vi.fn>;
    /** Every state posted to the webview, in order. */
    posted(): Array<ViewState>;
    /** Simulates a message sent by the webview bundle. */
    receive(command: unknown): void;
    /** Runs the listener registered through `onDidDispose`. */
    dispose(): void;
}

/**
 * Builds a panel double.
 *
 * @author sdttttt
 */
export function createPanelStub(): PanelStub {
    let messageListener: ((command: unknown) => void) | undefined;
    let disposeListener: (() => unknown) | undefined;
    const messages: Array<ViewState> = [];

    const postMessage = vi.fn((state: ViewState) => {
        messages.push(state);
        return Promise.resolve(true);
    });

    const onDidReceiveMessage = vi.fn(
        (listener: (command: unknown) => void) => {
            messageListener = listener;
            return { dispose: () => undefined };
        }
    );

    const webview = {
        html: "",
        cspSource: "vscode-webview://test",
        asWebviewUri: (uri: Uri) => `webview:${uri.fsPath}`,
        postMessage,
        onDidReceiveMessage,
    } as unknown as PanelStub["webview"];

    const panel = {
        webview: webview as unknown as Webview,
        reveal: vi.fn(),
        onDidDispose: vi.fn((listener: () => unknown) => {
            disposeListener = listener;
            return { dispose: () => undefined };
        }),
        dispose: vi.fn(),
    } as unknown as WebviewPanel;

    return {
        panel,
        webview,
        reveal: panel.reveal as ReturnType<typeof vi.fn>,
        posted: () => messages,
        receive: (command: unknown) => messageListener?.(command),
        dispose: () => disposeListener?.(),
    };
}
