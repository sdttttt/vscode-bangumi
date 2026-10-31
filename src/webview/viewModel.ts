import type { Bangumi, WeekBangumiData, WBangumi } from "../request/structure";
import { isCurrentDay } from "../utils/clock";
import { toWeekDay } from "../utils/strings";
import type { BangumiPayload, SeasonPayload, WeekDayPayload } from "./protocol";

/**
 * `bangumiOpen.DisplayHistory` 关闭时，开头隐藏的天数。
 *
 * 周番接口会把过去的六天排在前面，用户没有要求查看时就把它们裁掉。
 *
 * @author sdttttt
 */
export const HIDDEN_DAYS = 5;

/**
 * 把单部番剧转换为渲染载荷。
 *
 * @author sdttttt
 */
export function toSeasonPayload(season: WBangumi): SeasonPayload {
    return {
        cover: season.square_cover,
        delay: 1 === season.delay,
        delayIndex: season.delay_index,
        delayReason: season.delay_reason,
        pubIndex: season.pub_index,
        pubTime: season.pub_time,
        title: season.title,
        url: season.url,
    };
}

/**
 * 把周番数据转换为渲染载荷。
 *
 * @param data 完整的周番数据
 * @param displayHistory 是否也渲染过去的几天
 * @author sdttttt
 */
export function toWeekDayPayloads(
    data: Array<WeekBangumiData>,
    displayHistory: boolean,
    now: number = Date.now()
): Array<WeekDayPayload> {
    const days = displayHistory ? data : data.slice(HIDDEN_DAYS);

    return days.map(day => ({
        date: day.date,
        dayOfWeek: day.day_of_week,
        label: toWeekDay(day.day_of_week),
        isToday: isCurrentDay(day, now),
        seasons: day.seasons.map(toSeasonPayload),
    }));
}

/**
 * 把索引列表转换为渲染载荷。
 *
 * @author sdttttt
 */
export function toBangumiPayloads(
    bangumis: Array<Bangumi>
): Array<BangumiPayload> {
    return bangumis.map(bangumi => ({
        badge: bangumi.badge,
        cover: bangumi.cover,
        finish: 1 === bangumi.is_finish,
        indexShow: bangumi.index_show,
        link: bangumi.link,
        order: bangumi.order,
        title: bangumi.title,
    }));
}
