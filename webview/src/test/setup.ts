import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/preact";

/**
 * VS Code 注入 Webview 的 API 的替身。
 *
 * @author sdttttt
 */
export const vsCodeApi = {
    getState: vi.fn(() => undefined),
    setState: vi.fn(),
    postMessage: vi.fn(),
};

/*
 * 打包产物运行在 VS Code 中，`acquireVsCodeApi` 由宿主注入。模块在导入时就会求值，
 * 因此这个全局函数必须在任何测试导入 `api.ts` 之前存在。
 */
Object.assign(globalThis, {
    acquireVsCodeApi: () => vsCodeApi,
});

afterEach(() => {
    cleanup();
    vsCodeApi.getState.mockReset();
    vsCodeApi.setState.mockReset();
    vsCodeApi.postMessage.mockReset();
});
