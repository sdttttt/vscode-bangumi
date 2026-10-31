import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/preact";

/**
 * Stand-in for the API VS Code injects into a webview.
 *
 * @author sdttttt
 */
export const vsCodeApi = {
    getState: vi.fn(() => undefined),
    setState: vi.fn(),
    postMessage: vi.fn(),
};

/*
 * The bundle runs inside VS Code, where `acquireVsCodeApi` is injected. The
 * module is evaluated at import time, so the global must exist before any test
 * imports `api.ts`.
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
