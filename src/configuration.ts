"use strict";

import * as vscode from "vscode";

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
	const aheadTime: unknown = getConfig("bangumiOpen.ReminderAheadTime");
	const result: number = aheadTime as number ;
	if (isNaN(result) || result < 0) {
		return 0;
	}
	return result;
}
