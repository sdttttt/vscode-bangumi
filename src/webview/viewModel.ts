import type { Bangumi, WeekBangumiData, WBangumi } from "../request/structure";
import { isCurrentDay } from "../utils/clock";
import { toWeekDay } from "../utils/strings";
import type { BangumiPayload, SeasonPayload, WeekDayPayload } from "./protocol";

/**
 * 裁掉今天之前的天，只留下从今天开始的日程。
 *
 * 过去的几天排在前面，用户没有要求查看时就不渲染。天数由接口决定，
 * 不能写死：接口返回的过去天数会变，写死会把昨天一并留下。
 *
 * @param data 完整的周番数据
 * @param now 当前时刻
 * @author sdttttt
 */
function fromToday(
    data: ReadonlyArray<WeekBangumiData>,
    now: number
): Array<WeekBangumiData> {
    const today = data.findIndex(day => isCurrentDay(day, now));

    /* 找不到今天时不做裁剪，宁可多显示一天，也不要留白。 */
    return 0 > today ? [...data] : data.slice(today);
}

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
    const days = displayHistory ? data : fromToday(data, now);

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
