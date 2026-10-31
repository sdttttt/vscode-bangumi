import { vi } from "vitest";

/*
 * Unit tests run in Node.js, where the `vscode` module does not exist.
 * Registering the stub globally keeps every test file free of boilerplate.
 */
vi.mock("vscode", async () => {
    const { createVSCodeMock } = await import("./mocks/vscode");
    return createVSCodeMock();
});
