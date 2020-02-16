import * as vscode from 'vscode';
import { globalVar } from '../constants';
import * as path from 'path';


/**
 *  Quick Create a WebviewPanel
 *
 * @export
 * @param {string} viewType
 * @param {string} title
 * @param {() => any} listener
 * @returns {vscode.WebviewPanel}
 *
 * @author sdttttt
 */
export function createWebviewPanel(viewType: string, title: string, closeListener: () => any): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    viewType,
    title,
    vscode.ViewColumn.Two,
    {
      retainContextWhenHidden: false,
      enableFindWidget: true,
      localResourceRoots: [vscode.Uri.file(
        path.join(globalVar().context.extensionPath, 'public'))]
    }
  );

  const context: vscode.ExtensionContext = globalVar().context;
  panel.onDidDispose(
    closeListener,
    null,
    context.subscriptions
  );

  return panel;
}