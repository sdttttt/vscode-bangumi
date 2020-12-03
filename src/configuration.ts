import * as vscode from "vscode";

const REMINDER_AHEAD_TIME = "bangumiOpen.ReminderAheadTime";
const DISPLAY_INDEX_TAGS = "bangumiOpen.DisplayIndexTags";
const DISPLAY_HISTORY = "bangumiOpen.DisplayHistory";
const DISPLAY_STATUSBAR = "bangumiOpen.DisplayStatusBar";

/**
 * Quick Gets config
 *
 * @param {string} key
 * @returns {any}
 * @export
 *
 * @author sdttttt
 */
export function getConfig(key: string): unknown {
	return vscode.workspace.getConfiguration().get(key);
}

/**
 * Gets reminder ahead time
 *
 * @returns reminder ahead time
 * @author sdttttt
 */
export function getReminderAheadTime(): number {
	const aheadTime: unknown = getConfig(REMINDER_AHEAD_TIME);
	const result: number = aheadTime as number;
	if (isNaN(result) || result < 0) {
		return 0;
	}
	return result;
}

/**
 * Gets display index tags
 *
 * @returns true if display index tags
 * @author sdttttt
 */
export function isDisplayIndexTags(): boolean {
	const displayStatus: unknown = getConfig(DISPLAY_INDEX_TAGS);
	return displayStatus as boolean;
}

/**
 * Gets display statusbar
 *
 * @returns true if display status bar
 * @author sdttttt
 */
export function isDisplayStatusBar(): boolean {
	const displayStatus: unknown = getConfig(DISPLAY_STATUSBAR);
	return displayStatus as boolean;
}

/**
 * Gets display History
 *
 * @returns true if display history
 * @author sdttttt
 */
export function isDisplayHistory(): boolean {
	const displayStatus: unknown = getConfig(DISPLAY_HISTORY);
	return displayStatus as boolean;
}
