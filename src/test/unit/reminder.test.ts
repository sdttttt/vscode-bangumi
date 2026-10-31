import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";

vi.mock("@/request/bangumi", () => ({
    getAllBangumi: vi.fn(),
    getWeekBangumi: vi.fn(),
}));

import { getWeekBangumi } from "@/request/bangumi";
import { ConfigKey } from "@/configuration";
import { wBangumi, weekBangumiData } from "@/test/mocks/fixtures/weekBangumi";

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

interface StatusBarStub {
    text: string;
    command: unknown;
    show: ReturnType<typeof vi.fn>;
    hide: ReturnType<typeof vi.fn>;
}

/**
 * Loads the reminder singleton after the configuration stub is in place.
 *
 * @author sdttttt
 */
async function loadReminder(values: Record<string, unknown>): Promise<{
    reminder: (typeof import("@/reminder"))["default"];
    statusBar: StatusBarStub;
}> {
    vi.resetModules();
    stubConfig(values);

    const statusBar: StatusBarStub = {
        text: "",
        command: undefined,
        show: vi.fn(),
        hide: vi.fn(),
    };
    vi.mocked(vscode.window.createStatusBarItem).mockReturnValue(
        statusBar as never
    );

    const { default: reminder } = await import("@/reminder");
    return { reminder, statusBar };
}

/**
 * A schedule where today (day 0) and tomorrow carry bangumi.
 *
 * @author sdttttt
 */
function todaySchedule(pubTsOffsetSeconds = 3_600) {
    const nowSeconds = Math.floor(Date.now() / 1000);

    return [
        weekBangumiData({
            date: "10-31",
            day_of_week: 6,
            seasons: [
                wBangumi({
                    title: "今日番剧",
                    pub_time: "20:00",
                    pub_ts: nowSeconds + pubTsOffsetSeconds,
                }),
            ],
        }),
        weekBangumiData({
            date: "11-1",
            day_of_week: 7,
            seasons: [
                wBangumi({
                    title: "明日番剧",
                    pub_time: "21:00",
                    pub_ts: nowSeconds + pubTsOffsetSeconds + 60,
                }),
            ],
        }),
    ];
}

describe("Reminder", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 31, 12, 0));
        /* 10-31 is the day the fixtures must report as today */
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.mocked(vscode.window.showInformationMessage).mockClear();
    });

    it("shows the status bar item when the setting is enabled", async () => {
        const { statusBar } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: true,
        });

        expect(statusBar.show).toHaveBeenCalledTimes(1);
        expect(statusBar.hide).not.toHaveBeenCalled();
    });

    it("hides the status bar item when the setting is disabled", async () => {
        const { statusBar } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: false,
        });

        expect(statusBar.hide).toHaveBeenCalledTimes(1);
    });

    it("warns when the schedule has no entry for today", async () => {
        const { reminder } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: true,
        });
        vi.mocked(getWeekBangumi).mockResolvedValue([
            weekBangumiData({ date: "1-1", day_of_week: 1 }),
        ]);

        await reminder.enableBangumiUpdateReminder();

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "没有找到今日的索引 ??"
        );
    });

    it("does nothing when the schedule request fails", async () => {
        const { reminder, statusBar } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: true,
        });
        vi.mocked(getWeekBangumi).mockResolvedValue(undefined);

        await reminder.enableBangumiUpdateReminder();

        expect(statusBar.text).toBe("");
    });

    it("keeps the status bar hidden without upcoming bangumi", async () => {
        const { reminder, statusBar } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: true,
        });
        /* today is 10-31, so the fixtures below report an empty schedule */
        vi.mocked(getWeekBangumi).mockResolvedValue([
            weekBangumiData({ date: "10-31", day_of_week: 6, seasons: [] }),
            weekBangumiData({ date: "11-1", day_of_week: 7, seasons: [] }),
        ]);

        await reminder.enableBangumiUpdateReminder();

        expect(statusBar.text).toBe("");
    });

    it("reports the next bangumi in the status bar", async () => {
        const { reminder, statusBar } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: true,
            [ConfigKey.ReminderAheadTime]: 0,
        });
        vi.mocked(getWeekBangumi).mockResolvedValue(todaySchedule());

        await reminder.enableBangumiUpdateReminder();

        expect(statusBar.text).toContain("今日番剧");
        expect(statusBar.text).toContain("20:00");
    });

    it("truncates a long title in the status bar", async () => {
        const { reminder, statusBar } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: true,
        });
        vi.mocked(getWeekBangumi).mockResolvedValue([
            weekBangumiData({
                date: "10-31",
                day_of_week: 6,
                seasons: [
                    wBangumi({
                        title: "一个特别特别特别长的番剧名称",
                        pub_time: "20:00",
                        pub_ts: Math.floor(Date.now() / 1000) + 3_600,
                    }),
                ],
            }),
            weekBangumiData({ date: "11-1", day_of_week: 7, seasons: [] }),
        ]);

        await reminder.enableBangumiUpdateReminder();

        expect(statusBar.text).toContain("一个特别特别特...");
    });

    it("summarises a group sharing the same publication time", async () => {
        const { reminder, statusBar } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: true,
        });
        const pubTs = Math.floor(Date.now() / 1000) + 3_600;
        vi.mocked(getWeekBangumi).mockResolvedValue([
            weekBangumiData({
                date: "10-31",
                day_of_week: 6,
                seasons: [
                    wBangumi({ title: "甲", pub_time: "20:00", pub_ts: pubTs }),
                    wBangumi({ title: "乙", pub_time: "20:00", pub_ts: pubTs }),
                ],
            }),
            weekBangumiData({ date: "11-1", day_of_week: 7, seasons: [] }),
        ]);

        await reminder.enableBangumiUpdateReminder();

        expect(statusBar.text).toContain("有2部番");
    });

    it("clears every scheduled timer on destroy", async () => {
        const { reminder } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: true,
        });
        vi.mocked(getWeekBangumi).mockResolvedValue(todaySchedule());

        await reminder.enableBangumiUpdateReminder();
        reminder.destroyReminder();

        expect(vi.getTimerCount()).toBe(0);
    });

    it("survives destroy when nothing was scheduled", async () => {
        const { reminder } = await loadReminder({
            [ConfigKey.DisplayStatusBar]: true,
        });

        expect(() => reminder.destroyReminder()).not.toThrow();
    });
});
