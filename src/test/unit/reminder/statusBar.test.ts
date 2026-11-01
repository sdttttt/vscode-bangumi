import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import type { ScheduleEvent } from "@/reminder/schedule";
import { useStatusBar } from "@/reminder/statusBar";

/**
 * 2026-11-01 12:00 UTC+8，渲染状态栏的时刻。
 *
 * @author sdttttt
 */
const NOW = Date.UTC(2026, 10, 1, 4, 0);

/**
 * 事件替身。
 *
 * @author sdttttt
 */
function event(pubTime: string, titles: Array<string>): ScheduleEvent {
    return { at: 1, pubTs: NOW, pubTime, titles };
}

/**
 * 装入 `vscode` 桩的状态栏替身。
 *
 * @author sdttttt
 */
function stubItem() {
    const item = {
        text: "",
        tooltip: undefined as string | undefined,
        name: undefined as string | undefined,
        command: undefined as string | undefined,
        accessibilityInformation: undefined as unknown,
        show: vi.fn(),
        hide: vi.fn(),
        dispose: vi.fn(),
    };
    vi.mocked(vscode.window.createStatusBarItem).mockReturnValue(item as never);
    return item;
}

describe("useStatusBar", () => {
    let item: ReturnType<typeof stubItem>;

    beforeEach(() => {
        item = stubItem();
    });

    it("creates the entry lazily", () => {
        const statusBar = useStatusBar("weekBangumi");

        expect(vscode.window.createStatusBarItem).not.toHaveBeenCalled();
        statusBar.dispose();
    });

    it("renders the next event and shows the entry once", () => {
        const statusBar = useStatusBar("weekBangumi");
        const next = event("20:00", ["甲"]);

        statusBar.show([next], NOW);
        statusBar.show([next], NOW);

        expect(item.text).toBe("$(clock) 20:00 甲");
        expect(item.command).toBe("weekBangumi");
        expect(item.show).toHaveBeenCalledTimes(1);
        statusBar.dispose();
    });

    it("lists the following events in the tooltip", () => {
        const statusBar = useStatusBar("weekBangumi");
        const next = event("20:00", ["甲"]);

        statusBar.show(
            [next, event("21:00", ["乙"]), event("22:00", ["丙"])],
            NOW
        );

        expect(item.tooltip).toBe("20:00 《甲》\n21:00 《乙》\n22:00 《丙》");
        statusBar.dispose();
    });

    it("hides the entry when nothing is coming up", () => {
        const statusBar = useStatusBar("weekBangumi");

        statusBar.show([event("20:00", ["甲"])], NOW);
        statusBar.show([], NOW);

        expect(item.hide).toHaveBeenCalledTimes(1);
        statusBar.dispose();
    });

    it("survives hiding before the entry exists", () => {
        const statusBar = useStatusBar("weekBangumi");

        expect(() => statusBar.hide()).not.toThrow();
    });

    it("releases the entry on dispose", () => {
        const statusBar = useStatusBar("weekBangumi");
        const next = event("20:00", ["甲"]);

        statusBar.show([next], NOW);
        statusBar.dispose();

        expect(item.dispose).toHaveBeenCalledTimes(1);
    });
});

describe("useStatusBar summary", () => {
    it("renders the today overview instead of an event", () => {
        const item = stubItem();
        const statusBar = useStatusBar("weekBangumi");

        statusBar.showSummary({ date: "10-31", titles: ["甲", "乙"] });

        expect(item.text).toBe("$(calendar) 今日 2部番");
        expect(item.tooltip).toBe("今日（10-31）\n《甲》、《乙》");
        expect(item.show).toHaveBeenCalledTimes(1);
        statusBar.dispose();
    });

    it("switches an already visible entry to the overview", () => {
        const item = stubItem();
        const statusBar = useStatusBar("weekBangumi");

        statusBar.show([event("20:00", ["甲"])], NOW);
        statusBar.showSummary({ date: "10-31", titles: ["乙"] });

        expect(item.text).toBe("$(calendar) 今日 乙");
        /* 条目已经在展示，不必再调用一次 show。 */
        expect(item.show).toHaveBeenCalledTimes(1);
        statusBar.dispose();
    });

    it("gives the overview its own accessible label", () => {
        const item = stubItem();
        const statusBar = useStatusBar("weekBangumi");

        statusBar.showSummary({ date: "10-31", titles: ["甲"] });

        expect((item.accessibilityInformation as { label: string }).label).toBe(
            "今日（10-31）有 1 部番剧更新：《甲》"
        );
        statusBar.dispose();
    });
});

describe("useStatusBar tooltip", () => {
    it("lists every title of a group, unlike the entry", () => {
        const item = stubItem();
        const statusBar = useStatusBar("weekBangumi");
        const next = event("20:00", ["甲", "乙"]);

        statusBar.show([next], NOW);

        expect(item.text).toBe("$(clock) 20:00 2部番");
        expect(item.tooltip).toBe("20:00 《甲》、《乙》");
        statusBar.dispose();
    });

    it("marks the events that happen tomorrow", () => {
        const item = stubItem();
        const statusBar = useStatusBar("weekBangumi");
        const tomorrow = {
            at: 1,
            pubTs: NOW + 24 * 60 * 60 * 1000,
            pubTime: "09:00",
            titles: ["甲"],
        };

        statusBar.show([tomorrow], NOW);

        expect(item.text).toBe("$(clock) 明日 09:00 甲");
        expect(item.tooltip).toBe("明日 09:00 《甲》");
        statusBar.dispose();
    });
});
