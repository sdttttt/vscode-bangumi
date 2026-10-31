import { describe, expect, it } from "vitest";
import { BangumiUrl, BANGUMI_WEEK } from "@/request/bangumiUrl";

/**
 * Extracts the query parameters of a built url as a plain record.
 *
 * @author sdttttt
 */
function queryOf(url: string): Record<string, string> {
    const [, search = ""] = url.split("?");

    return Object.fromEntries(new URLSearchParams(search));
}

describe("BangumiUrl", () => {
    it("exposes the weekly schedule endpoint", () => {
        expect(BANGUMI_WEEK).toBe(
            "https://bangumi.bilibili.com/web_api/timeline_global"
        );
    });

    it("builds the documented default query", () => {
        const url = new BangumiUrl().build().finalUrl;

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

    it("returns the same instance from every setter so calls can be chained", () => {
        const builder = new BangumiUrl();

        expect(builder.setArea("2")).toBe(builder);
        expect(builder.setPage(3)).toBe(builder);
    });

    it.each([
        ["setSeasonVersion", "1", "season_version"],
        ["setArea", "2", "area"],
        ["setIsFinish", "0", "is_finish"],
        ["setCopyright", "3", "copyright"],
        ["setSeasonStatus", "2", "season_status"],
        ["setSeasonMonth", "4", "season_month"],
        ["setYear", "2025", "year"],
        ["setStyleId", "100", "style_id"],
        ["setSt", "2", "st"],
        ["setSort", "1", "sort"],
        ["setSeasonType", "4", "season_type"],
        ["setPageSize", "50", "pagesize"],
        ["setType", "2", "type"],
    ] as const)(
        "%s writes the %s value into the %s parameter",
        (setter, value, parameter) => {
            const builder = new BangumiUrl();
            builder[setter](value);

            expect(queryOf(builder.build().finalUrl)[parameter]).toBe(value);
        }
    );

    it("writes the page number as a string parameter", () => {
        const url = new BangumiUrl().setPage(7).build().finalUrl;

        expect(queryOf(url).page).toBe("7");
    });

    it("does not accumulate parameters across rebuilds", () => {
        const builder = new BangumiUrl().setPage(2);
        const first = builder.build().finalUrl;
        const second = builder.build().finalUrl;

        expect(second).toBe(first);
    });

    it("restores every default after restoreDefault", () => {
        const builder = new BangumiUrl()
            .setArea("2")
            .setYear("2020")
            .setPage(5)
            .setStyleId("100");

        builder.restoreDefault();

        const defaults = new BangumiUrl().build().finalUrl;
        expect(builder.build().finalUrl).toBe(defaults);
    });

    it("exposes the url built by the last build call", () => {
        const builder = new BangumiUrl().setPage(3);
        expect(builder.finalUrl).toBe(
            "https://api.bilibili.com/pgc/season/index/result?"
        );

        builder.build();
        expect(queryOf(builder.finalUrl).page).toBe("3");
    });
});
