import { vi } from "vitest";
import type { Settings } from "@/configuration";

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
            "bangumi" === read("bangumiOpen.WeekSource")
                ? "bangumi"
                : "bilibili"
        ),
    };
}
