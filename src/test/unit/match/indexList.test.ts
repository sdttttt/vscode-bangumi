import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";

vi.mock("@/configuration", () => ({
    isDisplayIndexTags: vi.fn(() => true),
}));

import { isDisplayIndexTags } from "@/configuration";
import { BangumiUrl } from "@/request/bangumiUrl";
import BangumisView from "@/views/bangumi";
import Tagger from "@/match/tagger";
import MainIndexList from "@/match/index";
import SeasonVersionList from "@/match/seasonVersionList";
import AreaList from "@/match/areaList";
import FinishList from "@/match/finishList";
import CopyRightList from "@/match/copyRightList";
import SeasonStatusList from "@/match/seasonStatusList";
import SeasonMonthList from "@/match/seasonMonthList";
import YearList from "@/match/yearList";
import StyleList from "@/match/styleList";

/**
 * Runs `openIndexList` with the given quick pick answer.
 *
 * @author sdttttt
 */
async function pick(
    subject: { openIndexList: () => void },
    choice: string
): Promise<void> {
    vi.mocked(vscode.window.showQuickPick).mockResolvedValue(choice as never);
    subject.openIndexList();
    await Promise.resolve();
    await Promise.resolve();
}

describe("MainIndexList", () => {
    beforeEach(() => {
        vi.mocked(isDisplayIndexTags).mockReturnValue(true);
        BangumisView.bangumiUrl.restoreDefault();
        Tagger.clear();
        vi.mocked(vscode.window.showInformationMessage).mockClear();
        vi.mocked(vscode.window.showQuickPick).mockReset();
    });

    it("opens the season version list for 类型", async () => {
        const spy = vi.spyOn(SeasonVersionList, "openIndexList");

        await pick(MainIndexList, "类型");

        expect(spy).toHaveBeenCalled();
    });

    it.each([
        ["地区", AreaList],
        ["状态", FinishList],
        ["版权", CopyRightList],
        ["付费", SeasonStatusList],
        ["季度", SeasonMonthList],
        ["时间", YearList],
        ["风格", StyleList],
    ] as const)(
        "opens the matching sub list for %s",
        async (label, subList) => {
            const spy = vi.spyOn(subList, "openIndexList");

            await pick(MainIndexList, label);

            expect(spy).toHaveBeenCalled();
        }
    );

    it("restores the default url and clears tags on (恢复默认)", async () => {
        const expected = new BangumiUrl().build().finalUrl;
        BangumisView.bangumiUrl.setArea("2");
        Tagger.tags = new Map([["Area", "2"]]);

        await pick(MainIndexList, "(恢复默认)");

        expect(BangumisView.bangumiUrl.build().finalUrl).toBe(expected);
        expect(Tagger.tags.size).toBe(0);
    });

    it("warns about an unfinished option", async () => {
        await pick(MainIndexList, "未知选项");

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "果咩,还在施工中"
        );
    });
});

describe("SimpleFinalIndexList subclasses", () => {
    beforeEach(() => {
        vi.mocked(isDisplayIndexTags).mockReturnValue(true);
        BangumisView.bangumiUrl.restoreDefault();
        Tagger.clear();
        vi.mocked(vscode.commands.executeCommand).mockClear();
        vi.mocked(vscode.window.showQuickPick).mockReset();
    });

    it.each([
        [SeasonVersionList, "电影", "season_version", "2"],
        [AreaList, "日本", "area", "2"],
        [FinishList, "完结", "is_finish", "1"],
        [CopyRightList, "独家", "copyright", "3"],
        [SeasonStatusList, "免费", "season_status", "1"],
        [SeasonMonthList, "一月", "season_month", "1"],
        [StyleList, "原创", "style_id", "10010"],
    ] as const)(
        "writes the selected value into the url",
        async (subject, choice, parameter, expected) => {
            await pick(subject, choice);

            const url = BangumisView.bangumiUrl.build().finalUrl;
            expect(new URLSearchParams(url.split("?")[1]).get(parameter)).toBe(
                expected
            );
        }
    );

    it("records the chosen tag", async () => {
        await pick(SeasonVersionList, "电影");

        expect([...Tagger.tags.values()]).toContain("电影");
    });

    it("shows the collected tags after a choice", async () => {
        await pick(SeasonVersionList, "电影");

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            expect.stringContaining("Tags:")
        );
    });

    it("lists every collected tag in the notification", async () => {
        await pick(StyleList, "原创");
        await pick(SeasonVersionList, "电影");

        expect(vscode.window.showInformationMessage).toHaveBeenLastCalledWith(
            expect.stringContaining("原创")
        );
        expect(vscode.window.showInformationMessage).toHaveBeenLastCalledWith(
            expect.stringContaining("电影")
        );
    });

    it("skips tag collection when tag display is disabled", async () => {
        vi.mocked(isDisplayIndexTags).mockReturnValue(false);

        await pick(SeasonVersionList, "电影");

        expect(Tagger.tags.size).toBe(0);
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });
});
