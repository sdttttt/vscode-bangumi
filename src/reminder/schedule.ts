import type { WBangumi, WeekBangumiData } from "../request/structure";
import { isCurrentDay, nextDayStart } from "../utils/clock";
import { describeTitles } from "../utils/titles";

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
 * Status bar text of an event, kept short so it survives a narrow status bar.
 *
 * @author sdttttt
 */
export function describeEvent(event: ScheduleEvent): string {
    if (1 !== event.titles.length) {
        return `很神秘, 有${event.titles.length}部番 update at ${event.pubTime}`;
    }

    return `${describeTitles(event.titles.map(shortenTitle))} update at ${event.pubTime}`;
}

/**
 * Longest title kept in the status bar.
 *
 * @author sdttttt
 */
export const STATUS_BAR_TITLE_LENGTH = 7;

/**
 * Truncates a title to fit a narrow status bar entry.
 *
 * @author sdttttt
 */
function shortenTitle(title: string): string {
    return STATUS_BAR_TITLE_LENGTH < title.length
        ? `${title.slice(0, STATUS_BAR_TITLE_LENGTH)}...`
        : title;
}
