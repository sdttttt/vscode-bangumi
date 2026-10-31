import type { ViewState } from "@shared/webview/protocol";

/**
 * Local images every state carries in production.
 *
 * @author sdttttt
 */
export const assets = {
    todayBadge: "webview:/resources/heiheihei.gif",
    loading: "webview:/resources/loading.gif",
    enterprise: "webview:/resources/enterprise.jpg",
};

/**
 * A ready to render state.
 *
 * @author sdttttt
 */
export const viewState = (overrides: Partial<ViewState> = {}): ViewState => ({
    kind: "loading",
    assets,
    ...overrides,
});
