import { vi } from "vitest";
import type { Settings } from "@/configuration";
import {
    addIgnored,
    normalizeIgnored,
    pruneIgnored,
    type IgnoredReminder,
} from "@/reminder/ignored";

/**
 * 由可变记录支撑的 Settings 替身。
 *
 * 在两次调用之间写入 `values` 即可模拟扩展运行期间用户修改设置，
 * 无需触碰 `vscode` 的 workspace 桩。
 *
 * @author sdttttt
 */
export interface SettingsStub extends Settings {
    /** 下一次读取将要返回的值。 */
    readonly values: Record<string, unknown>;
    /** 关闭提醒的写入动作，记录调用次数并同步改写 `values`。 */
    readonly disableReminder: ReturnType<
        typeof vi.fn<Settings["disableReminder"]>
    >;
    /** 写入忽略列表的动作，同样会同步改写 `values`。 */
    readonly ignoreReminders: ReturnType<
        typeof vi.fn<Settings["ignoreReminders"]>
    >;
    /** 清理忽略列表的动作。 */
    readonly pruneIgnoredReminders: ReturnType<
        typeof vi.fn<Settings["pruneIgnoredReminders"]>
    >;
}

/**
 * 创建 Settings 替身。
 *
 * @param values 初始值，以 `ConfigKey` 为键
 * @author sdttttt
 */
export function createSettingsStub(
    values: Record<string, unknown> = {}
): SettingsStub {
    const read = (key: string): unknown => values[key];

    return {
        values,
        reminderAheadTime: vi.fn(() => {
            const aheadTime = read("bangumiOpen.ReminderAheadTime");
            const result = aheadTime as number;

            return isNaN(result) || 0 > result ? 0 : result;
        }),
        isReminderEnabled: vi.fn(
            () => false !== read("bangumiOpen.EnableReminder")
        ),
        isDisplayIndexTags: vi.fn(
            () => true === read("bangumiOpen.DisplayIndexTags")
        ),
        isDisplayStatusBar: vi.fn(
            () => true === read("bangumiOpen.DisplayStatusBar")
        ),
        isDisplayHistory: vi.fn(
            () => true === read("bangumiOpen.DisplayHistory")
        ),
        weekSource: vi.fn(() =>
            "bilibili" === read("bangumiOpen.WeekSource")
                ? "bilibili"
                : "bangumi"
        ),
        /*
         * 真实的写入会改动设置本身，因此替身也要照做：否则「不再提醒」之后的
         * 静音判定会读到过期的值。
         */
        disableReminder: vi.fn(() => {
            values["bangumiOpen.EnableReminder"] = false;

            return Promise.resolve();
        }),

        ignoredReminders: vi.fn(() =>
            normalizeIgnored(read("bangumiOpen.IgnoredReminders"))
        ),

        ignoreReminders: vi.fn((titles: ReadonlyArray<string>) => {
            values["bangumiOpen.IgnoredReminders"] = addIgnored(
                normalizeIgnored(read("bangumiOpen.IgnoredReminders")),
                titles,
                Date.now()
            );

            return Promise.resolve();
        }),

        /* 与真实实现一致：没有配置过该项时不写。 */
        pruneIgnoredReminders: vi.fn(() => {
            const { kept, changed } = pruneIgnored(
                read("bangumiOpen.IgnoredReminders"),
                Date.now()
            );

            if (changed) {
                values["bangumiOpen.IgnoredReminders"] =
                    kept as Array<IgnoredReminder>;
            }

            return Promise.resolve();
        }),
    };
}
