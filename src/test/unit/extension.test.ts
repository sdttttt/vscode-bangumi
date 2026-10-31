import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import type { ExtensionContext } from "vscode";
import { COMMAND_IDS } from "@/commands";

vi.mock("@/reminder", () => ({
    default: {
        enableBangumiUpdateReminder: vi.fn(() => Promise.resolve()),
        destroyReminder: vi.fn(),
    },
}));

vi.mock("@/views/bangumi", () => ({
    default: {
        openBangumi: vi.fn(),
        nextPage: vi.fn(),
        backPage: vi.fn(),
        jumpPage: vi.fn(),
    },
}));

vi.mock("@/views/weekBangumi", () => ({
    default: { openWeekBangumi: vi.fn() },
}));

vi.mock("@/match/index", () => ({
    default: { openIndexList: vi.fn() },
}));

/**
 * Minimal `ExtensionContext` good enough for `activate()`.
 *
 * @author sdttttt
 */
function makeContext(): ExtensionContext {
    return {
        extensionPath: "/extension",
        subscriptions: [],
    } as unknown as ExtensionContext;
}

/**
 * Loads a fresh copy of the extension entry so `isInit` starts as false.
 *
 * @author sdttttt
 */
async function loadExtension(): Promise<typeof import("@/extension")> {
    vi.resetModules();
    return import("@/extension");
}

/**
 * Makes the config read answer with the given value for the reminder key.
 *
 * @author sdttttt
 */
function stubReminderSetting(enabled: boolean): void {
    vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: vi.fn(() => enabled),
    } as never);
}

describe("activate", () => {
    beforeEach(() => {
        vi.mocked(vscode.commands.registerCommand).mockClear();
    });

    it("registers every command id", async () => {
        stubReminderSetting(false);
        const { activate } = await loadExtension();
        const context = makeContext();

        activate(context);

        const registered = vi
            .mocked(vscode.commands.registerCommand)
            .mock.calls.map(([id]) => id);

        expect(registered.sort()).toEqual([...COMMAND_IDS].sort());
    });

    it("pushes every disposable into the extension subscriptions", async () => {
        stubReminderSetting(false);
        const { activate } = await loadExtension();
        const context = makeContext();

        activate(context);

        expect(context.subscriptions).toHaveLength(COMMAND_IDS.length);
    });

    it("passes a callable handler for each command", async () => {
        stubReminderSetting(false);
        const { activate } = await loadExtension();

        activate(makeContext());

        for (const [, handler] of vi.mocked(vscode.commands.registerCommand)
            .mock.calls) {
            expect(typeof handler).toBe("function");
        }
    });

    it("forwards a command invocation to the matching view", async () => {
        stubReminderSetting(false);
        const { activate } = await loadExtension();
        const BangumisView = (await import("@/views/bangumi")).default;

        activate(makeContext());
        const entry = vi
            .mocked(vscode.commands.registerCommand)
            .mock.calls.find(([id]) => "openBangumi" === id);

        entry?.[1]();

        expect(BangumisView.openBangumi).toHaveBeenCalledTimes(1);
    });

    it("schedules the reminder when the setting is enabled", async () => {
        stubReminderSetting(true);
        const { activate } = await loadExtension();
        const Reminder = (await import("@/reminder")).default;

        activate(makeContext());

        expect(Reminder.enableBangumiUpdateReminder).toHaveBeenCalledTimes(1);
    });

    it("initialises the extension context only once", async () => {
        stubReminderSetting(false);
        const { activate } = await loadExtension();
        const { getContext } = await import("@/constants");

        const first = makeContext();
        activate(first);
        activate(makeContext());

        expect(getContext()).toBe(first);
    });

    it("skips the reminder when the setting is disabled", async () => {
        stubReminderSetting(false);
        const { activate } = await loadExtension();
        const Reminder = (await import("@/reminder")).default;

        activate(makeContext());

        expect(Reminder.enableBangumiUpdateReminder).not.toHaveBeenCalled();
    });
});

describe("deactivate", () => {
    it("releases the reminder timers", async () => {
        stubReminderSetting(false);
        const { deactivate } = await loadExtension();
        const Reminder = (await import("@/reminder")).default;

        deactivate();

        expect(Reminder.destroyReminder).toHaveBeenCalledTimes(1);
    });
});
