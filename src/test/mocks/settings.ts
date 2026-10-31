import { vi } from "vitest";
import type { Settings } from "@/configuration";

/**
 * Settings double backed by a mutable record.
 *
 * Writing to `values` between calls mimics a user changing a setting while the
 * extension runs, without touching the `vscode` workspace mock.
 *
 * @author sdttttt
 */
export interface SettingsStub extends Settings {
    /** Values the next read answers with. */
    readonly values: Record<string, unknown>;
}

/**
 * Builds a settings double.
 *
 * @param values initial values, keyed by `ConfigKey`
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
    };
}
