import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import { createSettingsStub, type SettingsStub } from "@/test/mocks/settings";
import {
    createAvailabilityStub,
    createCommandsStub,
    createNotifierStub,
    type AvailabilityStub,
    type CommandsStub,
    type NotifierStub,
} from "@/test/mocks/ports";
import {
    useReminder,
    type Reminder,
    type OverviewSource,
    type WeekSource,
} from "@/reminder";
import { useScheduler } from "@/reminder/scheduler";
import { useStatusBar } from "@/reminder/statusBar";
import { toScheduleFromBgmTv } from "@/request/schedule";
import { weekBangumiData, wBangumi } from "@/test/mocks/fixtures/weekBangumi";
import { bgmCalendar } from "@/test/mocks/fixtures/bgm";
import { nextDayStart } from "@/utils/clock";

/**
 * 由 `vscode` 桩返回的状态栏替身。
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
 * 构建状态栏替身，并把它接到 `vscode` 桩上。
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
 * 接口标记为今天的一份日程。
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

/**
 * 按组合根的方式装配提醒：状态栏与调度器在这里创建后传入，
 * 提醒本身不拥有任何东西。
 *
 * @author sdttttt
 */
interface ReminderHarness {
    readonly reminder: Reminder;
    readonly notifier: NotifierStub;
    readonly commands: CommandsStub;
    readonly settings: SettingsStub;
    readonly availability: AvailabilityStub;
}

function createHarness(
    source: WeekSource,
    settings: SettingsStub,
    overview: OverviewSource = () => Promise.resolve(undefined)
): ReminderHarness {
    const statusBar = useStatusBar("weekBangumi");
    const notifier = createNotifierStub();
    const commands = createCommandsStub();
    const availability = createAvailabilityStub();
    const now = (): number => Date.now();

    const reminder = useReminder({
        source,
        overview,
        statusBar,
        settings,
        notifier: notifier.notifier,
        commands: commands.commands,
        availability: availability.availability,
        onSettingsChanged: listener =>
            vscode.workspace.onDidChangeConfiguration(event =>
                listener(section => event.affectsConfiguration(section))
            ),
        scheduler: useScheduler(
            {
                onEvent: event => reminder.fire(event),
                onRollover: () => void reminder.refresh(),
            },
            now
        ),
        now,
    });

    return { reminder, notifier, commands, settings, availability };
}

function createReminder(source: WeekSource, settings: SettingsStub): Reminder {
    return createHarness(source, settings).reminder;
}

