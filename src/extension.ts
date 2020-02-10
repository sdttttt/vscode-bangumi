// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as BangumiView from "./views/Bangumi";
import { newGlobal } from "./utils/constant";

/**
 * init work
 *
 * @param {vscode.ExtensionContext} context
 * @author sdttttt
 */
function initializer(context: vscode.ExtensionContext) {
  newGlobal(context);
}

/**
 *  Main Function
 *
 * @param {vscode.ExtensionContext} context
 * @author sdttttt
 */
export function activate(context: vscode.ExtensionContext) {

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const initializerEvent = vscode.commands.registerCommand(
    "extension.initializer",
    () => { initializer(context); }
  );

  const openBangumi = vscode.commands.registerCommand(
    "extension.openBangumi",
    () => { BangumiView.openBangumi(); }
  );

  const nextPage = vscode.commands.registerCommand(
    "extension.nextPage",
    () => { BangumiView.nextPage(); }
  );

  const backPage = vscode.commands.registerCommand(
    "extension.backPage",
    () => { BangumiView.backPage(); }
  );

  context.subscriptions.push(initializerEvent, openBangumi, nextPage, backPage);
}

/**
 * this method is called when your extension is deactivated
 * @export
 * @author sdttttt
 */
export function deactivate() {
  vscode.window.showInformationMessage("you has stop [Bangumi Open] extensions.");
}
