import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import { ConfigKey } from "@/configuration";
import { Reminder } from "@/reminder";
import { weekBangumiData, wBangumi } from "@/test/mocks/fixtures/weekBangumi";
import { nextDayStart } from "@/utils/clock";

/**
 * Status bar double handed out by the `vscode` mock.
 *
 * @author sdttttt
 */
interface StatusBarStub {
    text: string;
    tooltip: string | undefined;
    name?: string;
    command: unknown;
    show: ReturnType<typeof vi.fn>;
    hide: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
}

/**
 * Makes the configuration read answer with the given values.
 *
 * @author sdttttt
 */
function stubConfig(values: Record<string, unknown>): void {
    vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: vi.fn((key: string) => values[key]),
    } as never);
}

/**
 * Builds a status bar double and wires it into the `vscode` mock.
 *
 * @author sdttttt
 */
function stubStatusBar(): StatusBarStub {
    const statusBar: StatusBarStub = {
        text: "",
        tooltip: undefined,
        command: undefined,
        show: vi.fn(),
        hide: vi.fn(),
        dispose: vi.fn(),
    };
    vi.mocked(vscode.window.createStatusBarItem).mockReturnValue(
        statusBar as never
    );
    return statusBar;
}

/**
 * A schedule flagged by the API as today.
 *
 * @author sdttttt
 */
function today(options: {
    offsetSeconds?: number;
    seasons?: ReturnType<typeof wBangumi>[];
}) {
    const offset = options.offsetSeconds ?? 3_600;
    const pubTs = Math.floor(Date.now() / 1000) + offset;

    return [
        weekBangumiData({
            date: "10-31",
            is_today: 1,
            seasons: options.seasons ?? [
                wBangumi({
                    title: "今日番剧",
                    pub_time: "20:00",
                    pub_ts: pubTs,
                }),
            ],
        }),
    ];
}

