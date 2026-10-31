/**
 * Bilibili reports the weekly schedule in China Standard Time (UTC+8).
 *
 * Day boundaries therefore have to be computed in that fixed offset instead of
 * the user's local time zone, otherwise a user west of UTC sees yesterday's
 * entry flagged as today and the reminder stays silent.
 *
 * @author sdttttt
 */
export const BILIBILI_OFFSET_MS = 8 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * One day of the weekly schedule, as far as day arithmetic is concerned.
 *
 * @author sdttttt
 */
export interface DayStamp {
    readonly date: string;
    readonly date_ts: number;
    readonly is_today: number;
}

/**
 * Shifts an epoch millisecond value onto the UTC+8 wall clock.
 *
 * @author sdttttt
 */
export function toBilibiliTime(epochMs: number): number {
    return epochMs + BILIBILI_OFFSET_MS;
}

/**
 * `month-day` key of the UTC+8 day containing the given instant.
 *
 * @author sdttttt
 */
export function dayKey(epochMs: number): string {
    const shifted = new Date(toBilibiliTime(epochMs));
    return `${shifted.getUTCMonth() + 1}-${shifted.getUTCDate()}`;
}

/**
 * Epoch ms of the next UTC+8 midnight after the given instant.
 *
 * @author sdttttt
 */
export function nextDayStart(epochMs: number): number {
    const shifted = toBilibiliTime(epochMs);
    return Math.floor(shifted / DAY_MS) * DAY_MS + DAY_MS - BILIBILI_OFFSET_MS;
}

/**
 * Whether the given schedule day is the current UTC+8 day.
 *
 * `is_today` from the API wins when it is set; `date_ts` is the fallback for
 * responses that omit it, and the string `date` is the last resort.
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
 * `dayKey` distance between two instants, in UTC+8 days.
 *
 * Used to decide whether an upcoming update still happens today or already
 * tomorrow, so the status bar can say which one without guessing.
 *
 * @author sdttttt
 */
export function dayDistance(from: number, to: number): number {
    return Math.round((nextDayStart(to) - nextDayStart(from)) / DAY_MS);
}
