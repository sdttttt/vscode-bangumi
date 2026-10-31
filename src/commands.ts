import * as vscode from "vscode";

/**
 * 扩展注册的命令 id。
 *
 * 这份列表是 `activate()` 的唯一事实来源：这里的每个 id 都必须同时存在于
 * `package.json#contributes.commands`，反之亦然。`manifest.test.ts` 单元测试
 * 会在不启动 VS Code 的情况下校验这份约定。
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
 * 执行扩展命令。
 *
 * 任何需要打开其他视图的模块都注入它，模块因此不必自己去拿命令注册表。
 *
 * @author sdttttt
 */
export interface Commands {
    execute(id: CommandId): void;
}

/**
 * 创建由编辑器实现的命令执行器。
 *
 * @author sdttttt
 */
export function useCommands(): Commands {
    return {
        /* 失败对调用方没有可操作的信息，因此直接吞掉。 */
        execute: id => {
            vscode.commands.executeCommand(id).then(undefined, () => undefined);
        },
    };
}
