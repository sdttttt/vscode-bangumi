import { vi } from "vitest";

/*
 * 单元测试运行在 Node.js 中，没有 `vscode` 模块。
 * 在这里全局注册桩，各个测试文件因此无需重复写样板代码。
 */
vi.mock("vscode", async () => {
    const { createVSCodeMock } = await import("./mocks/vscode");
    return createVSCodeMock();
});
