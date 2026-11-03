import { describe, expect, it } from "vitest";
import { isEmptyArray, isEmptyObject, toNumber } from "@/utils/type";

describe("toNumber", () => {
    it.each([
        ["1", 1],
        ["42", 42],
        ["-7", -7],
        ["0", 0],
        ["3.5", 3.5],
    ])("parses the numeric string %j", (input, expected) => {
        expect(toNumber(input)).toBe(expected);
    });

    it("returns 0 for undefined", () => {
        expect(toNumber(undefined)).toBe(0);
    });

    it("returns 0 for a non numeric string", () => {
        expect(toNumber("abc")).toBe(0);
    });

    it("returns 0 for an empty string", () => {
        expect(toNumber("")).toBe(0);
    });
});

describe("isEmptyArray", () => {
    it("reports an empty array as empty", () => {
        expect(isEmptyArray([])).toBe(true);
    });

    it("reports undefined as empty", () => {
        expect(isEmptyArray(undefined as unknown as Array<unknown>)).toBe(true);
    });

    it("reports a non empty array as not empty", () => {
        expect(isEmptyArray([1, 2, 3])).toBe(false);
    });
});

describe("isEmptyObject", () => {
    it("reports an object without own keys as empty", () => {
        expect(isEmptyObject({})).toBe(true);
    });

    it("reports an object with own keys as not empty", () => {
        expect(isEmptyObject({ a: 1 })).toBe(false);
    });

    it("treats an object whose keys are all undefined as not empty", () => {
        /* JSON.stringify 会丢弃 undefined 值，因此这里等价于空对象 */
        expect(isEmptyObject({ a: undefined })).toBe(true);
    });

    it("reports undefined as empty", () => {
        expect(isEmptyObject(undefined)).toBe(true);
    });

    it("reports null as empty", () => {
        expect(isEmptyObject(null)).toBe(true);
    });
});
