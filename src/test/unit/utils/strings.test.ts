import { afterEach, describe, expect, it, vi } from "vitest";
import {
    numberOfStringPlus,
    randomInteger,
    toHttpsUrl,
    toWeekDay,
} from "@/utils/strings";

describe("toWeekDay", () => {
    it.each([
        [1, "星期一"],
        [2, "星期二"],
        [3, "星期三"],
        [4, "星期四"],
        [5, "星期五"],
        [6, "星期六"],
        [7, "星期日"],
    ])("maps day %i to %s", (day, expected) => {
        expect(toWeekDay(day)).toBe(expected);
    });

    it.each([0, 8, -1])(
        "returns an empty string for out of range day %i",
        day => {
            expect(toWeekDay(day)).toBe("");
        }
    );
});

describe("numberOfStringPlus", () => {
    it("adds to a numeric string", () => {
        expect(numberOfStringPlus("2024", 1)).toBe("2025");
    });

    it("treats a non numeric string as zero", () => {
        expect(numberOfStringPlus("abc", 2)).toBe("2");
    });
});

describe("randomInteger", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("maps Math.random into the half open range [min, max)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);
        expect(randomInteger(4, 15)).toBe(4);

        vi.spyOn(Math, "random").mockReturnValue(0.999);
        expect(randomInteger(4, 15)).toBe(14);
    });

    it("never produces the exclusive upper bound", () => {
        const values = new Set<number>();
        for (let i = 0; 2_000 > i; i += 1) {
            values.add(randomInteger(0, 2));
        }

        expect([...values].sort()).toEqual([0, 1]);
    });
});

describe("toHttpsUrl", () => {
    it("upgrades a plain http address", () => {
        expect(toHttpsUrl("http://bgm.tv/subject/1")).toBe(
            "https://bgm.tv/subject/1"
        );
    });

    it("keeps an https address untouched", () => {
        expect(toHttpsUrl("https://lain.bgm.tv/a.jpg")).toBe(
            "https://lain.bgm.tv/a.jpg"
        );
    });

    it("returns an empty string for a missing address", () => {
        expect(toHttpsUrl(null)).toBe("");
        expect(toHttpsUrl(undefined)).toBe("");
        expect(toHttpsUrl("")).toBe("");
    });
});
