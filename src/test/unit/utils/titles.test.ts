import { describe, expect, it } from "vitest";
import { describeTitles } from "@/utils/titles";

describe("describeTitles", () => {
    it("quotes a single title", () => {
        expect(describeTitles(["甲"])).toBe("《甲》");
    });

    it("joins up to three titles", () => {
        expect(describeTitles(["甲", "乙", "丙"])).toBe(
            "《甲》、《乙》、《丙》"
        );
    });

    it("collapses the rest into a count", () => {
        expect(describeTitles(["甲", "乙", "丙", "丁", "戊"])).toBe(
            "《甲》、《乙》、《丙》等 5 部"
        );
    });

    it("returns an empty string without titles", () => {
        expect(describeTitles([])).toBe("");
    });
});
