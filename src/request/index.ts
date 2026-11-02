import type { Availability } from "../availability";
import type { BilibiliApi } from "./bilibili/api";
import type { BangumisData } from "./bilibili/schema";
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
    /**
     * Bangumi 每日放送，收录更全但没有播出时刻。
     *
     * 该来源不可用时会回退到 B 站数据，返回的 `source` 因此可能是 `bilibili`。
     */
    getBgmTvSchedule(): Promise<WeeklySchedule | undefined>;
}

/**
 * 创建视图使用的番剧接口。
 *
 * 默认来源是 Bangumi，因此 {@link BangumiApi.getBgmTvSchedule} 承担回退：
 * 它不可用时改用 B 站数据，而不是让界面空着。反向不回退——B 站是用户显式
 * 选中的来源，偷偷换成另一份数据会让「为什么没有播出时刻」变得无从解释。
 *
 * 每次请求都会向可用性上报结果，两个来源都失败时由它统一安排恢复探测；
 * 这里不做任何记忆，来源恢复后下一次请求就会切回去。
 *
 * @param sources 两个来源的实现
 * @param availability 两个来源的可用性
 * @author sdttttt
 */
export function createBangumiApi(
    sources: Sources,
    availability: Availability
): BangumiApi {
    /**
     * 拉取 B 站周番并上报结果。
     */
    const loadBilibili = async (): Promise<WeeklySchedule | undefined> => {
        const data = await sources.bilibili.getWeekBangumi();
        availability.report("bilibili", undefined !== data);

        return data ? toScheduleFromBilibili(data) : undefined;
    };

    /**
     * 拉取 Bangumi 每日放送并上报结果。
     */
    const loadBgmTv = async (): Promise<WeeklySchedule | undefined> => {
        const days = await sources.bgmtv.getCalendar();
        availability.report("bangumi", undefined !== days);

        return days ? toScheduleFromBgmTv(days) : undefined;
    };

    return {
        getIndexPage: url => sources.bilibili.getAllBangumi(url),

        getBilibiliSchedule: loadBilibili,

        getBgmTvSchedule: async () => {
            const schedule = await loadBgmTv();

            /* Bangumi 可用就照常返回；只有它失败时才借用 B 站的数据。 */
            return schedule ?? (await loadBilibili());
        },
    };
}
