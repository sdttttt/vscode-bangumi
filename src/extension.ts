// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as BangumiView from "./views/Bangumi";

// this variate is safe
export let CONTEXT: vscode.ExtensionContext;


/**
 * @author sdttttt
 */
export function activate(context: vscode.ExtensionContext) {

  CONTEXT = context;

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
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

  context.subscriptions.push(openBangumi, nextPage, backPage);
}


// this method is called when your extension is deactivated
export function deactivate() {
  vscode.window.showInformationMessage("you has stop Test extensions.");
}
