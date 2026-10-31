import type { WBangumi, WeekBangumiData } from "../request/structure";
import { dayDistance, isCurrentDay, nextDayStart } from "../utils/clock";
import { truncateToColumns } from "../utils/titles";

/**
 * One instant of the schedule at which at least one season updates.
 *
 * Seasons sharing a `pub_ts` are folded into a single event so the user gets
 * one notification instead of one per season.
 *
 * @author sdttttt
 */
export interface ScheduleEvent {
    /** Instant the reminder has to fire at, pre-shift already applied. */
    readonly at: number;
    /** Instant the episode actually publishes. */
    readonly pubTs: number;
    /** Publication wall clock as reported by the API, e.g. `20:00`. */
    readonly pubTime: string;
    /** Titles of the seasons updating together, in schedule order. */
    readonly titles: ReadonlyArray<string>;
}

/**
 * Everything the reminder needs, derived once from the weekly schedule.
 *
 * @author sdttttt
 */
export interface Schedule {
    /** Upcoming notification events, ascending by `at`. */
    readonly events: ReadonlyArray<ScheduleEvent>;
    /** Instant at which the schedule has to be pulled again for the next day. */
    readonly rolloverAt: number;
}

/**
 * Grace period after midnight before the schedule is refreshed.
 *
 * The API switches its `is_today` flag at midnight sharp, so a small delay
 * avoids reading a half updated response.
 *
 * @author sdttttt
 */
export const ROLLOVER_DELAY_MS = 5 * 60 * 1000;

/**
 * Whether an entry is a delayed season, which has no reliable update instant.
 *
 * @author sdttttt
 */
function isDelayed(season: WBangumi): boolean {
    return 1 === season.delay;
}

/**
 * Builds the notification events of the schedule.
 *
 * Delayed seasons are skipped, as are seasons without a publication instant.
 * The `aheadSeconds` lead time is clamped per event, so a lead longer than the
 * remaining time fires immediately instead of at a negative delay.
 *
 * @author sdttttt
 */
export function buildEvents(
    days: ReadonlyArray<WeekBangumiData>,
    now: number,
    aheadSeconds: number,
    horizonAt: number = Number.POSITIVE_INFINITY
): Array<ScheduleEvent> {
    const leadMs = Math.max(0, aheadSeconds) * 1000;
    const groups = new Map<
        number,
        { pubTime: string; titles: Array<string> }
    >();

    for (const day of days) {
        for (const season of day.seasons) {
            if (isDelayed(season) || 0 >= season.pub_ts) {
                continue;
            }
            const group = groups.get(season.pub_ts);
            if (group) {
                group.titles.push(season.title);
            } else {
                groups.set(season.pub_ts, {
                    pubTime: season.pub_time,
                    titles: [season.title],
                });
            }
        }
    }

    const events: Array<ScheduleEvent> = [];
    for (const [pubTs, group] of groups) {
        /* Already published, or too far away to be worth a timer. */
        if (pubTs * 1000 <= now || pubTs * 1000 >= horizonAt) {
            continue;
        }
        events.push({
            at: Math.max(pubTs * 1000 - leadMs, now),
            pubTs: pubTs * 1000,
            pubTime: group.pubTime,
            titles: group.titles,
        });
    }

    return events.sort((left, right) => left.at - right.at);
}

/**
 * Instant up to which the current schedule covers the API's seasons.
 *
 * Two day boundaries: the rest of today plus the whole of tomorrow, matching
 * how far ahead the reminder is expected to look. The daily rollover pulls the
 * schedule again, so coverage never lapses.
 *
 * @author sdttttt
 */
export function horizonOf(now: number): number {
    return nextDayStart(nextDayStart(now));
}

/**
 * Builds the whole schedule, including the instant of the next day rollover.
 *
 * @author sdttttt
 */
export function buildSchedule(
    days: ReadonlyArray<WeekBangumiData>,
    now: number,
    aheadSeconds: number
): Schedule {
    return {
        events: buildEvents(days, now, aheadSeconds, horizonOf(now)),
        rolloverAt: nextDayStart(now) + ROLLOVER_DELAY_MS,
    };
}

/**
 * Index of today in the weekly schedule.
 *
 * The API flags the day directly, so no local date arithmetic is needed.
 *
 * @author sdttttt
 */
export function todayIndex(
    days: ReadonlyArray<WeekBangumiData>,
    now: number
): number | undefined {
    const index = days.findIndex(day => isCurrentDay(day, now));
    return -1 === index ? undefined : index;
}

/**
 * Icon rendered at the head of the status bar entry.
 *
 * A codicon costs one glyph while `update at` costs nine columns, and it makes
 * the entry recognisable at a glance in a crowded status bar.
 *
 * @author sdttttt
 */
export const STATUS_BAR_ICON = "$(clock)";

/**
 * How many days ahead an event is announced as `明日` in the status bar.
 *
 * @author sdttttt
 */
const TOMORROW_DAYS = 1;

/**
 * Columns reserved for the subject of the status bar entry.
 *
 * Seven CJK characters plus the ellipsis: long enough for a recognisable title,
 * short enough that the time never gets pushed out of view.
 *
 * @author sdttttt
 */
export const STATUS_BAR_NAME_COLUMNS = 15;

/**
 * Name of a group, without the book quotes notifications use.
 *
 * The status bar is the narrowest surface of the extension, and the quotes add
 * two columns each without adding meaning; the tooltip keeps them.
 *
 * @author sdttttt
 */
function groupName(event: ScheduleEvent): string {
    return 1 === event.titles.length
        ? truncateToColumns(event.titles[0], STATUS_BAR_NAME_COLUMNS)
        : `${event.titles.length}部番`;
}

/**
 * `明日 ` prefix of an event that does not happen today.
 *
 * Empty for today, the common case that must stay free of noise. The trailing
 * space is part of the prefix so callers concatenate it with the time directly;
 * the tooltip and the accessibility label reuse it to stay consistent with the
 * entry itself.
 *
 * @author sdttttt
 */
export function dayMarker(event: ScheduleEvent, now: number): string {
    return TOMORROW_DAYS === dayDistance(now, event.pubTs) ? "明日 " : "";
}

/**
 * Status bar text of an event.
 *
 * Time first so the entry keeps a constant width and the eye lands on the only
 * part that changes between refreshes; the subject follows, without quotes.
 *
 * @author sdttttt
 */
export function describeEvent(event: ScheduleEvent, now: number): string {
    return `${STATUS_BAR_ICON} ${dayMarker(event, now)}${event.pubTime} ${groupName(event)}`;
}
