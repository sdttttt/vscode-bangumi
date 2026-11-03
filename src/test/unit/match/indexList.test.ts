import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildBangumiUrl, DEFAULT_QUERY } from "@/request/bilibili/query";
import { useAppState, type AppStore } from "@/state/app";
import { createFilterMenu, type FilterMenu } from "@/match/indexList";
import { MENU_LABELS, createIndexCommand } from "@/match/index";
import { valueFilter } from "@/match/filterSpec";
import AreaList from "@/match/areaList";
import StyleList from "@/match/styleList";
import SeasonVersionList from "@/match/seasonVersionList";
import { createSettingsStub, type SettingsStub } from "@/test/mocks/settings";
import {
    createCommandsStub,
    createNotifierStub,
    type CommandsStub,
    type NotifierStub,
} from "@/test/mocks/ports";

/**
 * 单个用例所需的全部内容，按组合根的方式装配。
 *
 * @author sdttttt
 */
interface Harness {
    readonly state: AppStore;
    readonly settings: SettingsStub;
    readonly notifier: NotifierStub;
    readonly commands: CommandsStub;
    readonly menu: FilterMenu;
}

/**
 * 构建一套拥有独立状态与替身的测试环境。
 *
 * @author sdttttt
 */
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

/**
 * 用一个给定的选择结果运行筛选菜单。
 *
 * @author sdttttt
 */
async function pickFrom(
    h: Harness,
    filter: Parameters<FilterMenu["open"]>[0],
    label: string
): Promise<void> {
    h.notifier.pick.mockResolvedValue(label);

    h.menu.open(filter);

    await vi.waitFor(() => {
        expect(h.notifier.pick).toHaveBeenCalled();
    });
    await Promise.resolve();
    await Promise.resolve();
}

/**
 * 用一个给定的选择结果运行索引菜单。
 *
 * @author sdttttt
 */
async function pickIndex(h: Harness, label: string): Promise<void> {
    h.notifier.pick.mockResolvedValue(label);

    createIndexCommand({
        state: h.state,
        menu: h.menu,
        notifier: h.notifier.notifier,
    }).openIndex();

    await vi.waitFor(() => {
        expect(h.notifier.pick).toHaveBeenCalledTimes(1);
    });
    await Promise.resolve();
    await Promise.resolve();
}

/**
 * 取出给定状态所生成地址中的某个查询参数。
 *
 * @author sdttttt
 */
function parameterOf(state: AppStore, name: string): string | null {
    const url = buildBangumiUrl(state.getQuery(), state.getPage());

    return new URLSearchParams(url.split("?")[1]).get(name);
}

describe("createIndexCommand", () => {
    let h: Harness;

    beforeEach(() => {
        h = harness();
    });

    it("offers every filter in menu order, with the restore entry last", async () => {
        h.notifier.pick.mockResolvedValue(undefined);

        createIndexCommand({
            state: h.state,
            menu: h.menu,
            notifier: h.notifier.notifier,
        }).openIndex();

        await vi.waitFor(() => {
            expect(h.notifier.pick).toHaveBeenCalledWith(MENU_LABELS);
        });
        expect(MENU_LABELS.at(-1)).toBe("(恢复默认)");
    });

    it("opens the year filter for 时间", async () => {
        h.notifier.pick
            .mockResolvedValueOnce("时间")
            .mockResolvedValueOnce("2020");

        createIndexCommand({
            state: h.state,
            menu: h.menu,
            notifier: h.notifier.notifier,
        }).openIndex();

        await vi.waitFor(() => {
            expect(h.state.getQuery().year).toBe(encodeURI("[2020,2021)"));
        });
    });

    it("opens the area filter for 地区", async () => {
        h.notifier.pick
            .mockResolvedValueOnce("地区")
            .mockResolvedValueOnce("日本");

        createIndexCommand({
            state: h.state,
            menu: h.menu,
            notifier: h.notifier.notifier,
        }).openIndex();

        await vi.waitFor(() => {
            expect(parameterOf(h.state, "area")).toBe("2");
        });
    });

    it("restores the default query and clears tags, keeping the page", async () => {
        h.state.setQuery({ area: "2" });
        h.state.setPage(5);

        await pickIndex(h, "(恢复默认)");

        expect(h.state.getQuery()).toEqual(DEFAULT_QUERY);
        expect(h.state.getPage()).toBe(5);
        expect(h.state.getTags().size).toBe(0);
    });

    it("warns about an unfinished option", async () => {
        await pickIndex(h, "未知选项");

        expect(h.notifier.info).toHaveBeenCalledWith(
            "抱歉，这个选项还在施工中"
        );
    });

    it("does nothing when the menu is dismissed", async () => {
        await pickIndex(h, undefined as never);

        expect(h.commands.execute).not.toHaveBeenCalled();
        expect(h.state.getQuery()).toEqual(DEFAULT_QUERY);
    });
});

