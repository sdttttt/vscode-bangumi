import type { BilibiliApi } from "./bilibili/api";
import type { BangumisData } from "./bilibili/structure";
import type { BgmTvApi } from "./bgmtv/api";
import {
    toScheduleFromBgmTv,
    toScheduleFromBilibili,
    type WeeklySchedule,
} from "./schedule";

/**
 * 两个来源的实现：由组合根建好后注入，视图与提醒因此各自只拿到需要的那一半。
 * 提醒直接消费 `bilibili`，不经过统一模型，也就不会丢掉 `pub_ts`。
 *
 * @export
 * @interface Sources
 * @author sdttttt
 */
export interface Sources {
    /** Bilibili 实现，同时提供索引与周番。 */
    readonly bilibili: BilibiliApi;
    /** Bangumi（bgm.tv）实现，只提供每日放送。 */
    readonly bgmtv: BgmTvApi;
}

/**
 * 视图使用的番剧接口。
 *
 * 方法按能力拆分而不是接收来源字符串：索引与提醒只有 B 站提供，
 * 写成两个独立方法后，「Bangumi 不能用于提醒」这件事由类型表达，而不是运行期分支。
 *
 * @export
 * @interface BangumiApi
 * @author sdttttt
 */
export interface BangumiApi {
    /** Bilibili 番剧索引的一页。 */
    getIndexPage(url: string): Promise<BangumisData | undefined>;
    /** Bilibili 周番，带播出时刻。 */
    getBilibiliSchedule(): Promise<WeeklySchedule | undefined>;
    /** Bangumi 每日放送，收录更全但没有播出时刻。 */
    getBgmTvSchedule(): Promise<WeeklySchedule | undefined>;
}

/**
 * 创建视图使用的番剧接口。
 *
 * @param sources 两个来源的实现
 * @author sdttttt
 */
export function useBangumiApi(sources: Sources): BangumiApi {
    return {
        getIndexPage: url => sources.bilibili.getAllBangumi(url),

        getBilibiliSchedule: async () => {
            const data = await sources.bilibili.getWeekBangumi();
            return data ? toScheduleFromBilibili(data) : undefined;
        },

        getBgmTvSchedule: async () => {
            const days = await sources.bgmtv.getCalendar();
            return days ? toScheduleFromBgmTv(days) : undefined;
        },
    };
}
