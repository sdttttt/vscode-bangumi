import { afterEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import { isSuccess, isValidBangumisRequest } from "@/request/structure";
import { bangumisData } from "@/test/mocks/fixtures/bangumi";

describe("isSuccess", () => {
    afterEach(() => {
        vi.mocked(vscode.window.showInformationMessage).mockClear();
    });

    it("accepts code 0 with the success message", () => {
        expect(isSuccess({ code: 0, message: "success" })).toBe(true);
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });

    it.each([
        [0, "ok"],
        [-404, "success"],
        [1, "success"],
    ])("rejects code %i with message %j", (code, message) => {
        expect(isSuccess({ code, message })).toBe(false);
    });

    it("surfaces a message when the response is unsuccessful", () => {
        isSuccess({ code: -404, message: "boom" });

        expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
    });
});

describe("isValidBangumisRequest", () => {
    it("accepts a successful response carrying at least one bangumi", () => {
        expect(
            isValidBangumisRequest({
                code: 0,
                message: "success",
                data: bangumisData(),
            })
        ).toBe(true);
    });

    it("rejects an unsuccessful response", () => {
        expect(
            isValidBangumisRequest({
                code: -404,
                message: "boom",
                data: bangumisData(),
            })
        ).toBe(false);
    });

    it("rejects a successful response with an empty list", () => {
        expect(
            isValidBangumisRequest({
                code: 0,
                message: "success",
                data: bangumisData({ list: [] }),
            })
        ).toBe(false);
    });
});
