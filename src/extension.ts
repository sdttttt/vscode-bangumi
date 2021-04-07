import * as vscode from "vscode";
import BangumiView from "./views/bangumi";
import WeekBangumiView from "./views/weekBangumi";
import { useReminderNoticeHuck } from "./request/huck"
import { setContext } from "./constants";
import { getConfig } from "./configuration";
import MainIndexList from "./match/";
import Reminder from "./reminder";

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
 *  Main Function
 *
 * @param {vscode.ExtensionContext} context
 * @author sdttttt
 */
export function activate(context: vscode.ExtensionContext): void {
	initializer(context);

	const useReminder: unknown = getConfig("bangumiOpen.EnableReminder");

	if (useReminder as boolean) {
		Reminder.enableBangumiUpdateReminder();
		useReminderNoticeHuck();
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	context.subscriptions.push(
		vscode.commands.registerCommand("openBangumi", () =>
			BangumiView.openBangumi()
		),
		vscode.commands.registerCommand("nextPage", () =>
			BangumiView.nextPage()
		),
		vscode.commands.registerCommand("backPage", () =>
			BangumiView.backPage()
		),
		vscode.commands.registerCommand("jumpPage", () =>
			BangumiView.jumpPage()
		),
		vscode.commands.registerCommand("weekBangumi", () =>
			WeekBangumiView.openWeekBangumi()
		),
		vscode.commands.registerCommand("index", () =>
			MainIndexList.openIndexList()
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
