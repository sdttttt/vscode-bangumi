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
export function getConfig(key: string): any {
    return vscode.workspace.getConfiguration().get(key);
}

/**
 * Gets reminder ahead time
 *
 * @returns reminder ahead time 
 * @author sdttttt
 */
export function getReminderAheadTime(): number {
    let aheadTime: any = getConfig("bangumiOpen.ReminderAheadTime");
    aheadTime = <number>aheadTime;
    if (isNaN(aheadTime) || aheadTime < 0) {
        return 0;
    }
    return aheadTime;
}
