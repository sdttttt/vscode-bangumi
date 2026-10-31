import * as vscode from "vscode";

/**
 * Command ids registered by the extension.
 *
 * This list is the single source of truth for `activate()`: every id here must
 * also exist in `package.json#contributes.commands`, and vice versa. The
 * `commands.test.ts` unit test enforces that contract without launching VS Code.
 *
 * @author sdttttt
 */
export const COMMAND_IDS = [
    "openBangumi",
    "nextPage",
    "backPage",
    "jumpPage",
    "weekBangumi",
    "index",
] as const;

export type CommandId = (typeof COMMAND_IDS)[number];

/**
 * Runs an extension command.
 *
 * Injected wherever a module has to open another view, so the module never
 * reaches for the command registry itself.
 *
 * @author sdttttt
 */
export interface Commands {
    execute(id: CommandId): void;
}

/**
 * Creates the command runner backed by the editor.
 *
 * @author sdttttt
 */
export function useCommands(): Commands {
    return {
        /* A failure is not actionable for the caller, so it is swallowed. */
        execute: id => {
            vscode.commands.executeCommand(id).then(undefined, () => undefined);
        },
    };
}