describe("createFilterMenu", () => {
    let h: Harness;

    beforeEach(() => {
        h = harness();
    });

    it.each([
        [SeasonVersionList, "电影", "season_version", "2"],
        [AreaList, "日本", "area", "2"],
        [StyleList, "原创", "style_id", "10010"],
    ] as const)(
        "writes the selected value into the query",
        async (filter, choice, parameter, expected) => {
            await pickFrom(h, filter, choice);

            expect(parameterOf(h.state, parameter)).toBe(expected);
        }
    );

    it("records the chosen tag", async () => {
        await pickFrom(h, SeasonVersionList, "电影");

        expect([...h.state.getTags().values()]).toContain("电影");
    });

    it("opens the bangumi list after a choice", async () => {
        await pickFrom(h, SeasonVersionList, "电影");

        expect(h.commands.execute).toHaveBeenCalledWith("openBangumi");
    });

    it("shows the collected tags after a choice", async () => {
        await pickFrom(h, SeasonVersionList, "电影");

        expect(h.notifier.info).toHaveBeenCalledWith(
            expect.stringContaining("已选标签")
        );
    });

    it("lists every collected tag in the notification", async () => {
        await pickFrom(h, StyleList, "原创");
        await pickFrom(h, SeasonVersionList, "电影");

        expect(h.notifier.info).toHaveBeenLastCalledWith(
            expect.stringContaining("原创")
        );
        expect(h.notifier.info).toHaveBeenLastCalledWith(
            expect.stringContaining("电影")
        );
    });

    it("skips tag collection when tag display is disabled", async () => {
        h.settings.values["bangumiOpen.DisplayIndexTags"] = false;

        await pickFrom(h, SeasonVersionList, "电影");

        expect(h.state.getTags().size).toBe(0);
        expect(h.notifier.info).not.toHaveBeenCalled();
        expect(h.notifier.error).not.toHaveBeenCalled();
    });

    it("never uses the error channel for tag announcements", async () => {
        /*
         * L21（见 TODO.md）：「标签：默认」分支不可达——showTags 只在
         * 选择之后调用，而选择必然已记录标签。这里固定错误通道零参与，
         * 防止它被重新引入。
         */
        await pickFrom(h, SeasonVersionList, "电影");
        h.notifier.error.mockClear();

        h.menu.open(StyleList);
        await vi.waitFor(() => {
            expect(h.notifier.pick).toHaveBeenCalled();
        });

        expect(h.notifier.error).not.toHaveBeenCalled();
    });

    it("does nothing when the list is dismissed", async () => {
        h.notifier.pick.mockResolvedValue(undefined);

        h.menu.open(SeasonVersionList);
        await vi.waitFor(() => {
            expect(h.notifier.pick).toHaveBeenCalled();
        });
        await Promise.resolve();

        expect(h.state.getQuery()).toEqual(DEFAULT_QUERY);
        expect(h.commands.execute).not.toHaveBeenCalled();
    });
});

describe("valueFilter", () => {
    it("offers the labels in declaration order", () => {
        const filter = valueFilter(
            "标签",
            "Tag",
            [
                ["甲", "1"],
                ["乙", "2"],
            ],
            "area"
        );

        expect(filter.label).toBe("标签");
        expect(filter.tag).toBe("Tag");
        expect(filter.choices).toEqual(["甲", "乙"]);
    });

    it("maps a label onto its query patch", () => {
        const filter = valueFilter("标签", "Tag", [["甲", "1"]], "area");

        expect(filter.query("甲")).toEqual({ area: "1" });
    });

    it("returns an empty patch for an unknown label", () => {
        const filter = valueFilter("标签", "Tag", [["甲", "1"]], "area");

        expect(filter.query("丙")).toEqual({});
    });
});
