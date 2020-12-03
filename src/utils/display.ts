import { window, commands } from "vscode";

/**
 * show Remind.
 *
 * @export
 * @param {string} bangumiName
 * @author sdttttt
 */
export function showRemind(content: string): void {
	window
		.showInformationMessage(content, "Open WeekBangumi")
		.then((result: string | undefined) => {
			if (result) {
				commands.executeCommand("weekBangumi");
			}
		});
}
