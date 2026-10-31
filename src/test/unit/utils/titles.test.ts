import { describe, expect, it } from "vitest";
import {
    describeTitles,
    displayColumns,
    listTitles,
    truncateToColumns,
} from "@/utils/titles";

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

describe("displayColumns", () => {
    it("counts ASCII as one column", () => {
        expect(displayColumns("abc 12:00")).toBe(9);
    });

    it("counts CJK as two columns", () => {
        expect(displayColumns("甲")).toBe(2);
        expect(displayColumns("《甲》")).toBe(6);
    });

    it("counts an emoji as two columns", () => {
        expect(displayColumns("🎬")).toBe(2);
    });

    it("counts an empty string as zero", () => {
        expect(displayColumns("")).toBe(0);
    });
});

describe("truncateToColumns", () => {
    it("keeps text that already fits", () => {
        expect(truncateToColumns("短标题", 10)).toBe("短标题");
    });

    it("appends an ellipsis when truncating", () => {
        expect(truncateToColumns("一个特别特别特别长的番剧名称", 15)).toBe(
            "一个特别特别特…"
        );
    });

    it("never splits a surrogate pair", () => {
        const result = truncateToColumns("🎬🎬🎬🎬🎬🎬🎬🎬", 5);

        expect(result).toBe("🎬🎬…");
    });

    it("returns a lone ellipsis for a tiny budget", () => {
        expect(truncateToColumns("甲", 1)).toBe("…");
    });
});

describe("listTitles", () => {
    it("quotes every title", () => {
        expect(listTitles(["甲", "乙", "丙", "丁"])).toBe(
            "《甲》、《乙》、《丙》、《丁》"
        );
    });

    it("returns an empty string without titles", () => {
        expect(listTitles([])).toBe("");
    });
});
