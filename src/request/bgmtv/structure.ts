/**
 * Bangumi（bgm.tv）的响应结构。
 *
 * 与 B 站不同，每日放送接口没有 `code` / `message` 包装，而是直接返回七天的数组；
 * 它也不提供播出时刻与集数进度，只有首播日期与星期。
 *
 * @author sdttttt
 */

/**
 * 每日放送中的一天。
 *
 * @export
 * @interface BgmCalendarDay
 * @author sdttttt
 */
export interface BgmCalendarDay {
    weekday: BgmWeekday;
    items: Array<BgmSubject>;
}

/**
 * Bangumi 的星期信息。
 *
 * @export
 * @interface BgmWeekday
 * @author sdttttt
 */
export interface BgmWeekday {
    cn: string;
    en: string;
    /** 1 为周一，7 为周日，与 `BgmSubject.air_weekday` 一致。 */
    id: number;
    ja: string;
}

/**
 * 每日放送中的单部作品。
 *
 * 接口返回的图片与页面地址都是 `http://`，使用前必须升级为 https：
 * Webview 的内容安全策略只放行 https 图片。
 *
 * @export
 * @interface BgmSubject
 * @author sdttttt
 */
export interface BgmSubject {
    /** 首播日期，`YYYY-MM-DD`。 */
    air_date: string;
    air_weekday: number;
    /** 部分条目没有封面，接口会返回 `null`。 */
    images: BgmImages | null;
    id: number;
    /** 原名，通常是日文名。 */
    name: string;
    /** 中文名，可能为空串。 */
    name_cn: string;
    /** 部分条目没有评分。 */
    rating?: BgmRating;
    /** 2 为动画，6 为三次元。 */
    type: number;
    url: string;
}

/**
 * Bangumi 的评分。
 *
 * @export
 * @interface BgmRating
 * @author sdttttt
 */
export interface BgmRating {
    /** 0 表示还没有人评分。 */
    score: number;
    total: number;
}

/**
 * Bangumi 作品的封面地址组，从大到小。
 *
 * @export
 * @interface BgmImages
 * @author sdttttt
 */
export interface BgmImages {
    common: string;
    grid: string;
    large: string;
    medium: string;
    small: string;
}

/**
 * 每日放送是否为可用数据。
 *
 * 接口没有响应包装，因此只检查是否至少有一天带条目。
 *
 * @param days 每日放送的原始响应
 * @returns 至少有一天包含番剧时返回 true
 * @author sdttttt
 */
export function isValidCalendar(days: unknown): days is Array<BgmCalendarDay> {
    if (!Array.isArray(days)) {
        return false;
    }

    return days.some(
        day =>
            undefined !== day &&
            null !== day &&
            Array.isArray((day as BgmCalendarDay).items) &&
            0 < (day as BgmCalendarDay).items.length
    );
}
