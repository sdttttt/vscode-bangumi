import { vi } from "vitest";

/**
 * A disposable matching the shape of `vscode.Disposable`.
 *
 * @author sdttttt
 */
export class Disposable {
    public dispose(): void {
        /* nothing to release in tests */
    }
}

/**
 * Builds a stub of the `vscode` module.
 *
 * Unit tests run in plain Node.js, so the real module is unavailable. The stub
 * only covers the API surface this extension touches; extend it when a new API
 * is imported by production code.
 *
 * @author sdttttt
 */
export function createVSCodeMock() {
    const configuration = {
        get: vi.fn((_key: string, fallback?: unknown) => fallback),
        has: vi.fn(() => false),
        inspect: vi.fn(),
        update: vi.fn(),
    };

    const commands = {
        registerCommand: vi.fn(() => new Disposable()),
        executeCommand: vi.fn(() => Promise.resolve(undefined)),
        getCommands: vi.fn(() => Promise.resolve([])),
    };

    const window = {
        activeTextEditor: undefined,
        showInformationMessage: vi.fn(() => Promise.resolve(undefined)),
        showErrorMessage: vi.fn(() => Promise.resolve(undefined)),
        showInputBox: vi.fn(() => Promise.resolve(undefined)),
        createWebviewPanel: vi.fn(),
        createStatusBarItem: vi.fn(() => ({
            text: "",
            tooltip: undefined,
            command: undefined,
            show: vi.fn(),
            hide: vi.fn(),
            dispose: vi.fn(),
        })),
    };

    return {
        Disposable,
        Uri: {
            file: (fsPath: string) => ({
                fsPath,
                scheme: "file",
                path: fsPath,
                toString: () => `file://${fsPath}`,
            }),
        },
        EventEmitter: class {
            public readonly event = vi.fn();

            public fire(): void {
                /* no listeners in tests */
            }

            public dispose(): void {
                /* nothing to release in tests */
            }
        },
        commands,
        window,
        workspace: {
            getConfiguration: vi.fn(() => configuration),
            onDidChangeConfiguration: vi.fn(() => new Disposable()),
            workspaceFolders: undefined,
        },
        ViewColumn: { Active: -1, Beside: -2, One: 1, Two: 2, Three: 3 },
        StatusBarAlignment: { Left: 1, Right: 2 },
    };
}
