"use strict";

import * as vscode from "vscode";

const ReminderAheadTime = "bangumiOpen.ReminderAheadTime";
const DisplayIndexTags = "bangumiOpen.DisplayIndexTags";

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
	const aheadTime: unknown = getConfig(ReminderAheadTime);
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
export function getDisplayIndexTags(): boolean {
	const displayStatus: unknown = getConfig(DisplayIndexTags);
	return displayStatus as boolean;
}
