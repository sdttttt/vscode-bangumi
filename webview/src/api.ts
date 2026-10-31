import type { ViewState, WebviewCommand } from "@shared/webview/protocol";

/**
 * Typed access to the API VS Code injects into every webview.
 *
 * `acquireVsCodeApi` may only be called once per document, so every module
 * goes through this singleton instead of calling the global directly.
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
 * Reads the state the host persisted before the document was recreated.
 *
 * @author sdttttt
 */
export function readState(): ViewState | undefined {
    return api.getState();
}

/**
 * Persists the state so a hidden panel can be restored without a round trip.
 *
 * @author sdttttt
 */
export function saveState(state: ViewState): void {
    api.setState(state);
}

/**
 * Sends a command to the extension host.
 *
 * @author sdttttt
 */
export function send(command: WebviewCommand): void {
    api.postMessage(command);
}

/**
 * Subscribes to state pushed by the extension host.
 *
 * @returns a function that removes the listener
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
