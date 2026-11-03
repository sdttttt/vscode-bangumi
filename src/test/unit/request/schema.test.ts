import { describe, expect, it } from "vitest";
import {
    BangumisResponse,
    BiliResponse,
    isSuccess,
    isValidBangumisRequest,
} from "@/request/bilibili/schema";
import { isValidCalendar } from "@/request/bgmtv/schema";
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

    it.each([[null], [undefined]])("rejects %j without throwing", res => {
        expect(isSuccess(res as unknown as BiliResponse)).toBe(false);
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

    it("rejects a successful response without a data field", () => {
        expect(
            isValidBangumisRequest({
                code: 0,
                message: "success",
            } as BangumisResponse)
        ).toBe(false);
    });

    it("rejects a response whose data is null without throwing", () => {
        expect(
            isValidBangumisRequest({
                code: 0,
                message: "success",
                data: null,
            } as unknown as BangumisResponse)
        ).toBe(false);
    });

    it("rejects a null response without throwing", () => {
        expect(
            isValidBangumisRequest(null as unknown as BangumisResponse)
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

    it("rejects a day without a weekday", () => {
        const day = bgmCalendarDay();
        delete (day as { weekday?: unknown }).weekday;

        expect(isValidCalendar([day])).toBe(false);
    });

    it("rejects a weekday without a numeric id", () => {
        const day = bgmCalendarDay();
        (day.weekday as { id?: unknown }).id = undefined;

        expect(isValidCalendar([day])).toBe(false);
    });

    it("skips null entries while looking for a usable day", () => {
        expect(isValidCalendar([null, bgmCalendarDay()])).toBe(true);
        expect(isValidCalendar([null, undefined])).toBe(false);
    });
});
