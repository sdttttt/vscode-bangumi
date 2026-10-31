import type { Bangumi, BangumisData } from "@/request/structure";

/**
 * A finished bangumi entry with a badge.
 *
 * @author sdttttt
 */
export const bangumi = (overrides: Partial<Bangumi> = {}): Bangumi => ({
    badge: "会员专享",
    cover: "https://i0.hdslb.com/bfs/cover/a.jpg",
    index_show: "全12话",
    is_finish: 1,
    link: "https://www.bilibili.com/bangumi/play/ss1",
    order: "1.2万追番",
    title: "测试番剧",
    ...overrides,
});

/**
 * A page of bangumi results as returned by `/pgc/season/index/result`.
 *
 * @author sdttttt
 */
export const bangumisData = (
    overrides: Partial<BangumisData> = {}
): BangumisData => ({
    has_next: 1,
    list: [bangumi(), bangumi({ title: "第二部测试番剧", is_finish: 0 })],
    ...overrides,
});