describe("Reminder", () => {
    let statusBar: StatusBarStub;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 31, 12, 0));
        statusBar = stubStatusBar();
        stubConfig({
            [ConfigKey.DisplayStatusBar]: true,
            [ConfigKey.ReminderAheadTime]: 0,
            [ConfigKey.EnableReminder]: true,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.mocked(vscode.window.showInformationMessage).mockClear();
    });

    it("reports the next update in the status bar", async () => {
        const reminder = new Reminder(() => Promise.resolve(today({})));

        await reminder.start();

        expect(statusBar.text).toContain("今日番剧");
        expect(statusBar.show).toHaveBeenCalled();
        reminder.dispose();
    });

    it("leaves the status bar untouched without upcoming bangumi", async () => {
        const reminder = new Reminder(() =>
            Promise.resolve(today({ seasons: [] }))
        );

        await reminder.start();

        expect(statusBar.show).not.toHaveBeenCalled();
        expect(statusBar.text).toBe("");
        reminder.dispose();
    });

    it("keeps the entry hidden when the setting is off", async () => {
        stubConfig({
            [ConfigKey.DisplayStatusBar]: false,
            [ConfigKey.EnableReminder]: true,
        });
        const reminder = new Reminder(() => Promise.resolve(today({})));

        await reminder.start();

        expect(statusBar.show).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("schedules nothing when the reminder is disabled", async () => {
        stubConfig({ [ConfigKey.EnableReminder]: false });
        const source = vi.fn(() => Promise.resolve(today({})));
        const reminder = new Reminder(source);

        await reminder.start();

        expect(source).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
        reminder.dispose();
    });

    it("warns once when the schedule has no entry for today", async () => {
        const reminder = new Reminder(() =>
            Promise.resolve([weekBangumiData({ is_today: 0, date_ts: 0 })])
        );

        await reminder.start();
        await reminder.refresh();

        expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "没有找到今日的索引 ??"
        );
        reminder.dispose();
    });

    it("notifies the user when an update is due", async () => {
        const reminder = new Reminder(() =>
            Promise.resolve(today({ offsetSeconds: 60 }))
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "《今日番剧》 更新啦！",
            "Open WeekBangumi"
        );
        reminder.dispose();
    });

    it("announces the remaining minutes when the lead time is set", async () => {
        stubConfig({
            [ConfigKey.DisplayStatusBar]: true,
            [ConfigKey.ReminderAheadTime]: 600,
            [ConfigKey.EnableReminder]: true,
        });
        const reminder = new Reminder(() =>
            Promise.resolve(today({ offsetSeconds: 3_600 }))
        );

        await reminder.start();
        vi.advanceTimersByTime(3_000_000);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "《今日番剧》 还有10分钟就更新啦！",
            "Open WeekBangumi"
        );
        reminder.dispose();
    });

    it("sends one notification per update group", async () => {
        const pubTs = Math.floor(Date.now() / 1000) + 60;
        const reminder = new Reminder(() =>
            Promise.resolve(
                today({
                    seasons: [
                        wBangumi({
                            title: "甲",
                            pub_time: "20:00",
                            pub_ts: pubTs,
                        }),
                        wBangumi({
                            title: "乙",
                            pub_time: "20:00",
                            pub_ts: pubTs,
                        }),
                    ],
                })
            )
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "《甲》、《乙》 更新啦！",
            "Open WeekBangumi"
        );
        reminder.dispose();
    });

    it("collapses a large group into a count", async () => {
        const pubTs = Math.floor(Date.now() / 1000) + 60;
        const titles = ["甲", "乙", "丙", "丁"];
        const reminder = new Reminder(() =>
            Promise.resolve(
                today({
                    seasons: titles.map(title =>
                        wBangumi({ title, pub_time: "20:00", pub_ts: pubTs })
                    ),
                })
            )
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "《甲》、《乙》、《丙》等 4 部 更新啦！",
            "Open WeekBangumi"
        );
        reminder.dispose();
    });

    it("retries after a failed request", async () => {
        const source = vi
            .fn<() => Promise<undefined>>()
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(today({}) as never);
        const reminder = new Reminder(source as never);

        await reminder.start();
        expect(statusBar.text).toBe("");

        await vi.advanceTimersByTimeAsync(30_000);

        expect(source).toHaveBeenCalledTimes(2);
        expect(statusBar.text).toContain("今日番剧");
        reminder.dispose();
    });

    it("retries when the request rejects", async () => {
        const source = vi
            .fn()
            .mockRejectedValueOnce(new Error("offline"))
            .mockResolvedValue(today({}));
        const reminder = new Reminder(source);

        await reminder.start();

        expect(vi.getTimerCount()).toBe(1);
        reminder.dispose();
    });

    it("keeps a single timer across repeated refreshes", async () => {
        const reminder = new Reminder(() => Promise.resolve(today({})));

        await reminder.start();
        await reminder.refresh();
        await reminder.refresh();

        expect(vi.getTimerCount()).toBe(1);
        reminder.dispose();
    });

    it("releases every timer and the status bar on dispose", async () => {
        const reminder = new Reminder(() => Promise.resolve(today({})));

        await reminder.start();
        reminder.dispose();

        expect(vi.getTimerCount()).toBe(0);
        expect(statusBar.dispose).toHaveBeenCalledTimes(1);
    });

    it("survives dispose without a started schedule", () => {
        const reminder = new Reminder(() => Promise.resolve(undefined));

        expect(() => reminder.dispose()).not.toThrow();
    });

    it("pulls the schedule again when the day rolls over", async () => {
        const source = vi.fn(() => Promise.resolve(today({})));
        const reminder = new Reminder(source);

        await reminder.start();
        expect(source).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(
            nextDayStart(Date.now()) - Date.now() + 5 * 60 * 1000
        );

        expect(source.mock.calls.length).toBeGreaterThan(1);
        reminder.dispose();
    });

    it("ignores a response that arrives after a newer refresh", async () => {
        let resolveFirst: (value: never) => void = () => undefined;
        const first = new Promise<never>(resolve => {
            resolveFirst = resolve;
        });
        const source = vi
            .fn()
            .mockReturnValueOnce(first)
            .mockResolvedValue(today({}));
        const reminder = new Reminder(source as never);

        const pending = reminder.refresh();
        await reminder.refresh();
        resolveFirst([] as never);
        await pending;

        expect(statusBar.text).toContain("今日番剧");
        reminder.dispose();
    });

    it("follows the settings listener", async () => {
        const reminder = new Reminder(() => Promise.resolve(today({})));
        await reminder.start();

        expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalledTimes(
            1
        );
        reminder.dispose();
    });

    it("re-reads the settings when they change", async () => {
        const source = vi.fn(() => Promise.resolve(today({})));
        const reminder = new Reminder(source);
        await reminder.start();
        source.mockClear();

        const listener = vi.mocked(vscode.workspace.onDidChangeConfiguration)
            .mock.calls[0][0];
        stubConfig({
            [ConfigKey.DisplayStatusBar]: true,
            [ConfigKey.EnableReminder]: false,
        });
        listener({ affectsConfiguration: () => true } as never);
        await vi.waitFor(() => {
            expect(vi.getTimerCount()).toBe(0);
        });

        expect(source).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("ignores an unrelated settings change", async () => {
        const source = vi.fn(() => Promise.resolve(today({})));
        const reminder = new Reminder(source);
        await reminder.start();
        source.mockClear();

        const listener = vi.mocked(vscode.workspace.onDidChangeConfiguration)
            .mock.calls[0][0];
        listener({ affectsConfiguration: () => false } as never);
        await Promise.resolve();

        expect(source).not.toHaveBeenCalled();
        reminder.dispose();
    });
});
