/**
 * B 站按中国标准时间（UTC+8）返回周番数据。
 *
 * 因此日界必须按这个固定偏移计算，而不是按用户本地时区；否则位于 UTC 以西的
 * 用户会看到昨天的条目被标记为今天，提醒也就不再发声。
 *
 * @author sdttttt
 */
export const BILIBILI_OFFSET_MS = 8 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 周番数据中的一天，仅保留日期运算需要的字段。
 *
 * @author sdttttt
 */
export interface DayStamp {
    readonly date: string;
    readonly date_ts: number;
    readonly is_today: number;
}

/**
 * 把毫秒时间戳平移到 UTC+8 的墙上时钟。
 *
 * @author sdttttt
 */
export function toBilibiliTime(epochMs: number): number {
    return epochMs + BILIBILI_OFFSET_MS;
}

/**
 * 给定时刻所在的 UTC+8 日期的 `月-日` 键。
 *
 * @author sdttttt
 */
export function dayKey(epochMs: number): string {
    const shifted = new Date(toBilibiliTime(epochMs));
    return `${shifted.getUTCMonth() + 1}-${shifted.getUTCDate()}`;
}

/**
 * 自 UTC+8 午夜起经过的分钟数，范围为 `0`–`1439`。
 *
 * 周番数据里的时刻都是 UTC+8 的墙上时钟，因此任何需要落在同一时间表上的内容
 * ——例如 Webview 里的「你在这里」标记——都必须使用同一套时钟，而不是用户本地时钟。
 *
 * @author sdttttt
 */
export function minuteOfDay(epochMs: number): number {
    const shifted = new Date(toBilibiliTime(epochMs));
    return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

/**
 * UTC+8 一天中某一分钟对应的 `HH:MM` 文案。
 *
 * @author sdttttt
 */
export function formatMinuteOfDay(minute: number): string {
    const hours = Math.floor(minute / 60);
    const minutes = minute % 60;
    const pad = (value: number): string => String(value).padStart(2, "0");

    return `${pad(hours)}:${pad(minutes)}`;
}

/**
 * 给定时刻所在的 UTC+8 星期，范围为 `1`（周一）–`7`（周日）。
 *
 * Bangumi 的每日放送按星期分组，`weekday.id` 与 `air_weekday` 都用这套序号，
 * 因此不能沿用 JavaScript 的 `0`–`6`。
 *
 * @author sdttttt
 */
export function weekDayOf(epochMs: number): number {
    const day = new Date(toBilibiliTime(epochMs)).getUTCDay();
    return 0 === day ? 7 : day;
}

/**
 * 给定时刻所在的 UTC+8 年份。
 *
 * 年份筛选的菜单按它生成「今年」，与 B 站的日界保持同一套时钟。
 *
 * @author sdttttt
 */
export function yearOf(epochMs: number): number {
    return new Date(toBilibiliTime(epochMs)).getUTCFullYear();
}

/**
 * 给定时刻之后最近的 UTC+8 午夜的毫秒时间戳。
 *
 * @author sdttttt
 */
export function nextDayStart(epochMs: number): number {
    const shifted = toBilibiliTime(epochMs);
    return Math.floor(shifted / DAY_MS) * DAY_MS + DAY_MS - BILIBILI_OFFSET_MS;
}

/**
 * 周番数据中的某一天是否为当前 UTC+8 日。
 *
 * 接口给出的 `is_today` 优先；响应缺少该字段时回退到 `date_ts`，
 * 最后才使用字符串 `date`。
 *
 * @author sdttttt
 */
export function isCurrentDay(day: DayStamp, now: number): boolean {
    if (1 === day.is_today) {
        return true;
    }
    if (0 < day.date_ts) {
        return dayKey(day.date_ts * 1000) === dayKey(now);
    }
    return day.date === dayKey(now);
}

/**
 * 两个时刻之间相隔的 `dayKey` 天数，按 UTC+8 计算。
 *
 * 用于判断即将到来的更新发生在今天还是明天，
 * 状态栏因此可以直接说明，而不必猜测。
 *
 * @author sdttttt
 */
export function dayDistance(from: number, to: number): number {
    return Math.round((nextDayStart(to) - nextDayStart(from)) / DAY_MS);
}
