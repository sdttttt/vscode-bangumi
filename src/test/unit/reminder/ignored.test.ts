import { describe, expect, it } from "vitest";
import {
    addIgnored,
    IGNORED_RETENTION_MS,
    isIgnoredIn,
    normalizeIgnored,
    pruneIgnored,
    type IgnoredReminder,
} from "@/reminder/ignored";

/**
 * 固定的「现在」，避免用例依赖真实时钟。
 *
 * @author sdttttt
 */
const NOW = Date.parse("2026-10-31T12:00:00.000Z");

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 构造一条忽略记录。
 *
 * @author sdttttt
 */
function entry(daysAgo: number, title = "甲"): IgnoredReminder {
    return {
        title,
        ignoredAt: new Date(NOW - daysAgo * DAY_MS).toISOString(),
    };
}

describe("normalizeIgnored", () => {
    it("returns nothing for a missing setting", () => {
        expect(normalizeIgnored(undefined)).toEqual([]);
    });

    it("returns nothing for a non-array value", () => {
        expect(normalizeIgnored("甲")).toEqual([]);
        expect(normalizeIgnored({ title: "甲" })).toEqual([]);
    });

    it("keeps well formed entries", () => {
        const kept = entry(1);

        expect(normalizeIgnored([kept])).toEqual([kept]);
    });

    it("drops entries without a title", () => {
        expect(
            normalizeIgnored([{ ignoredAt: new Date(NOW).toISOString() }])
        ).toEqual([]);
    });

    it("drops entries with a blank title", () => {
        expect(
            normalizeIgnored([{ title: "   ", ignoredAt: entry(1).ignoredAt }])
        ).toEqual([]);
    });

    it("drops entries with an unparsable timestamp", () => {
        expect(normalizeIgnored([{ title: "甲", ignoredAt: "前天" }])).toEqual(
            []
        );
    });

    it("trims the title", () => {
        expect(
            normalizeIgnored([{ title: " 甲 ", ignoredAt: entry(1).ignoredAt }])
        ).toEqual([{ title: "甲", ignoredAt: entry(1).ignoredAt }]);
    });

    it("collapses duplicates onto the newest record", () => {
        const oldest = entry(200);
        const newest = entry(2);

        expect(normalizeIgnored([newest, oldest])).toEqual([newest]);
    });
});

describe("isIgnoredIn", () => {
    it("matches by exact title", () => {
        expect(isIgnoredIn([entry(1, "甲")], "甲")).toBe(true);
        expect(isIgnoredIn([entry(1, "甲")], "甲 第二季")).toBe(false);
    });

    it("is false for an empty list", () => {
        expect(isIgnoredIn([], "甲")).toBe(false);
    });
});

describe("addIgnored", () => {
    it("appends new titles with the current stamp", () => {
        expect(addIgnored([], ["甲"], NOW)).toEqual([
            { title: "甲", ignoredAt: new Date(NOW).toISOString() },
        ]);
    });

    it("refreshes the stamp of a known title without duplicating it", () => {
        const before = addIgnored([], ["甲"], NOW - DAY_MS);
        const after = addIgnored(before, ["甲"], NOW);

        expect(after).toEqual([entry(0, "甲")]);
    });

    it("keeps the order of the existing list", () => {
        const before = [entry(1, "甲"), entry(1, "乙")];
        const after = addIgnored(before, ["丙"], NOW);

        expect(after.map(item => item.title)).toEqual(["甲", "乙", "丙"]);
    });
});

describe("pruneIgnored", () => {
    it("keeps a fresh record", () => {
        const kept = entry(10);

        expect(pruneIgnored([kept], NOW)).toEqual({
            kept: [kept],
            changed: false,
        });
    });

    it("drops a record older than the retention window", () => {
        const stale = entry(200);
        const fresh = entry(1);

        expect(pruneIgnored([stale, fresh], NOW)).toEqual({
            kept: [fresh],
            changed: true,
        });
    });

    it("keeps a record right at the boundary", () => {
        const boundary = entry(IGNORED_RETENTION_MS / DAY_MS);

        expect(pruneIgnored([boundary], NOW).kept).toEqual([boundary]);
    });

    it("drops a record an hour past the boundary", () => {
        const stale: IgnoredReminder = {
            title: "甲",
            ignoredAt: new Date(
                NOW - IGNORED_RETENTION_MS - 60 * 60 * 1000
            ).toISOString(),
        };

        expect(pruneIgnored([stale], NOW).kept).toEqual([]);
    });

    it("reports a change when the raw value was dirty", () => {
        expect(pruneIgnored([{ title: "甲" }], NOW)).toEqual({
            kept: [],
            changed: true,
        });
    });

    it("reports a change when duplicates were collapsed", () => {
        const result = pruneIgnored([entry(3, "甲"), entry(2, "甲")], NOW);

        expect(result.kept).toEqual([entry(2, "甲")]);
        expect(result.changed).toBe(true);
    });

    it("reports no change for a missing setting", () => {
        expect(pruneIgnored(undefined, NOW)).toEqual({
            kept: [],
            changed: false,
        });
    });

    it("accepts a custom retention window", () => {
        const kept = entry(2);

        expect(pruneIgnored([kept], NOW, DAY_MS).kept).toEqual([]);
    });
});
