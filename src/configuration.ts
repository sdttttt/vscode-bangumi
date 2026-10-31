import * as vscode from "vscode";

/**
 * Keys of the settings this extension reads.
 *
 * @author sdttttt
 */
export enum ConfigKey {
    EnableReminder = "bangumiOpen.EnableReminder",
    ReminderAheadTime = "bangumiOpen.ReminderAheadTime",
    DisplayIndexTags = "bangumiOpen.DisplayIndexTags",
    DisplayHistory = "bangumiOpen.DisplayHistory",
    DisplayStatusBar = "bangumiOpen.DisplayStatusBar",
}

/**
 * The user settings, read through the editor.
 *
 * Consumers take this as a dependency instead of reaching for the workspace
 * themselves, so a caller can hand in a different implementation and the
 * factory never reads ambient state.
 *
 * @author sdttttt
 */
export interface Settings {
    /** Lead time of the reminder, in seconds. */
    reminderAheadTime(): number;
    /** Whether the update reminder may schedule notifications. */
    isReminderEnabled(): boolean;
    /** Whether the picked index tags are collected and shown. */
    isDisplayIndexTags(): boolean;
    /** Whether the status bar entry is shown. */
    isDisplayStatusBar(): boolean;
    /** Whether the past days of the weekly schedule are shown. */
    isDisplayHistory(): boolean;
}

/**
 * Whether the settings that shape the reminder changed.
 *
 * Pure: the caller passes the `affectsConfiguration` probe of the event.
 *
 * @author sdttttt
 */
export function affectsReminder(
    affected: (section: string) => boolean
): boolean {
    return (
        affected(ConfigKey.EnableReminder) ||
        affected(ConfigKey.ReminderAheadTime) ||
        affected(ConfigKey.DisplayStatusBar)
    );
}

/**
 * Creates the settings reader of one extension session.
 *
 * The workspace lookup happens per read, so a setting changed while the
 * extension runs is picked up without rebuilding the session.
 *
 * @author sdttttt
 */
export function useSettings(): Settings {
    const read = (key: ConfigKey): unknown =>
        vscode.workspace.getConfiguration().get(key);

    return {
        reminderAheadTime: () => {
            const aheadTime = read(ConfigKey.ReminderAheadTime);
            const result = aheadTime as number;

            return isNaN(result) || 0 > result ? 0 : result;
        },

        isReminderEnabled: () => false !== read(ConfigKey.EnableReminder),

        isDisplayIndexTags: () => read(ConfigKey.DisplayIndexTags) as boolean,

        isDisplayStatusBar: () => read(ConfigKey.DisplayStatusBar) as boolean,

        isDisplayHistory: () => read(ConfigKey.DisplayHistory) as boolean,
    };
}
