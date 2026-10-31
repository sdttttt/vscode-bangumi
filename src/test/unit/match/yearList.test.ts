import { beforeEach, describe, expect, it, vi } from "vitest";

import { decodeYear } from "@/match/yearList";
import YearList from "@/match/yearList";
import { useFilterMenu } from "@/match/indexList";
import { useAppState, type AppStore } from "@/state/app";
import { createSettingsStub, type SettingsStub } from "@/test/mocks/settings";
import {
    createCommandsStub,
    createNotifierStub,
    type CommandsStub,
    type NotifierStub,
} from "@/test/mocks/ports";

/**
 * Runs the year filter with the given quick pick answer.
 *
 * @author sdttttt
 */
interface Harness {
    readonly state: AppStore;
    readonly settings: SettingsStub;
    readonly notifier: NotifierStub;
    readonly commands: CommandsStub;
    readonly menu: ReturnType<typeof useFilterMenu>;
}

function harness(): Harness {
    const state = useAppState();
    const settings = createSettingsStub({
        "bangumiOpen.DisplayIndexTags": true,
    });
    const notifier = createNotifierStub();
    const commands = createCommandsStub();
    const menu = useFilterMenu({
        state,
        settings,
        notifier: notifier.notifier,
        commands: commands.commands,
    });

    return { state, settings, notifier, commands, menu };
}

async function pick(h: Harness, choice: string): Promise<void> {
    h.notifier.pick.mockResolvedValue(choice);

    h.menu.open(YearList);

    await vi.waitFor(() => {
        expect(h.commands.execute).toHaveBeenCalled();
    });
}

describe("decodeYear", () => {
    it.each([
        ["2020", "[2020,2021)"],
        ["90年代", "[1990,2000)"],
        ["80年代", "[1980,1990)"],
        ["很久很久以前", "[,1980)"],
        ["2010-2014", "[2010,2015)"],
        ["2005-2009", "[2005,2010)"],
        ["2000-2004", "[2000,2005)"],
    ])("encodes %s as the year range %s", (choice, expected) => {
        expect(decodeYear(choice)).toBe(encodeURI(expected));
    });

    it("is pure", () => {
        expect(decodeYear("2020")).toBe(decodeYear("2020"));
    });
});

describe("year filter", () => {
    let h: Harness;

    beforeEach(() => {
        h = harness();
    });

    it.each([
        ["2020", "[2020,2021)"],
        ["90年代", "[1990,2000)"],
        ["80年代", "[1980,1990)"],
        ["很久很久以前", "[,1980)"],
        ["2010-2014", "[2010,2015)"],
        ["2005-2009", "[2005,2010)"],
    ])("writes %s into the year parameter", async (choice, expected) => {
        await pick(h, choice);

        expect(h.state.getQuery().year).toBe(encodeURI(expected));
    });

    it("keeps the other filters untouched", async () => {
        h.state.setQuery({ area: "2" });

        await pick(h, "2020");

        expect(h.state.getQuery().area).toBe("2");
    });

    it("opens the bangumi view after a choice is made", async () => {
        await pick(h, "2020");

        expect(h.commands.execute).toHaveBeenCalledWith("openBangumi");
    });

    it("does nothing when the quick pick is dismissed", async () => {
        h.notifier.pick.mockResolvedValue(undefined);

        h.menu.open(YearList);
        await vi.waitFor(() => {
            expect(h.notifier.pick).toHaveBeenCalled();
        });
        await Promise.resolve();

        expect(h.state.getQuery().year).toBe("-1");
        expect(h.commands.execute).not.toHaveBeenCalled();
    });
});
