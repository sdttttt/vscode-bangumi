import * as vscode from "vscode";
import type { WeekSourceKind } from "./request/schedule";

/**
 * 本扩展读取的设置键。
 *
 * @author sdttttt
 */
export enum ConfigKey {
    EnableReminder = "bangumiOpen.EnableReminder",
    ReminderAheadTime = "bangumiOpen.ReminderAheadTime",
    DisplayIndexTags = "bangumiOpen.DisplayIndexTags",
    DisplayHistory = "bangumiOpen.DisplayHistory",
    DisplayStatusBar = "bangumiOpen.DisplayStatusBar",
    WeekSource = "bangumiOpen.WeekSource",
}

/**
 * 通过编辑器读取的用户设置。
 *
 * 使用方把它作为依赖接收，而不是自己去读 workspace；调用方可以传入别的实现，
 * 工厂也不会去读环境状态。
 *
 * @author sdttttt
 */
export interface Settings {
    /** 提醒的提前量，单位为秒。 */
    reminderAheadTime(): number;
    /** 更新提醒是否允许安排通知。 */
    isReminderEnabled(): boolean;
    /** 是否收集并展示已选的索引标签。 */
    isDisplayIndexTags(): boolean;
    /** 是否展示状态栏条目。 */
    isDisplayStatusBar(): boolean;
    /** 是否展示周番表中过去的几天。 */
    isDisplayHistory(): boolean;
    /** 周番表使用的数据来源。 */
    weekSource(): WeekSourceKind;
}

/**
 * 影响提醒的设置是否发生了变化。
 *
 * 纯函数：调用方传入事件的 `affectsConfiguration` 探针。
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
 * 创建一次扩展会话的设置读取器。
 *
 * 每次读取都会查询 workspace，因此扩展运行期间修改的设置无需重建会话即可生效。
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

        weekSource: () => {
            /*
             * 只接受已知的取值：设置项可能被手工写错，也可能来自旧版本，
             * 这时应当回退到 B 站，而不是让番剧表变成空的。
             */
            const source = read(ConfigKey.WeekSource);

            return "bangumi" === source ? "bangumi" : "bilibili";
        },
    };
}
