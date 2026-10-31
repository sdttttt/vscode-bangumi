// bilibili API => Week Bangumi
export const BANGUMI_WEEK =
    "https://bangumi.bilibili.com/web_api/timeline_global";

// bilibili API => Base url of show all Bangumi
const BANGUMI_SHOW = "https://api.bilibili.com/pgc/season/index/result?";

/**
 * Filters of the bangumi index request.
 *
 * Every value travels to the API verbatim, so callers that need an escaped
 * value (a year range, a list of area ids) encode it themselves.
 *
 * @author sdttttt
 */
export interface BangumiQuery {
    readonly seasonVersion: string;
    readonly area: string;
    readonly isFinish: string;
    readonly copyright: string;
    readonly seasonStatus: string;
    readonly seasonMonth: string;
    readonly year: string;
    readonly styleId: string;
    readonly order: string;
    readonly st: string;
    readonly sort: string;
    readonly seasonType: string;
    readonly pagesize: string;
    readonly type: string;
}

/**
 * The unfiltered query.
 *
 * @author sdttttt
 */
export const DEFAULT_QUERY: BangumiQuery = Object.freeze({
    seasonVersion: "-1",
    area: "-1",
    isFinish: "-1",
    copyright: "-1",
    seasonStatus: "-1",
    seasonMonth: "-1",
    year: "-1",
    styleId: "-1",
    order: "3",
    st: "1",
    sort: "0",
    seasonType: "1",
    pagesize: "20",
    type: "1",
});

/**
 * Builds the request url of one page of the bangumi index.
 *
 * The parameters are concatenated instead of being handed to `URLSearchParams`
 * so the pre-encoded values (`%5B2020%2C2021%29`) reach the API untouched.
 *
 * @param query filters of the request
 * @param page page number, starting at 1
 * @author sdttttt
 */
export function buildBangumiUrl(query: BangumiQuery, page: number): string {
    const parameters: Array<readonly [string, string]> = [
        ["season_version", query.seasonVersion],
        ["area", query.area],
        ["is_finish", query.isFinish],
        ["copyright", query.copyright],
        ["season_status", query.seasonStatus],
        ["season_month", query.seasonMonth],
        ["year", query.year],
        ["style_id", query.styleId],
        ["order", query.order],
        ["st", query.st],
        ["sort", query.sort],
        ["page", String(page)],
        ["season_type", query.seasonType],
        ["pagesize", query.pagesize],
        ["type", query.type],
    ];

    return `${BANGUMI_SHOW}${parameters
        .map(([key, value]) => `${key}=${value}`)
        .join("&")}`;
}
