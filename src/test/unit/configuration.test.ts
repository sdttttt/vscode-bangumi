import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import {
    affectsReminder,
    ConfigKey,
    getConfig,
    getReminderAheadTime,
    isDisplayHistory,
    isDisplayIndexTags,
    isDisplayStatusBar,
    isReminderEnabled,
} from "@/configuration";

/**
 * Makes `workspace.getConfiguration().get` answer with the given map.
 *
 * @author sdttttt
 */
function stubConfig(values: Record<string, unknown>): void {
    vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: vi.fn((key: string) => values[key]),
    } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);
}

describe("getConfig", () => {
    beforeEach(() => {
        vi.mocked(vscode.workspace.getConfiguration).mockClear();
    });

    it("reads the value under the given key", () => {
        stubConfig({ [ConfigKey.DisplayHistory]: true });

        expect(getConfig(ConfigKey.DisplayHistory)).toBe(true);
    });
});

describe("getReminderAheadTime", () => {
    it("returns a positive configured value", () => {
        stubConfig({ [ConfigKey.ReminderAheadTime]: 30 });

        expect(getReminderAheadTime()).toBe(30);
    });

    it("falls back to zero for a negative value", () => {
        stubConfig({ [ConfigKey.ReminderAheadTime]: -5 });

        expect(getReminderAheadTime()).toBe(0);
    });

    it("falls back to zero when the setting is missing", () => {
        stubConfig({});

        expect(getReminderAheadTime()).toBe(0);
    });
});

describe("boolean flags", () => {
    it("read the display index tags setting", () => {
        stubConfig({ [ConfigKey.DisplayIndexTags]: false });

        expect(isDisplayIndexTags()).toBe(false);
    });

    it("read the display status bar setting", () => {
        stubConfig({ [ConfigKey.DisplayStatusBar]: true });

        expect(isDisplayStatusBar()).toBe(true);
    });

    it("read the display history setting", () => {
        stubConfig({ [ConfigKey.DisplayHistory]: false });

        expect(isDisplayHistory()).toBe(false);
    });
});

describe("isReminderEnabled", () => {
    it("is on by default", () => {
        stubConfig({});

        expect(isReminderEnabled()).toBe(true);
    });

    it("is off when the setting is disabled", () => {
        stubConfig({ [ConfigKey.EnableReminder]: false });

        expect(isReminderEnabled()).toBe(false);
    });
});

describe("affectsReminder", () => {
    it.each([
        ConfigKey.EnableReminder,
        ConfigKey.ReminderAheadTime,
        ConfigKey.DisplayStatusBar,
    ])("reacts to %s", key => {
        expect(affectsReminder(section => section === key)).toBe(true);
    });

    it("ignores unrelated settings", () => {
        expect(affectsReminder(() => false)).toBe(false);
    });
});
