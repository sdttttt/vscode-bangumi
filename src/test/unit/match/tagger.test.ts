import { describe, expect, it } from "vitest";
import Tagger from "@/match/tagger";

describe("Tagger", () => {
    it("exposes the assigned tag map", () => {
        const tags = new Map([["类型", "1"]]);

        Tagger.tags = tags;

        expect(Tagger.tags).toBe(tags);

        Tagger.clear();
    });

    it("drops every tag on clear", () => {
        Tagger.tags = new Map([["类型", "1"]]);

        Tagger.clear();

        expect(Tagger.tags.size).toBe(0);
    });
});
