import * as vscode from "vscode";
import type { WeekSourceKind } from "./request/schedule";
import {
    addIgnored,
    normalizeIgnored,
    pruneIgnored,
    type IgnoredReminder,
} from "./reminder/ignored";

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
    IgnoredReminders = "bangumiOpen.IgnoredReminders",
}

/**
 * 通过编辑器读取的用户设置。
 *
 * 使用方把它作为依赖接收，而不是自己去读 workspace；调用方可以传入别的实现，
 * 工厂也不会去读环境状态。
 *
 * 读与写都在这里：两者是同一个聚合的两面，拆成两个端口只会让消费者多背
 * 一个依赖。
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
    /**
     * 关闭更新提醒。
     *
     * 写入的是全局设置而不是工作区设置：提醒属于用户个人偏好，不该跟着
     * 某个项目走。
     */
    disableReminder(): Promise<void>;
    /** 被排除在更新提醒之外的番剧。 */
    ignoredReminders(): ReadonlyArray<IgnoredReminder>;
    /**
     * 把番剧加入忽略列表。
     *
     * 同样写入全局设置：忽略哪部番剧只与用户自己有关。
     */
    ignoreReminders(titles: ReadonlyArray<string>): Promise<void>;
    /** 清理超过保留时长的忽略记录，内容有变化时才写回设置。 */
    pruneIgnoredReminders(): Promise<void>;
}

/**
 * 影响提醒的设置是否发生了变化。
 *
 * 数据来源也在其中：切换来源会让提醒在「装载通知」与「今日概览」两种形态之间切换。
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
        affected(ConfigKey.DisplayStatusBar) ||
        affected(ConfigKey.WeekSource)
    );
}

/**
 * 创建一次扩展会话的设置读取器。
 *
 * 每次读取都会查询 workspace，因此扩展运行期间修改的设置无需重建会话即可生效。
 *
 * @author sdttttt
 */
export function createSettings(): Settings {
    const read = (key: ConfigKey): unknown =>
        vscode.workspace.getConfiguration().get(key);

    const write = (key: ConfigKey, value: unknown): Promise<void> =>
        Promise.resolve(
            vscode.workspace
                .getConfiguration()
                .update(key, value, vscode.ConfigurationTarget.Global)
        );

    /*
     * 忽略列表的读-改-写必须串行：两条通知接连弹出的场景下，用户可能先后
     * 快速点掉两个「不再提醒」。并发时后到者会读到尚未落盘的旧列表，用自己
     * 的合并结果覆盖先到者刚写入的记录，丢一次忽略。所有对忽略列表的写入
     * 排在同一条 promise 链上，每个操作都基于前一个操作的最终结果。
     */
    let ignoredWrites: Promise<unknown> = Promise.resolve();
    const queueIgnoredWrite = (task: () => Promise<void>): Promise<void> => {
        const run = ignoredWrites.then(task, task);
        ignoredWrites = run.catch(() => undefined);
        return run;
    };

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
             * 这时应当回退到默认的 Bangumi，而不是让番剧表变成空的。
             */
            const source = read(ConfigKey.WeekSource);

            return "bilibili" === source ? "bilibili" : "bangumi";
        },

        disableReminder: () => write(ConfigKey.EnableReminder, false),

        ignoredReminders: () =>
            normalizeIgnored(read(ConfigKey.IgnoredReminders)),

        /*
         * 每次写入前重新读一遍：用户可能在扩展运行期间手工编辑过 settings.json，
         * 用会话开始时捕获的副本合并会把那些改动覆盖掉。
         */
        ignoreReminders: titles =>
            queueIgnoredWrite(() =>
                write(
                    ConfigKey.IgnoredReminders,
                    addIgnored(
                        normalizeIgnored(read(ConfigKey.IgnoredReminders)),
                        titles,
                        Date.now()
                    )
                )
            ),

        pruneIgnoredReminders: () =>
            queueIgnoredWrite(() => {
                const { kept, changed } = pruneIgnored(
                    read(ConfigKey.IgnoredReminders),
                    Date.now()
                );

                return changed
                    ? write(ConfigKey.IgnoredReminders, kept)
                    : Promise.resolve();
            }),
    };
}
