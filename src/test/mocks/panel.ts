import { vi } from "vitest";
import type { Uri, Webview, WebviewPanel } from "vscode";
import type { ViewState } from "@/webview/protocol";

/**
 * `WebviewPanel` 替身，记录扩展向它发送的内容。
 *
 * 该替身同时实现 `asWebviewUri`，宿主因此无需真实编辑器就能构建文档与资源 Uri。
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
    /** 按顺序记录发送给 Webview 的每一份状态。 */
    posted(): Array<ViewState>;
    /** 模拟 Webview 产物发来的消息。 */
    receive(command: unknown): void;
    /** 运行通过 `onDidDispose` 注册的监听。 */
    dispose(): void;
}

/**
 * 创建面板替身。
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
