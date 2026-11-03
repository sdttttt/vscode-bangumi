import * as vscode from "vscode";
import type { WebviewHost } from "../webview/host";
import type { ViewState, WebviewCommand } from "../webview/protocol";

/**
 * 面板需要知道的、关于它所承载视图的信息。
 *
 * @author sdttttt
 */
export interface PanelConfig {
    /** Webview 面板类型，每个视图唯一。 */
    readonly viewType: string;
    /** 编辑器界面展示的文档标题。 */
    readonly title: string;
    /** 同一会话的文档工厂。 */
    readonly host: WebviewHost;
    /** 同一会话的可释放对象，通常是 `context.subscriptions`。 */
    readonly subscriptions: Array<vscode.Disposable>;
    /**
     * 创建编辑器面板。注入而非内部实现，模块因此不会自行决定开在哪一列，
     * 测试也可以装载一个面板替身。
     */
    readonly createPanel: (
        viewType: string,
        title: string
    ) => vscode.WebviewPanel;
}

/**
 * 视图所面对的面板接口。
 *
 * @author sdttttt
 */
export interface Panel {
    /** 向 Webview 发送状态，需要时创建面板。 */
    show(state: ViewState): void;
    showLoading(): void;
    showNotFound(): void;
    /**
     * 两个数据来源都不可用时的占位界面。
     *
     * 与 `showNotFound` 区分开：那里是「这次确实没有数据」，这里是「连不上，
     * 正在定时重试」，用户能据此决定是换个时间再试还是去查网络。
     */
    showUnavailable(): void;
    /**
     * 注册 Webview 消息转发的命令处理器。
     *
     * 由组合根在视图创建之后注册，面板因此无需知道自己属于哪个视图。
     */
    onCommand(handler: (command: WebviewCommand) => void): void;
    /**
     * 注册面板被用户关闭时的监听。
     *
     * 视图用它作废在途的异步响应：面板已随用户的意图消失，迟到的数据
     * 不应该把面板重新拉起来。
     */
    onDidClose(listener: () => void): void;
}

/**
 * 创建某个视图的面板。
 *
 * 面板在首次渲染时创建，用户关闭时释放；每当 Webview 文档被重建时就重放最后一份状态
 * ——由于 `retainContextWhenHidden` 关闭，面板每次隐藏再显示都会重建文档。
 *
 * @author sdttttt
 */
export function usePanel(config: PanelConfig): Panel {
    let panel: vscode.WebviewPanel | undefined;
    let lastState: ViewState = { kind: "loading" };
    let commandHandler: (command: WebviewCommand) => void = () => undefined;
    const closeListeners: Array<() => void> = [];

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
                    for (const listener of closeListeners) {
                        listener();
                    }
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
        showUnavailable: () => render({ kind: "unavailable" }),
        onCommand: handler => {
            commandHandler = handler;
        },
        onDidClose: listener => {
            closeListeners.push(listener);
        },
    };
}
