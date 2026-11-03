// bilibili 接口 => 周番数据
export const BANGUMI_WEEK =
    "https://bangumi.bilibili.com/web_api/timeline_global";

// bilibili 接口 => 番剧索引的基础地址
const BANGUMI_SHOW = "https://api.bilibili.com/pgc/season/index/result?";

/**
 * 番剧索引请求的筛选条件。
 *
 * 每个值都会原样发往接口，因此需要转义的值（年份区间、地区 id 列表）
 * 由调用方自行编码。
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
 * 不带任何筛选的 query。
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
 * 构建番剧索引某一页的请求地址。
 *
 * 参数直接拼接，而不是交给 `URLSearchParams`，这样已编码的值能原样到达
 * 接口。注意取值侧用的是 `encodeURI`：它只编码 `[`、` ` 等少数字符，
 * `,` 与 `)` 原样保留（例如 `%5B2020,2021)`），B 站两种形式都接受。
 *
 * @param query 请求的筛选条件
 * @param page 页码，从 1 开始
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
