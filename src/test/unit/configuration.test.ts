import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import {
    affectsReminder,
    ConfigKey,
    createSettings,
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

describe("createSettings", () => {
    let settings: Settings;

    beforeEach(() => {
        settings = createSettings();
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

    it("falls back to zero for a non numeric lead time", () => {
        /*
         * 复现（M9，见 TODO.md）：isNaN 对字符串先隐式转型，"30" 原样
         * 透传成字符串，接口声明 number 全靠下游隐式转型侥幸成立。
         */
        stubConfig({ [ConfigKey.ReminderAheadTime]: "30" });

        expect(settings.reminderAheadTime()).toBe(0);
    });

    it("falls back to zero for an infinite lead time", () => {
        stubConfig({ [ConfigKey.ReminderAheadTime]: Number.POSITIVE_INFINITY });

        expect(settings.reminderAheadTime()).toBe(0);
    });

    it("caps the lead time at one day", () => {
        /*
         * 复现（M9，见 TODO.md）：按毫秒习惯填 600000（本意 10 分钟）会把
         * 地平线内全部事件钳到当下，启动瞬间通知轰炸。
         */
        stubConfig({ [ConfigKey.ReminderAheadTime]: 600_000 });

        expect(settings.reminderAheadTime()).toBe(86_400);
    });

    it("treats the reminder as enabled unless explicitly disabled", () => {
        stubConfig({});

        expect(settings.isReminderEnabled()).toBe(true);
    });

    it("reads the reminder enabled flag", () => {
        stubConfig({ [ConfigKey.EnableReminder]: false });

        expect(settings.isReminderEnabled()).toBe(false);
    });

    it("treats a hand broken boolean as off", () => {
        /*
         * 复现（L1，见 TODO.md）：手写 "false"（字符串）是非空字符串、
         * 真值，按「开」处理——设置界面显示已关，提醒却照弹。
         */
        stubConfig({
            [ConfigKey.EnableReminder]: "false",
            [ConfigKey.DisplayHistory]: "false",
            [ConfigKey.DisplayStatusBar]: "false",
        });

        expect(settings.isReminderEnabled()).toBe(false);
        expect(settings.isDisplayHistory()).toBe(false);
        expect(settings.isDisplayStatusBar()).toBe(false);
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

    it("defaults the week source to bangumi", () => {
        stubConfig({});

        expect(settings.weekSource()).toBe("bangumi");
    });

    it("reads the bilibili week source", () => {
        stubConfig({ [ConfigKey.WeekSource]: "bilibili" });

        expect(settings.weekSource()).toBe("bilibili");
    });

    it("falls back to bangumi for an unknown week source", () => {
        stubConfig({ [ConfigKey.WeekSource]: "bangumi.tv" });

        expect(settings.weekSource()).toBe("bangumi");
    });

    it("writes the reminder switch to the global settings", async () => {
        const update = vi.fn(() => Promise.resolve());
        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(),
            update,
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        await settings.disableReminder();

        expect(update).toHaveBeenCalledWith(
            ConfigKey.EnableReminder,
            false,
            vscode.ConfigurationTarget.Global
        );
    });

    it("reads the ignored reminder list", () => {
        const kept = {
            title: "甲",
            ignoredAt: new Date().toISOString(),
        };
        stubConfig({ [ConfigKey.IgnoredReminders]: [kept] });

        expect(settings.ignoredReminders()).toEqual([kept]);
    });

    it("collapses an unparsable ignored list into nothing", () => {
        stubConfig({ [ConfigKey.IgnoredReminders]: "甲" });

        expect(settings.ignoredReminders()).toEqual([]);
    });

    it("writes a new ignored title to the global settings", async () => {
        const update = vi.fn(() => Promise.resolve());
        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(() => []),
            update,
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        await settings.ignoreReminders(["甲"]);

        expect(update).toHaveBeenCalledWith(
            ConfigKey.IgnoredReminders,
            [
                {
                    title: "甲",
                    ignoredAt: expect.any(String) as unknown as string,
                },
            ],
            vscode.ConfigurationTarget.Global
        );
    });

    it("merges the ignored title into the current list", async () => {
        const existing = {
            title: "乙",
            ignoredAt: new Date().toISOString(),
        };
        const update = vi.fn(
            (_key: string, _value: unknown, _target?: unknown) =>
                Promise.resolve()
        );
        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(() => [existing]),
            update,
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        await settings.ignoreReminders(["甲"]);

        const written = update.mock.calls[0][1] as Array<{ title: string }>;
        expect(written.map(item => item.title)).toEqual(["乙", "甲"]);
    });

    it("serializes overlapping ignore writes so neither is lost", async () => {
        /*
         * 复现（M8，见 TODO.md）：两次「不再提醒」并发时，第二次的读取
         * 发生在第一次写落盘之前——它基于旧列表合并，最终覆盖掉先写入
         * 的记录，丢一次忽略。
         */
        let stored: Array<{ title: string }> = [];
        let releaseFirstWrite: () => void = () => undefined;
        const update = vi.fn((_key: string, value: unknown) => {
            if (1 === update.mock.calls.length) {
                return new Promise<void>(resolve => {
                    releaseFirstWrite = () => {
                        stored = value as Array<{ title: string }>;
                        resolve();
                    };
                });
            }

            stored = value as Array<{ title: string }>;
            return Promise.resolve();
        });
        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(() => stored),
            update,
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        const first = settings.ignoreReminders(["甲"]);
        const second = settings.ignoreReminders(["乙"]);

        /* 队列让写入变成微任务：先让第一个写开始并阻塞在 update 上。 */
        await vi.waitFor(() => {
            expect(update).toHaveBeenCalledTimes(1);
        });

        releaseFirstWrite();
        await Promise.all([first, second]);

        const titles = stored.map(item => item.title);
        expect(titles).toContain("甲");
        expect(titles).toContain("乙");
    });

    it("drops expired ignored records on prune", async () => {
        const stale = {
            title: "甲",
            ignoredAt: new Date(
                Date.now() - 200 * 24 * 60 * 60 * 1000
            ).toISOString(),
        };
        const update = vi.fn(() => Promise.resolve());
        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(() => [stale]),
            update,
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        await settings.pruneIgnoredReminders();

        expect(update).toHaveBeenCalledWith(
            ConfigKey.IgnoredReminders,
            [],
            vscode.ConfigurationTarget.Global
        );
    });

    it("skips the write when every ignored record is still fresh", async () => {
        const fresh = {
            title: "甲",
            ignoredAt: new Date().toISOString(),
        };
        const update = vi.fn(() => Promise.resolve());
        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(() => [fresh]),
            update,
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        await settings.pruneIgnoredReminders();

        expect(update).not.toHaveBeenCalled();
    });

    it("skips the write when the list was never configured", async () => {
        const update = vi.fn(() => Promise.resolve());
        vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
            get: vi.fn(() => undefined),
            update,
        } as unknown as ReturnType<typeof vscode.workspace.getConfiguration>);

        await settings.pruneIgnoredReminders();

        expect(update).not.toHaveBeenCalled();
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
            /* 切换来源会让状态栏在「下一场更新」与「今日概览」之间切换。 */
            ConfigKey.WeekSource,
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
