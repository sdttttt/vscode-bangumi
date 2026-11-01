import type { WBangumi, WeekBangumiData } from "@/request/bilibili/schema";

/**
 * 周番数据中的单部番剧。
 *
 * @author sdttttt
 */
export const wBangumi = (overrides: Partial<WBangumi> = {}): WBangumi => ({
    cover: "https://i0.hdslb.com/bfs/cover/a.jpg",
    favorites: 12345,
    is_published: 1,
    pub_index: "第3话",
    pub_time: "20:00",
    pub_ts: 1_700_000_000,
    square_cover: "https://i0.hdslb.com/bfs/cover/a-square.jpg",
    title: "测试番剧",
    url: "https://www.bilibili.com/bangumi/play/ss1",
    delay: 0,
    delay_index: "",
    delay_reason: "",
    ...overrides,
});

/**
 * 周番数据中的一天。
 *
 * @author sdttttt
 */
export const weekBangumiData = (
    overrides: Partial<WeekBangumiData> = {}
): WeekBangumiData => ({
    date: "1-1",
    date_ts: 1_700_000_000,
    day_of_week: 1,
    is_today: 0,
    seasons: [wBangumi()],
    ...overrides,
});

/**
 * 完整的七天周番数据。
 *
 * @author sdttttt
 */
export const weekBangumi = (): Array<WeekBangumiData> =>
    Array.from({ length: 7 }, (_, index) =>
        weekBangumiData({
            date: `1-${index + 1}`,
            day_of_week: index + 1,
            seasons: [wBangumi({ title: `第${index + 1}天的番剧` })],
        })
    );
