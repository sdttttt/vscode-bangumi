import { beforeEach, describe, expect, it, vi } from "vitest";

import { decodeYear, buildYearChoices } from "@/match/yearList";
import YearList from "@/match/yearList";
import { createFilterMenu } from "@/match/indexList";
import { useAppState, type AppStore } from "@/state/app";
import { createSettingsStub, type SettingsStub } from "@/test/mocks/settings";
import {
    createCommandsStub,
    createNotifierStub,
    type CommandsStub,
    type NotifierStub,
} from "@/test/mocks/ports";

/**
 * 用给定的选择结果运行年份筛选。
 *
 * @author sdttttt
 */
interface Harness {
    readonly state: AppStore;
    readonly settings: SettingsStub;
    readonly notifier: NotifierStub;
    readonly commands: CommandsStub;
    readonly menu: ReturnType<typeof createFilterMenu>;
}

function harness(): Harness {
    const state = useAppState();
    const settings = createSettingsStub({
        "bangumiOpen.DisplayIndexTags": true,
    });
    const notifier = createNotifierStub();
    const commands = createCommandsStub();
    const menu = createFilterMenu({
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

describe("year choices", () => {
    it("offers the current UTC+8 year as a choice", () => {
        const currentYear = new Date(Date.now() + 8 * 60 * 60 * 1000)
            .getUTCFullYear()
            .toString();

        expect(YearList.choices).toContain(currentYear);
    });

    it.each([
        [
            /* 2026-11-03 12:00 UTC+8：个体年份向下对齐到区间档网格。 */
            Date.UTC(2026, 10, 3, 4, 0),
            [
                "2026",
                "2025",
                "2024",
                "2023",
                "2022",
                "2021",
                "2020",
                "2015-2019",
                "2010-2014",
                "2005-2009",
                "2000-2004",
                "90年代",
                "80年代",
                "很久很久以前",
            ],
        ],
        [
            /* 2030-06-01 08:00 UTC+8：恰好 6 个个体，多出一档 2020-2024。 */
            Date.UTC(2030, 5, 1, 0, 0),
            [
                "2030",
                "2029",
                "2028",
                "2027",
                "2026",
                "2025",
                "2020-2024",
                "2015-2019",
                "2010-2014",
                "2005-2009",
                "2000-2004",
                "90年代",
                "80年代",
                "很久很久以前",
            ],
        ],
        [
            /* 2029-06-01 08:00 UTC+8：个体延伸到 2020 补上与区间档之间的缝。 */
            Date.UTC(2029, 5, 1, 0, 0),
            [
                "2029",
                "2028",
                "2027",
                "2026",
                "2025",
                "2024",
                "2023",
                "2022",
                "2021",
                "2020",
                "2015-2019",
                "2010-2014",
                "2005-2009",
                "2000-2004",
                "90年代",
                "80年代",
                "很久很久以前",
            ],
        ],
    ])("builds the menu for the given moment", (epochMs, expected) => {
        expect(buildYearChoices(epochMs)).toEqual(expected);
    });
});

describe("year filter", () => {
    let h: Harness;

    beforeEach(() => {
        h = harness();
    });

    it.each([
        ["90年代", "[1990,2000)"],
        ["80年代", "[1980,1990)"],
        ["很久很久以前", "[,1980)"],
        ["2010-2014", "[2010,2015)"],
        ["2005-2009", "[2005,2010)"],
    ])("writes %s into the year parameter", async (choice, expected) => {
        await pick(h, choice);

        expect(h.state.getQuery().year).toBe(encodeURI(expected));
    });

    it("writes the current year into the year parameter", async () => {
        /* 菜单首项按构造就是今年，用它驱动避免用例随年份腐坏。 */
        const choice = YearList.choices[0];
        const year = Number(choice);

        await pick(h, choice);

        expect(h.state.getQuery().year).toBe(encodeURI(`[${year},${year + 1})`));
    });

    it("keeps the other filters untouched", async () => {
        h.state.setQuery({ area: "2" });

        await pick(h, YearList.choices[0]);

        expect(h.state.getQuery().area).toBe("2");
    });

    it("opens the bangumi view after a choice is made", async () => {
        await pick(h, YearList.choices[0]);

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
