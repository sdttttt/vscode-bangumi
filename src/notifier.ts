import * as vscode from "vscode";

/**
 * The user facing output of the extension.
 *
 * Modules take this as a dependency instead of calling `vscode.window`
 * themselves, so a caller can hand in a different implementation and the tests
 * never need an editor.
 *
 * @author sdttttt
 */
export interface Notifier {
    /** Shows an informational message. */
    info(message: string): void;
    /** Shows an error message. */
    error(message: string): void;
    /** Asks the user for a line of text. */
    ask(options: vscode.InputBoxOptions): Promise<string | undefined>;
    /** Asks the user to pick one of the given labels. */
    pick(labels: ReadonlyArray<string>): Promise<string | undefined>;
    /** Shows a message with one action button and reports the chosen action. */
    action(message: string, action: string): Promise<string | undefined>;
}

/**
 * Creates the notifier backed by the editor window.
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
