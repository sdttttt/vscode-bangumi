import { describe, expect, it } from "vitest";
import {
    isSuccess,
    isValidBangumisRequest,
} from "@/request/bilibili/structure";
import { isValidCalendar } from "@/request/bgmtv/structure";
import { bgmCalendar, bgmCalendarDay } from "@/test/mocks/fixtures/bgm";
import { bangumisData } from "@/test/mocks/fixtures/bangumi";

describe("isSuccess", () => {
    it("accepts code 0 with the success message", () => {
        expect(isSuccess({ code: 0, message: "success" })).toBe(true);
    });

    it.each([
        [0, "ok"],
        [-404, "success"],
        [1, "success"],
    ])("rejects code %i with message %j", (code, message) => {
        expect(isSuccess({ code, message })).toBe(false);
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

describe("isValidCalendar", () => {
    it("accepts a calendar with at least one item", () => {
        expect(isValidCalendar(bgmCalendar())).toBe(true);
    });

    it("rejects a calendar whose days are all empty", () => {
        expect(isValidCalendar([bgmCalendarDay({ items: [] })])).toBe(false);
    });

    it("rejects a value that is not an array", () => {
        expect(isValidCalendar(undefined)).toBe(false);
        expect(isValidCalendar(null)).toBe(false);
        expect(isValidCalendar({})).toBe(false);
    });

    it("rejects a day without an items array", () => {
        expect(
            isValidCalendar([{ weekday: { cn: "", en: "", id: 1, ja: "" } }])
        ).toBe(false);
    });
});
