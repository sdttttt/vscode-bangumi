import * as vscode from 'vscode';

/**
 * show Remind.
 * 
 * @export
 * @param {string} bangumiName
 * @author sdttttt
 */
export function showRemind(content: string): void {
	vscode.window.showInformationMessage(content,"Open WeekBangumi")
		.then((result: string | undefined) => {
			if (result) {
				vscode.commands.executeCommand("weekBangumi");
			}
		});
}