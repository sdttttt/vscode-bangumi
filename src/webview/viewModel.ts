import type { Bangumi, WeekBangumiData, WBangumi } from "../request/structure";
import { isCurrentDay } from "../utils/clock";
import { toWeekDay } from "../utils/strings";
import type { BangumiPayload, SeasonPayload, WeekDayPayload } from "./protocol";

/**
 * Number of leading days hidden when `bangumiOpen.DisplayHistory` is off.
 *
 * The weekly API returns the six past days first, so they are dropped unless
 * the user asked to see them.
 *
 * @author sdttttt
 */
export const HIDDEN_DAYS = 5;

/**
 * Converts one season entry into its render payload.
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
 * Converts the weekly schedule into render payloads.
 *
 * @param data the whole weekly schedule
 * @param displayHistory whether the past days must be rendered too
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
 * Converts the index list into render payloads.
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
