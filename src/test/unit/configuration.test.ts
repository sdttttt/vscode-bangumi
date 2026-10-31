import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import {
    affectsReminder,
    ConfigKey,
    useSettings,
    type Settings,
} from "@/configuration";

/**
 * 让 `workspace.getConfiguration().get` 按给定映射返回结果。
 *
 * @author sdttttt
 */
function stubConfig(values: Record<string, unknown>): void {
    vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: vi.fn((key: string) => values[key]),
    } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);
}

describe("useSettings", () => {
    let settings: Settings;

    beforeEach(() => {
        settings = useSettings();
        vi.mocked(vscode.workspace.getConfiguration).mockClear();
    });

    it("reads the reminder lead time", () => {
        stubConfig({ [ConfigKey.ReminderAheadTime]: 30 });

        expect(settings.reminderAheadTime()).toBe(30);
    });

    it("falls back to zero for a negative lead time", () => {
        stubConfig({ [ConfigKey.ReminderAheadTime]: -5 });

        expect(settings.reminderAheadTime()).toBe(0);
    });

    it("falls back to zero when the lead time is missing", () => {
        stubConfig({});

        expect(settings.reminderAheadTime()).toBe(0);
    });

    it("treats the reminder as enabled unless explicitly disabled", () => {
        stubConfig({});

        expect(settings.isReminderEnabled()).toBe(true);
    });

    it("reads the reminder enabled flag", () => {
        stubConfig({ [ConfigKey.EnableReminder]: false });

        expect(settings.isReminderEnabled()).toBe(false);
    });

    it("reads the display index tags flag", () => {
        stubConfig({ [ConfigKey.DisplayIndexTags]: false });

        expect(settings.isDisplayIndexTags()).toBe(false);
    });

    it("reads the display status bar flag", () => {
        stubConfig({ [ConfigKey.DisplayStatusBar]: false });

        expect(settings.isDisplayStatusBar()).toBe(false);
    });

    it("reads the display history flag", () => {
        stubConfig({ [ConfigKey.DisplayHistory]: true });

        expect(settings.isDisplayHistory()).toBe(true);
    });

    it("reads the live setting on every call", () => {
        stubConfig({ [ConfigKey.DisplayHistory]: true });
        expect(settings.isDisplayHistory()).toBe(true);

        stubConfig({ [ConfigKey.DisplayHistory]: false });

        expect(settings.isDisplayHistory()).toBe(false);
    });
});

describe("affectsReminder", () => {
    it("is true for every reminder setting", () => {
        for (const key of [
            ConfigKey.EnableReminder,
            ConfigKey.ReminderAheadTime,
            ConfigKey.DisplayStatusBar,
        ]) {
            expect(affectsReminder(section => section === key)).toBe(true);
        }
    });

    it("is false for an unrelated setting", () => {
        expect(
            affectsReminder(section => section === ConfigKey.DisplayHistory)
        ).toBe(false);
    });
});
