import type { ViewState, WebviewCommand } from "@shared/webview/protocol";

/**
 * VS Code 注入到每个 Webview 的 API 的类型化封装。
 *
 * 每个文档只允许调用一次 `acquireVsCodeApi`，因此各模块统一走这个单例，
 * 而不是直接调用全局函数。
 *
 * @author sdttttt
 */
interface VsCodeApi {
    getState(): ViewState | undefined;
    postMessage(message: WebviewCommand): void;
    setState(state: ViewState): void;
}

declare global {
    function acquireVsCodeApi(): VsCodeApi;
}

const api: VsCodeApi = acquireVsCodeApi();

/**
 * 读取宿主在文档重建之前保存的状态。
 *
 * @author sdttttt
 */
export function readState(): ViewState | undefined {
    return api.getState();
}

/**
 * 持久化状态，隐藏的面板因此无需往返一次即可恢复内容。
 *
 * @author sdttttt
 */
export function saveState(state: ViewState): void {
    api.setState(state);
}

/**
 * 向扩展宿主发送命令。
 *
 * @author sdttttt
 */
export function send(command: WebviewCommand): void {
    api.postMessage(command);
}

/**
 * 订阅扩展宿主推送的状态。
 *
 * @returns 用于移除监听的函数
 * @author sdttttt
 */
export function onHostMessage(
    listener: (state: ViewState) => void
): () => void {
    const handler = (event: MessageEvent<ViewState>): void => {
        listener(event.data);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
}
