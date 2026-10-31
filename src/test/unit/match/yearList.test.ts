import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";

vi.mock("@/views/bangumi", () => ({
    default: {
        bangumiUrl: {
            setYear: vi.fn(),
        },
    },
}));

vi.mock("@/configuration", () => ({
    isDisplayIndexTags: vi.fn(() => false),
}));

import BangumisView from "@/views/bangumi";
import YearList from "@/match/yearList";

const setYear = vi.mocked(BangumisView.bangumiUrl.setYear);

/**
 * Runs `openIndexList` and waits for the quick pick resolution.
 *
 * @author sdttttt
 */
async function pick(choice: string): Promise<void> {
    vi.mocked(vscode.window.showQuickPick).mockResolvedValue(choice as never);
    YearList.openIndexList();
    await vi.waitFor(() => {
        expect(setYear).toHaveBeenCalled();
    });
}

describe("YearList", () => {
    beforeEach(() => {
        setYear.mockClear();
        vi.mocked(vscode.commands.executeCommand).mockClear();
    });

    it.each([
        ["2020", "[2020,2021)"],
        ["90年代", "[1990,2000)"],
        ["80年代", "[1980,1990)"],
        ["很久很久以前", "[,1980)"],
        ["2010-2014", "[2010,2015)"],
        ["2005-2009", "[2005,2010)"],
    ])("encodes %s as the year range %s", async (choice, expected) => {
        await pick(choice);

        expect(setYear).toHaveBeenCalledWith(encodeURI(expected));
    });

    it("opens the bangumi view after a choice is made", async () => {
        await pick("2020");

        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            "openBangumi"
        );
    });

    it("does nothing when the quick pick is dismissed", async () => {
        vi.mocked(vscode.window.showQuickPick).mockResolvedValue(undefined);

        YearList.openIndexList();
        await Promise.resolve();

        expect(setYear).not.toHaveBeenCalled();
        expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
    });
});
