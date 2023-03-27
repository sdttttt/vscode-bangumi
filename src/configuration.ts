import * as vscode from "vscode";

export enum ConfigKey {
    EnableReminder = "bangumiOpen.EnableReminder",
    ReminderAheadTime = "bangumiOpen.ReminderAheadTime",
    DisplayIndexTags = "bangumiOpen.DisplayIndexTags",
    DisplayHistory = "bangumiOpen.DisplayHistory",
    DisplayStatusBar = "bangumiOpen.DisplayStatusBar",
}

/**
 * Quick Gets config
 *
 * @param {string} key
 * @returns {any}
 * @export
 *
 * @author sdttttt
 */
export function getConfig(key: ConfigKey): unknown
{
    return vscode.workspace.getConfiguration().get(key);
}

/**
 * Gets reminder ahead time
 *
 * @returns reminder ahead time
 * @author sdttttt
 */
export function getReminderAheadTime(): number
{
    const aheadTime: unknown = getConfig(ConfigKey.ReminderAheadTime);
    const result: number = aheadTime as number;
    if (isNaN(result) || 0 > result)
    {
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
export function isDisplayIndexTags(): boolean
{
    const displayStatus: unknown = getConfig(ConfigKey.DisplayIndexTags);
    return displayStatus as boolean;
}

/**
 * Gets display statusbar
 *
 * @returns true if display status bar
 * @author sdttttt
 */
export function isDisplayStatusBar(): boolean
{
    const displayStatus: unknown = getConfig(ConfigKey.DisplayStatusBar);
    return displayStatus as boolean;
}

/**
 * Gets display History
 *
 * @returns true if display history
 * @author sdttttt
 */
export function isDisplayHistory(): boolean
{
    const displayStatus: unknown = getConfig(ConfigKey.DisplayHistory);
    return displayStatus as boolean;
}
