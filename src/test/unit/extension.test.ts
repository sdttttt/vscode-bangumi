import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import type { ExtensionContext } from "vscode";
import { COMMAND_IDS } from "@/commands";

const reminder = {
    start: vi.fn(() => Promise.resolve()),
    refresh: vi.fn(() => Promise.resolve()),
    dispose: vi.fn(),
};

const bangumiView = {
    openBangumi: vi.fn(),
    nextPage: vi.fn(),
    backPage: vi.fn(),
    jumpPage: vi.fn(() => Promise.resolve()),
};

const weekBangumiView = {
    openWeekBangumi: vi.fn(),
};

const indexCommand = {
    openIndex: vi.fn(),
};

vi.mock("@/reminder", () => ({
    useReminder: vi.fn(() => reminder),
}));

vi.mock("@/views/bangumi", () => ({
    createBangumiView: vi.fn(() => bangumiView),
}));

vi.mock("@/views/weekBangumi", () => ({
    useWeekBangumiView: vi.fn(() => weekBangumiView),
}));

vi.mock("@/match/index", () => ({
    createIndexCommand: vi.fn(() => indexCommand),
}));

/**
 * 足够 `activate()` 使用的最小 `ExtensionContext`。
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
 * 重新加载扩展入口，使其会话从空状态开始。
 *
 * @author sdttttt
 */
async function loadExtension(): Promise<typeof import("@/extension")> {
    vi.resetModules();
    return import("@/extension");
}

describe("activate", () => {
    beforeEach(() => {
        vi.mocked(vscode.commands.registerCommand).mockClear();
        reminder.start.mockClear();
        reminder.dispose.mockClear();
        bangumiView.openBangumi.mockClear();
    });

    it("registers every command id", async () => {
        const { activate } = await loadExtension();

        activate(makeContext());

        const registered = vi
            .mocked(vscode.commands.registerCommand)
            .mock.calls.map(([id]) => id);

        expect(registered.sort()).toEqual([...COMMAND_IDS].sort());
    });

    it("pushes every disposable, including the reminder, into the subscriptions", async () => {
        const { activate } = await loadExtension();
        const context = makeContext();

        activate(context);

        expect(context.subscriptions).toHaveLength(COMMAND_IDS.length + 1);
        expect(context.subscriptions).toContain(reminder);
    });

    it("passes a callable handler for each command", async () => {
        const { activate } = await loadExtension();

        activate(makeContext());

        for (const [, handler] of vi.mocked(vscode.commands.registerCommand)
            .mock.calls) {
            expect(typeof handler).toBe("function");
        }
    });

    it("forwards a command invocation to the matching view", async () => {
        const { activate } = await loadExtension();

        activate(makeContext());
        const entry = vi
            .mocked(vscode.commands.registerCommand)
            .mock.calls.find(([id]) => "openBangumi" === id);

        entry?.[1]();

        expect(bangumiView.openBangumi).toHaveBeenCalledTimes(1);
    });

    it("forwards the index command", async () => {
        const { activate } = await loadExtension();

        activate(makeContext());
        const entry = vi
            .mocked(vscode.commands.registerCommand)
            .mock.calls.find(([id]) => "index" === id);

        entry?.[1]();

        expect(indexCommand.openIndex).toHaveBeenCalledTimes(1);
    });

    it("starts the reminder, which owns its own settings check", async () => {
        const { activate } = await loadExtension();

        activate(makeContext());

        expect(reminder.start).toHaveBeenCalledTimes(1);
    });

    it("builds one session even when activated twice", async () => {
        const { activate } = await loadExtension();

        activate(makeContext());
        activate(makeContext());

        expect(reminder.start).toHaveBeenCalledTimes(1);
    });

    it("keeps following the setting even when it starts disabled", async () => {
        /* 提醒必须保持订阅，之后重新开启设置才能生效。 */
        const { activate } = await loadExtension();

        activate(makeContext());

        expect(reminder.start).toHaveBeenCalledTimes(1);
    });
});

describe("deactivate", () => {
    it("releases the reminder", async () => {
        const { activate, deactivate } = await loadExtension();

        activate(makeContext());
        deactivate();

        expect(reminder.dispose).toHaveBeenCalledTimes(1);
    });

    it("survives deactivation without an activation", async () => {
        const { deactivate } = await loadExtension();

        expect(() => deactivate()).not.toThrow();
    });
});
