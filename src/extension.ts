// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import axios from "axios";
// component status
let flag: boolean = false;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "test" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      createBangumiView(context);
    }
  );

  context.subscriptions.push(disposable);
}

function createBangumiView(context: vscode.ExtensionContext) {
  if (flag) { return; }

  let panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
    "zhui fan xiao zu jian",
    "test",
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: false,
      enableFindWidget: true
    }
  );

  flag = true;

  panel.webview.html = `
		<body>
			<h1>Hello shit</h1>
		</body>
	`;

  panel.onDidDispose(
    () => {
      flag = false;
    },
    null,
    context.subscriptions
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  vscode.window.showInformationMessage("you has stop Test extensions.");
}