describe("Reminder", () => {
    let statusBar: StatusBarStub;
    let settings: SettingsStub;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 31, 12, 0));
        statusBar = stubStatusBar();
        settings = createSettingsStub({
            "bangumiOpen.DisplayStatusBar": true,
            "bangumiOpen.ReminderAheadTime": 0,
            "bangumiOpen.EnableReminder": true,
            /* 提醒只属于 B 站来源，默认来源是 Bangumi，因此这里显式指定。 */
            "bangumiOpen.WeekSource": "bilibili",
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.mocked(vscode.window.showInformationMessage).mockClear();
    });

    it("reports the next update in the status bar", async () => {
        const reminder = createReminder(
            () => Promise.resolve(today({})),
            settings
        );

        await reminder.start();

        expect(statusBar.text).toContain("今日番剧");
        expect(statusBar.show).toHaveBeenCalled();
        reminder.dispose();
    });

    it("leaves the status bar untouched without upcoming bangumi", async () => {
        const reminder = createReminder(
            () => Promise.resolve(today({ seasons: [] })),
            settings
        );

        await reminder.start();

        expect(statusBar.show).not.toHaveBeenCalled();
        expect(statusBar.text).toBe("");
        reminder.dispose();
    });

    it("keeps the entry hidden when the setting is off", async () => {
        settings.values["bangumiOpen.DisplayStatusBar"] = false;
        const reminder = createReminder(
            () => Promise.resolve(today({})),
            settings
        );

        await reminder.start();

        expect(statusBar.show).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("shows the today overview in the bangumi mode", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        const schedule = vi.fn(() =>
            Promise.resolve({
                source: "bangumi" as const,
                hasSlots: false,
                days: [
                    {
                        dayOfWeek: 6,
                        date: "10-31",
                        isToday: true,
                        items: [
                            {
                                title: "今日番剧",
                                cover: "",
                                url: "",
                                pubTime: "",
                                progress: "2026-10-31",
                                delay: false,
                                delayReason: "",
                            },
                        ],
                    },
                ],
            })
        );
        const { reminder } = createHarness(
            () => Promise.resolve(today({})),
            settings,
            schedule
        );

        await reminder.start();

        expect(statusBar.text).toBe("$(calendar) 今日 今日番剧");
        reminder.dispose();
    });

    it("keeps the bilibili reminder off in the bangumi mode", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        const source = vi.fn(() =>
            Promise.resolve(today({ offsetSeconds: 60 }))
        );
        const { reminder, notifier } = createHarness(source, settings, () =>
            Promise.resolve(undefined)
        );

        await reminder.start();
        vi.advanceTimersByTime(120_000);

        expect(source).not.toHaveBeenCalled();
        expect(notifier.actions).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("does not even fetch the overview when the status bar is off", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        settings.values["bangumiOpen.DisplayStatusBar"] = false;
        const schedule = vi.fn(() => Promise.resolve(undefined));
        const { reminder } = createHarness(
            () => Promise.resolve(today({})),
            settings,
            schedule
        );

        await reminder.start();

        expect(schedule).not.toHaveBeenCalled();
        expect(statusBar.show).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("reloads the overview after the day rolls over", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        const schedule = vi.fn(() =>
            Promise.resolve({
                source: "bangumi" as const,
                hasSlots: false,
                days: [
                    { dayOfWeek: 6, date: "10-31", isToday: true, items: [] },
                ],
            })
        );
        const { reminder } = createHarness(
            () => Promise.resolve(today({})),
            settings,
            schedule
        );

        await reminder.start();
        schedule.mockClear();
        vi.advanceTimersByTime(24 * 60 * 60 * 1000);

        await vi.waitFor(() => {
            expect(schedule).toHaveBeenCalled();
        });
        reminder.dispose();
    });

    it("hides the overview when no day is flagged as today", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        const { reminder } = createHarness(
            () => Promise.resolve(today({})),
            settings,
            () =>
                Promise.resolve({
                    source: "bangumi" as const,
                    hasSlots: false,
                    days: [
                        {
                            dayOfWeek: 6,
                            date: "10-31",
                            isToday: false,
                            items: [],
                        },
                    ],
                })
        );

        await reminder.start();

        expect(statusBar.show).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("retries the overview when the request fails", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        const schedule = vi
            .fn()
            .mockRejectedValueOnce(new Error("boom"))
            .mockResolvedValue({
                source: "bangumi" as const,
                hasSlots: false,
                days: [
                    { dayOfWeek: 6, date: "10-31", isToday: true, items: [] },
                ],
            });
        const { reminder } = createHarness(
            () => Promise.resolve(today({})),
            settings,
            schedule
        );

        await reminder.start();
        vi.advanceTimersByTime(30_000);

        await vi.waitFor(() => {
            expect(schedule).toHaveBeenCalledTimes(2);
        });
        reminder.dispose();
    });

    it("switches to the overview when the source changes", async () => {
        const { reminder } = createHarness(
            () => Promise.resolve(today({})),
            settings,
            () =>
                Promise.resolve({
                    source: "bangumi" as const,
                    hasSlots: false,
                    days: [
                        {
                            dayOfWeek: 6,
                            date: "10-31",
                            isToday: true,
                            items: [
                                {
                                    title: "今日番剧",
                                    cover: "",
                                    url: "",
                                    pubTime: "",
                                    progress: "",
                                    delay: false,
                                    delayReason: "",
                                },
                            ],
                        },
                    ],
                })
        );
        await reminder.start();
        expect(statusBar.text).toContain("今日番剧");

        const listener = vi.mocked(vscode.workspace.onDidChangeConfiguration)
            .mock.calls[0][0];
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        listener({ affectsConfiguration: () => true } as never);

        await vi.waitFor(() => {
            expect(statusBar.text).toBe("$(calendar) 今日 今日番剧");
        });
        reminder.dispose();
    });

    it("keeps the overview across a dismissed notification callback", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        const { reminder, commands } = createHarness(
            () => Promise.resolve(today({})),
            settings,
            () =>
                Promise.resolve({
                    source: "bangumi" as const,
                    hasSlots: false,
                    days: [
                        {
                            dayOfWeek: 6,
                            date: "10-31",
                            isToday: true,
                            items: [],
                        },
                    ],
                })
        );

        await reminder.start();
        /* 概览模式下没有事件，fire 不会改变状态栏。 */
        reminder.fire({ at: 0, pubTs: 0, pubTime: "20:00", titles: ["甲"] });

        expect(commands.execute).not.toHaveBeenCalled();
        expect(statusBar.text).toBe("$(calendar) 今日没有更新");
        reminder.dispose();
    });

    it("drops the overview when switching back to bilibili", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        const { reminder } = createHarness(
            () => Promise.resolve(today({})),
            settings,
            () =>
                Promise.resolve({
                    source: "bangumi" as const,
                    hasSlots: false,
                    days: [
                        {
                            dayOfWeek: 6,
                            date: "10-31",
                            isToday: true,
                            items: [],
                        },
                    ],
                })
        );
        await reminder.start();
        expect(statusBar.text).toContain("今日");

        const listener = vi.mocked(vscode.workspace.onDidChangeConfiguration)
            .mock.calls[0][0];
        settings.values["bangumiOpen.WeekSource"] = "bilibili";
        listener({ affectsConfiguration: () => true } as never);

        /* 回到 B 站后条目必须是「下一场更新」，不能残留概览。 */
        await vi.waitFor(() => {
            expect(statusBar.text).toContain("今日番剧");
            expect(statusBar.text).not.toContain("今日 今日番剧");
        });
        reminder.dispose();
    });

    it("keeps the status bar but drops the notification when the reminder is disabled", async () => {
        settings.values["bangumiOpen.EnableReminder"] = false;
        const source = vi.fn(() => Promise.resolve(today({})));
        const { reminder, notifier } = createHarness(source, settings);

        await reminder.start();

        /* 提醒关了，状态栏仍然要显示「下一场更新」。 */
        expect(statusBar.text).toContain("今日番剧");

        vi.advanceTimersByTime(120_000);

        expect(notifier.actions).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("schedules nothing when both the reminder and the status bar are off", async () => {
        settings.values["bangumiOpen.EnableReminder"] = false;
        settings.values["bangumiOpen.DisplayStatusBar"] = false;
        const source = vi.fn(() => Promise.resolve(today({})));
        const reminder = createReminder(source, settings);

        await reminder.start();

        expect(source).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
        reminder.dispose();
    });

    it("warns once when the schedule has no entry for today", async () => {
        const { reminder, notifier } = createHarness(
            () =>
                Promise.resolve([weekBangumiData({ is_today: 0, date_ts: 0 })]),
            settings
        );

        await reminder.start();
        await reminder.refresh();

        expect(notifier.info).toHaveBeenCalledTimes(1);
        expect(notifier.info).toHaveBeenCalledWith(
            "没有找到今日的番剧数据，提醒可能不准确。"
        );
        reminder.dispose();
    });

    it("notifies the user when an update is due", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(notifier.actions).toHaveBeenCalledWith("《今日番剧》 更新啦！", [
            "打开周番表",
            "不再提醒",
        ]);
        reminder.dispose();
    });

    it("announces the remaining minutes when the lead time is set", async () => {
        settings.values["bangumiOpen.ReminderAheadTime"] = 600;
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 3_600 })),
            settings
        );

        await reminder.start();
        vi.advanceTimersByTime(3_000_000);

        expect(notifier.actions).toHaveBeenCalledWith(
            "《今日番剧》 还有10分钟就更新啦！",
            ["打开周番表", "不再提醒"]
        );
        reminder.dispose();
    });

    it("sends one notification per update group", async () => {
        const pubTs = Math.floor(Date.now() / 1000) + 60;
        const { reminder, notifier } = createHarness(
            () =>
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
                ),
            settings
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(notifier.actions).toHaveBeenCalledTimes(1);
        expect(notifier.actions).toHaveBeenCalledWith(
            "《甲》、《乙》 更新啦！",
            ["打开周番表", "不再提醒"]
        );
        reminder.dispose();
    });

    it("collapses a large group into a count", async () => {
        const pubTs = Math.floor(Date.now() / 1000) + 60;
        const titles = ["甲", "乙", "丙", "丁"];
        const { reminder, notifier } = createHarness(
            () =>
                Promise.resolve(
                    today({
                        seasons: titles.map(title =>
                            wBangumi({
                                title,
                                pub_time: "20:00",
                                pub_ts: pubTs,
                            })
                        ),
                    })
                ),
            settings
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(notifier.actions).toHaveBeenCalledWith(
            "《甲》、《乙》、《丙》等 4 部 更新啦！",
            ["打开周番表", "不再提醒"]
        );
        reminder.dispose();
    });

    it("offers a mute button next to the open action", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(notifier.actions).toHaveBeenCalledWith("《今日番剧》 更新啦！", [
            "打开周番表",
            "不再提醒",
        ]);
        reminder.dispose();
    });

    it("turns every reminder off from the mute menu", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue("关闭全部番剧的更新提醒");

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(settings.disableReminder).toHaveBeenCalledTimes(1);
        });

        /* 状态栏不受影响：静音只针对弹窗。 */
        expect(statusBar.text).not.toBe("");
        reminder.dispose();
    });

    it("stops notifying after the reminder is muted", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue("关闭全部番剧的更新提醒");

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(notifier.actions).toHaveBeenCalledTimes(1);
        });

        notifier.actions.mockClear();
        vi.advanceTimersByTime(120_000);

        expect(notifier.actions).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("mutes the reminder without any further notification", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue(undefined);

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(notifier.pick).toHaveBeenCalled();
        });

        /*
         * 用户按下「不再提醒」就是要清净：确认提示本身也是弹窗，
         * 因此关闭与忽略的过程都必须完全静默。
         */
        expect(notifier.info).not.toHaveBeenCalled();
        expect(notifier.error).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("opens the mute menu with one entry per bangumi", async () => {
        const pubTs = Math.floor(Date.now() / 1000) + 60;
        const { reminder, notifier } = createHarness(
            () =>
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
                ),
            settings
        );

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue(undefined);

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(notifier.pick).toHaveBeenCalledWith(
                [
                    "不再提醒《甲》",
                    "不再提醒《乙》",
                    "该时段 2 部都不再提醒",
                    "关闭全部番剧的更新提醒",
                ],
                "不再提醒哪部番剧？"
            );
        });
        reminder.dispose();
    });

    it("ignores a single bangumi from the mute menu", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue("不再提醒《今日番剧》");

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(settings.ignoreReminders).toHaveBeenCalledWith(["今日番剧"]);
        });

        /* 忽略单部不等于关闭提醒，全局开关不该被动到。 */
        expect(settings.disableReminder).not.toHaveBeenCalled();
        expect(settings.values["bangumiOpen.IgnoredReminders"]).toEqual([
            {
                title: "今日番剧",
                ignoredAt: expect.any(String) as unknown as string,
            },
        ]);
        reminder.dispose();
    });

    it("stops notifying about an ignored bangumi", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue("不再提醒《今日番剧》");

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(settings.ignoreReminders).toHaveBeenCalled();
        });

        notifier.actions.mockClear();
        await reminder.refresh();
        vi.advanceTimersByTime(120_000);

        expect(notifier.actions).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("ignores the whole slot from the mute menu", async () => {
        const pubTs = Math.floor(Date.now() / 1000) + 60;
        const { reminder, notifier } = createHarness(
            () =>
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
                ),
            settings
        );

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue("该时段 2 部都不再提醒");

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(settings.ignoreReminders).toHaveBeenCalledWith(["甲", "乙"]);
        });
        reminder.dispose();
    });

    it("holds the whole notification back when every title is ignored", async () => {
        settings.values["bangumiOpen.IgnoredReminders"] = [
            {
                title: "今日番剧",
                ignoredAt: new Date(Date.now()).toISOString(),
            },
        ];
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(notifier.actions).not.toHaveBeenCalled();

        /* 状态栏仍然照常工作：忽略只针对弹窗。 */
        expect(statusBar.text).toContain("今日番剧");
        reminder.dispose();
    });

    it("announces only the titles that are still relevant", async () => {
        settings.values["bangumiOpen.IgnoredReminders"] = [
            { title: "甲", ignoredAt: new Date(Date.now()).toISOString() },
        ];
        const pubTs = Math.floor(Date.now() / 1000) + 60;
        const { reminder, notifier } = createHarness(
            () =>
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
                ),
            settings
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(notifier.actions).toHaveBeenCalledWith("《乙》 更新啦！", [
            "打开周番表",
            "不再提醒",
        ]);
        reminder.dispose();
    });

    it("leaves everything alone when the mute menu is dismissed", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue(undefined);

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(notifier.pick).toHaveBeenCalled();
        });

        expect(settings.ignoreReminders).not.toHaveBeenCalled();
        expect(settings.disableReminder).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("keeps the reminder alive when the mute menu fails", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockRejectedValue(new Error("no quick pick"));

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(notifier.pick).toHaveBeenCalled();
        });

        expect(settings.ignoreReminders).not.toHaveBeenCalled();
        expect(settings.disableReminder).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("prunes the ignored list when it starts", async () => {
        const reminder = createReminder(
            () => Promise.resolve(today({})),
            settings
        );

        await reminder.start();

        expect(settings.pruneIgnoredReminders).toHaveBeenCalledTimes(1);
        reminder.dispose();
    });

    it("still starts when the ignored list cannot be pruned", async () => {
        settings.pruneIgnoredReminders.mockRejectedValue(
            new Error("read only")
        );
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        expect(notifier.actions).toHaveBeenCalled();
        reminder.dispose();
    });

    it("still opens the week table when the open action is pressed", async () => {
        const { reminder, notifier, commands } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        notifier.actions.mockResolvedValue("打开周番表");

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(commands.execute).toHaveBeenCalledWith("weekBangumi");
        });
        reminder.dispose();
    });

    it("keeps the reminder muted even if the setting cannot be written", async () => {
        const { reminder, notifier } = createHarness(
            () => Promise.resolve(today({ offsetSeconds: 60 })),
            settings
        );

        settings.disableReminder.mockRejectedValue(new Error("read only"));
        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue("关闭全部番剧的更新提醒");

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(settings.disableReminder).toHaveBeenCalledTimes(1);
        });

        notifier.actions.mockClear();
        vi.advanceTimersByTime(120_000);

        expect(notifier.actions).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("resumes the reminder when the user turns it back on", async () => {
        const source = vi.fn(() =>
            Promise.resolve(today({ offsetSeconds: 60 }))
        );
        const { reminder, notifier } = createHarness(source, settings);

        notifier.actions.mockResolvedValue("不再提醒");
        notifier.pick.mockResolvedValue("关闭全部番剧的更新提醒");

        await reminder.start();
        vi.advanceTimersByTime(60_000);

        await vi.waitFor(() => {
            expect(settings.disableReminder).toHaveBeenCalledTimes(1);
        });

        notifier.actions.mockClear();

        /* 用户在设置里重新打开提醒，静音标记随之失效。 */
        settings.values["bangumiOpen.EnableReminder"] = true;
        const listener = vi.mocked(vscode.workspace.onDidChangeConfiguration)
            .mock.calls[0][0];
        listener({ affectsConfiguration: () => true } as never);

        await vi.waitFor(() => {
            expect(source).toHaveBeenCalled();
        });

        vi.advanceTimersByTime(120_000);

        expect(notifier.actions).toHaveBeenCalled();
        reminder.dispose();
    });

    it("retries after a failed request", async () => {
        const source = vi
            .fn<() => Promise<undefined>>()
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(today({}) as never);
        const reminder = createReminder(source, settings);

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
        const reminder = createReminder(source, settings);

        await reminder.start();

        expect(vi.getTimerCount()).toBe(1);
        reminder.dispose();
    });

    it("keeps a single timer across repeated refreshes", async () => {
        const reminder = createReminder(
            () => Promise.resolve(today({})),
            settings
        );

        await reminder.start();
        await reminder.refresh();
        await reminder.refresh();

        expect(vi.getTimerCount()).toBe(1);
        reminder.dispose();
    });

    it("releases every timer and the status bar on dispose", async () => {
        const reminder = createReminder(
            () => Promise.resolve(today({})),
            settings
        );

        await reminder.start();
        reminder.dispose();

        expect(vi.getTimerCount()).toBe(0);
        expect(statusBar.dispose).toHaveBeenCalledTimes(1);
    });

    it("survives dispose without a started schedule", () => {
        const reminder = createReminder(
            () => Promise.resolve(undefined),
            settings
        );

        expect(() => reminder.dispose()).not.toThrow();
    });

    it("pulls the schedule again when the day rolls over", async () => {
        const source = vi.fn(() => Promise.resolve(today({})));
        const reminder = createReminder(source, settings);

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
        const reminder = createReminder(source, settings);

        const pending = reminder.refresh();
        await reminder.refresh();
        resolveFirst([] as never);
        await pending;

        expect(statusBar.text).toContain("今日番剧");
        reminder.dispose();
    });

    it("follows the settings listener", async () => {
        const reminder = createReminder(
            () => Promise.resolve(today({})),
            settings
        );
        await reminder.start();

        expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalledTimes(
            1
        );
        reminder.dispose();
    });

    it("re-reads the settings when they change", async () => {
        const source = vi.fn(() => Promise.resolve(today({})));
        const reminder = createReminder(source, settings);
        await reminder.start();
        source.mockClear();

        const listener = vi.mocked(vscode.workspace.onDidChangeConfiguration)
            .mock.calls[0][0];
        settings.values["bangumiOpen.EnableReminder"] = false;
        settings.values["bangumiOpen.DisplayStatusBar"] = false;
        listener({ affectsConfiguration: () => true } as never);
        await vi.waitFor(() => {
            expect(vi.getTimerCount()).toBe(0);
        });

        expect(source).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("ignores an unrelated settings change", async () => {
        const source = vi.fn(() => Promise.resolve(today({})));
        const reminder = createReminder(source, settings);
        await reminder.start();
        source.mockClear();

        const listener = vi.mocked(vscode.workspace.onDidChangeConfiguration)
            .mock.calls[0][0];
        listener({ affectsConfiguration: () => false } as never);
        await Promise.resolve();

        expect(source).not.toHaveBeenCalled();
        reminder.dispose();
    });

    it("clears the status bar and the timers once every source is down", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bilibili";
        const { reminder, availability } = createHarness(
            () => Promise.resolve(today({})),
            settings
        );

        await reminder.start();
        expect(statusBar.show).toHaveBeenCalled();

        availability.setDown(true);

        expect(statusBar.hide).toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
        reminder.dispose();
    });

    it("does not keep its own retry timer while suspended", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bilibili";
        const source = vi.fn(() => Promise.resolve(undefined));
        const { reminder, availability } = createHarness(source, settings);
        await reminder.start();

        availability.setDown(true);
        await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

        /* 停摆期间的重试由可用性负责，提醒不再叠加自己的定时器。 */
        expect(source).toHaveBeenCalledTimes(1);
        reminder.dispose();
    });

    it("reloads the schedule once the sources recover", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bilibili";
        const source = vi.fn(() => Promise.resolve(today({})));
        const { reminder, availability } = createHarness(source, settings);
        await reminder.start();
        availability.setDown(true);
        source.mockClear();

        availability.setDown(false);
        await vi.waitFor(() => {
            expect(source).toHaveBeenCalled();
        });

        expect(statusBar.text).toContain("今日番剧");
        reminder.dispose();
    });

    it("drops the bangumi overview while suspended", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        const overview = vi.fn(() =>
            Promise.resolve(toScheduleFromBgmTv(bgmCalendar(), Date.now()))
        );
        const { reminder, availability } = createHarness(
            () => Promise.resolve(undefined),
            settings,
            overview
        );
        await reminder.start();
        await vi.waitFor(() => {
            expect(statusBar.text).not.toBe("");
        });

        availability.setDown(true);

        expect(statusBar.hide).toHaveBeenCalled();
        reminder.dispose();
    });
});
