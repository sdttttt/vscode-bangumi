import { describe, expect, it } from "vitest";
import {
    BANGUMI_WEEK,
    buildBangumiUrl,
    DEFAULT_QUERY,
    type BangumiQuery,
} from "@/request/bilibili/query";

/**
 * 把已构建地址的查询参数提取为普通记录。
 *
 * @author sdttttt
 */
function queryOf(url: string): Record<string, string> {
    const [, search = ""] = url.split("?");

    return Object.fromEntries(new URLSearchParams(search));
}

describe("BANGUMI_WEEK", () => {
    it("exposes the weekly schedule endpoint", () => {
        expect(BANGUMI_WEEK).toBe(
            "https://bangumi.bilibili.com/web_api/timeline_global"
        );
    });
});

describe("buildBangumiUrl", () => {
    it("builds the documented default query", () => {
        const url = buildBangumiUrl(DEFAULT_QUERY, 1);

        expect(
            url.startsWith("https://api.bilibili.com/pgc/season/index/result?")
        ).toBe(true);
        expect(queryOf(url)).toEqual({
            season_version: "-1",
            area: "-1",
            is_finish: "-1",
            copyright: "-1",
            season_status: "-1",
            season_month: "-1",
            year: "-1",
            style_id: "-1",
            order: "3",
            st: "1",
            sort: "0",
            page: "1",
            season_type: "1",
            pagesize: "20",
            type: "1",
        });
    });

    it.each([
        ["seasonVersion", "season_version"],
        ["area", "area"],
        ["isFinish", "is_finish"],
        ["copyright", "copyright"],
        ["seasonStatus", "season_status"],
        ["seasonMonth", "season_month"],
        ["year", "year"],
        ["styleId", "style_id"],
        ["order", "order"],
        ["st", "st"],
        ["sort", "sort"],
        ["seasonType", "season_type"],
        ["pagesize", "pagesize"],
        ["type", "type"],
    ] as const)("writes %s into the %s parameter", (key, parameter) => {
        const query: BangumiQuery = { ...DEFAULT_QUERY, [key]: "42" };

        expect(queryOf(buildBangumiUrl(query, 1))[parameter]).toBe("42");
    });

    it("writes the page number as a string parameter", () => {
        const url = buildBangumiUrl(DEFAULT_QUERY, 7);

        expect(queryOf(url).page).toBe("7");
    });

    it("keeps the parameter order of the api", () => {
        const url = buildBangumiUrl(DEFAULT_QUERY, 1);
        const keys = [...new URLSearchParams(url.split("?")[1]).keys()];

        expect(keys).toEqual([
            "season_version",
            "area",
            "is_finish",
            "copyright",
            "season_status",
            "season_month",
            "year",
            "style_id",
            "order",
            "st",
            "sort",
            "page",
            "season_type",
            "pagesize",
            "type",
        ]);
    });

    it("leaves an encoded year range untouched", () => {
        const year = encodeURI("[2020,2021)");
        const query: BangumiQuery = { ...DEFAULT_QUERY, year };

        expect(buildBangumiUrl(query, 1)).toContain(`year=${year}`);
    });

    it("is pure: the same input always produces the same url", () => {
        const query: BangumiQuery = { ...DEFAULT_QUERY, area: "2" };

        expect(buildBangumiUrl(query, 3)).toBe(buildBangumiUrl(query, 3));
    });
});
