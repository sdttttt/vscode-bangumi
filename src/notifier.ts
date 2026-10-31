import * as vscode from "vscode";

/**
 * 扩展面向用户的输出。
 *
 * 各模块把它作为依赖接收，而不是自己调用 `vscode.window`；这样调用方可以传入
 * 别的实现，测试也不需要有编辑器。
 *
 * @author sdttttt
 */
export interface Notifier {
    /** 展示提示消息。 */
    info(message: string): void;
    /** 展示错误消息。 */
    error(message: string): void;
    /** 让用户输入一行文本。 */
    ask(options: vscode.InputBoxOptions): Promise<string | undefined>;
    /** 让用户从给定标签中选择一项。 */
    pick(labels: ReadonlyArray<string>): Promise<string | undefined>;
    /** 展示带一个操作按钮的消息，并回传用户选择的动作。 */
    action(message: string, action: string): Promise<string | undefined>;
}

/**
 * 创建由编辑器窗口实现的 notifier。
 *
 * @author sdttttt
 */
export function useNotifier(): Notifier {
    return {
        info: message => {
            void vscode.window.showInformationMessage(message);
        },
        error: message => {
            void vscode.window.showErrorMessage(message);
        },
        ask: options => Promise.resolve(vscode.window.showInputBox(options)),
        pick: labels =>
            Promise.resolve(vscode.window.showQuickPick([...labels])),
        action: (message, action) =>
            Promise.resolve(
                vscode.window.showInformationMessage(message, action)
            ),
    };
}
