import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import {
    showBangumiUpdateRemind,
    showBeforeBangumiUpdateRemind,
} from "@/utils/display";

describe("showBangumiUpdateRemind", () => {
    beforeEach(() => {
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue(
            undefined
        );
        vi.mocked(vscode.commands.executeCommand).mockClear();
    });

    it("tells the user the bangumi is updated", () => {
        showBangumiUpdateRemind("咒术回战");

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "《咒术回战》 更新啦！🎉",
            "Open WeekBangumi"
        );
    });

    it("opens the weekly view when the action is chosen", async () => {
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue(
            "Open WeekBangumi" as never
        );

        showBangumiUpdateRemind("咒术回战");
        await vi.waitFor(() => {
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                "weekBangumi"
            );
        });
    });

    it("stays silent when the notification is dismissed", async () => {
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue(
            undefined
        );

        showBangumiUpdateRemind("咒术回战");
        await Promise.resolve();

        expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
    });
});

describe("showBeforeBangumiUpdateRemind", () => {
    it("mentions how many minutes are left", () => {
        showBeforeBangumiUpdateRemind("咒术回战", 5);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "《咒术回战》 还有5分钟就更新啦！ 🎉",
            "Open WeekBangumi"
        );
    });
});
