import type { ViewState } from "@shared/webview/protocol";

/**
 * 生产环境中每份状态都会携带的本地图片。
 *
 * @author sdttttt
 */
export const assets = {
    todayBadge: "webview:/resources/heiheihei.gif",
    loading: "webview:/resources/loading.gif",
    enterprise: "webview:/resources/enterprise.jpg",
};

/**
 * 一份可直接渲染的状态。
 *
 * @author sdttttt
 */
export const viewState = (overrides: Partial<ViewState> = {}): ViewState => ({
    kind: "loading",
    assets,
    ...overrides,
});
