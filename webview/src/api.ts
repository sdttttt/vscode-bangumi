import type {
    ViewState,
    ViewKind,
    WebviewCommand,
} from "@shared/webview/protocol";

/**
 * 状态推送里合法的视图种类。
 *
 * 以 `Record<ViewKind, true>` 而不是裸字符串集合书写：漏掉一个种类是
 * 编译错误，而不是运行期把宿主的推送悄悄丢弃——`unavailable` 曾被这样
 * 丢过，双源停摆的占位页因此永远显示不出来。
 *
 * @author sdttttt
 */
const KNOWN_KINDS: Readonly<Record<ViewKind, true>> = {
    loading: true,
    notFound: true,
    unavailable: true,
    bangumi: true,
    weekBangumi: true,
};

/**
 * 判断一份来路不明的数据是否为宿主推送的状态。
 *
 * 宿主与页面共用同一个 `window.message` 通道：形状不对的杂音不能进状态机，
 * 更不能被持久化——否则文档重建时首渲染即抛错，`ready` 永远发不出去，
 * 面板从此空白。
 *
 * @author sdttttt
 */
function isViewState(value: unknown): value is ViewState {
    if ("object" !== typeof value || null === value) {
        return false;
    }

    const kind = (value as { kind?: unknown }).kind;

    return "string" === typeof kind && Boolean(KNOWN_KINDS[kind as ViewKind]);
}

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
    const handler = (event: MessageEvent): void => {
        if (!isViewState(event.data)) {
            return;
        }

        listener(event.data);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
}
