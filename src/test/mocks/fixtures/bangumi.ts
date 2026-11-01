import type { Bangumi, BangumisData } from "@/request/bilibili/schema";

/**
 * 一条已完结、带徽标的番剧数据。
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
 * `/pgc/season/index/result` 返回的一页番剧结果。
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
