import { vi } from "vitest";

/**
 * 与 `vscode.Disposable` 形状一致的可释放对象。
 *
 * @author sdttttt
 */
export class Disposable {
    public dispose(): void {
        /* 测试中无需释放任何东西 */
    }
}

/**
 * 构建 `vscode` 模块的桩。
 *
 * 单元测试运行在纯 Node.js 中，真实模块不可用。这个桩只覆盖扩展用到的 API；
 * 生产代码引入新 API 时请在这里补齐。
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
                /* 测试中没有监听者 */
            }

            public dispose(): void {
                /* 测试中无需释放任何东西 */
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
