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
