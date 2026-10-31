import * as vscode from "vscode";
import BangumiView from "./views/bangumi";
import WeekBangumiView from "./views/weekBangumi";
import { setContext } from "./constants";
import { ConfigKey, getConfig } from "./configuration";
import MainIndexList from "./match/index";
import Reminder from "./reminder";
import { CommandId } from "./commands";

let isInit = false;

/**
 * init work
 *
 * @param {vscode.ExtensionContext} context
 * @author sdttttt
 */
function initializer(context: vscode.ExtensionContext): void {
    if (isInit) {
        return;
    }
    setContext(context);
    isInit = !isInit;
}

/**
 * Handlers keyed by command id.
 *
 * Typed as a total record so adding an id to `COMMAND_IDS` fails to compile
 * until the matching handler exists.
 *
 * @author sdttttt
 */
const handlers: Record<CommandId, () => unknown> = {
    openBangumi: () => BangumiView.openBangumi(),
    nextPage: () => BangumiView.nextPage(),
    backPage: () => BangumiView.backPage(),
    jumpPage: () => BangumiView.jumpPage(),
    weekBangumi: () => WeekBangumiView.openWeekBangumi(),
    index: () => MainIndexList.openIndexList(),
};

/**
 *  Main Function
 *
 * @param {vscode.ExtensionContext} context
 * @author sdttttt
 */
export function activate(context: vscode.ExtensionContext): void {
    initializer(context);

    const useReminder: unknown = getConfig(ConfigKey.EnableReminder);

    if (useReminder as boolean) {
        Reminder.enableBangumiUpdateReminder();
    }

    /*
     * The command has been defined in the package.json file
     * Now provide the implementation of the command with registerCommand
     * The commandId parameter must match the command field in package.json
     */
    context.subscriptions.push(
        ...Object.entries(handlers).map(([id, handler]) =>
            vscode.commands.registerCommand(id, handler)
        )
    );
}

/**
 * this method is called when your extension is deactivated
 *
 * @export
 * @author sdttttt
 */
export function deactivate(): void {
    Reminder.destroyReminder();
}
