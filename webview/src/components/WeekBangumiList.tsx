import { Fragment } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type {
    AssetUris,
    SeasonPayload,
    WeekDayPayload,
} from "@shared/webview/protocol";
import { formatMinuteOfDay, minuteOfDay } from "@shared/utils/clock";

/**
 * Props of the weekly schedule view.
 *
 * @author sdttttt
 */
interface WeekBangumiListProps {
    days: Array<WeekDayPayload>;
    assets: AssetUris | undefined;
    /** Overrides the ticking clock; tests pin it to a fixed instant. */
    now?: number;
}

/**
 * One publication slot of a day.
 *
 * @author sdttttt
 */
export interface SeasonGroup {
    pubTime: string;
    seasons: Array<SeasonPayload>;
}

/**
 * Refresh cadence of the "you are here" marker.
 *
 * The marker only moves once a minute, so polling twice per minute keeps it
 * exact without waking the webview more often than needed.
 *
 * @author sdttttt
 */
export const NOW_TICK_MS = 30_000;

/**
 * Label of the marker drawn at the current time of the day.
 *
 * @author sdttttt
 */
export const NOW_LABEL = "你在这里~";

/**
 * Marker suffix once every slot of the day has aired.
 *
 * @author sdttttt
 */
export const NOW_DONE_LABEL = "今日已播完";

/**
 * Marker suffix for a day without any publication slot.
 *
 * @author sdttttt
 */
export const NOW_EMPTY_LABEL = "今日没有更新";

/**
 * Minute of the day of a `HH:MM` publication slot.
 *
 * @returns the minute, or `undefined` when the slot is malformed
 * @author sdttttt
 */
export function pubTimeMinute(pubTime: string): number | undefined {
    const match = /^(\d{1,2}):(\d{2})$/.exec(pubTime.trim());
    if (!match) {
        return undefined;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (24 <= hours || 60 <= minutes) {
        return undefined;
    }

    return hours * 60 + minutes;
}

/**
 * Slot index the "you are here" marker has to be drawn in front of.
 *
 * `0` means the current time is before every slot, `groups.length` means it is
 * after the last one. A slot that cannot be parsed ends the scan, so a
 * malformed entry never pushes the marker below a slot that is still ahead.
 *
 * A slot airing on the current minute counts as aired, so the mark stays on the
 * `time-group` the reader is watching instead of jumping above it.
 *
 * @author sdttttt
 */
export function markerIndex(
    groups: ReadonlyArray<SeasonGroup>,
    nowMinute: number
): number {
    let index = 0;

    for (const [position, group] of groups.entries()) {
        const at = pubTimeMinute(group.pubTime);
        if (undefined === at || nowMinute < at) {
            break;
        }
        index = position + 1;
    }

    return index;
}

/**
 * Remaining minutes until the first slot at or after the current instant.
 *
 * `undefined` when the day has no such slot, which happens after the last
 * update aired or on a day without any update.
 *
 * @author sdttttt
 */
export function nextGapMinutes(
    groups: ReadonlyArray<SeasonGroup>,
    nowMinute: number
): number | undefined {
    /*
     * The scan starts where the marker sits, so a slot that airs on the very
     * minute already counts as aired: the countdown always points below the
     * marker instead of at the row right above it.
     */
    for (const group of groups.slice(markerIndex(groups, nowMinute))) {
        const at = pubTimeMinute(group.pubTime);
        if (undefined !== at && at >= nowMinute) {
            return at - nowMinute;
        }
    }

    return undefined;
}

/**
 * Human readable countdown of the marker.
 *
 * Below an hour the minutes are enough; above it the hours come first so the
 * number stays easy to read at a glance. Both spell out the unit, because a
 * bare `2:05` reads as a wall clock next to the `HH:MM` slots.
 *
 * @author sdttttt
 */
export function describeGap(minutes: number): string {
    if (60 > minutes) {
        return `还有 ${minutes} 分钟`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return 0 === rest ? `还有 ${hours} 小时` : `还有 ${hours} 小时 ${rest} 分`;
}

/**
 * Countdown the "you are here" marker has to display.
 *
 * @author sdttttt
 */
export function describeNow(
    groups: ReadonlyArray<SeasonGroup>,
    nowMinute: number
): string {
    if (0 === groups.length) {
        return NOW_EMPTY_LABEL;
    }

    const gap = nextGapMinutes(groups, nowMinute);
    return undefined === gap ? NOW_DONE_LABEL : describeGap(gap);
}

/**
 * Current instant, ticking once every {@link NOW_TICK_MS} while `active`.
 *
 * Only the current day subscribes: the other six columns are static, so they
 * must not re-render every time the marker moves. A pinned `pinned` value
 * short-circuits the timer, so tests can freeze the marker on an exact minute.
 *
 * @author sdttttt
 */
function useNow(pinned: number | undefined, active: boolean): number {
    const [tick, setTick] = useState(() => Date.now());

    useEffect(() => {
        if (undefined !== pinned || !active) {
            return;
        }

        const update = (): void => setTick(Date.now());
        const timer = setInterval(update, NOW_TICK_MS);

        /*
         * A hidden panel is throttled by Chromium, and a suspended machine
         * stops timers altogether. Re-reading the clock on the way back in
         * moves the marker at once instead of up to half a minute later.
         */
        document.addEventListener("visibilitychange", update);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", update);
        };
    }, [pinned, active]);

    return pinned ?? tick;
}

/**
 * Groups the seasons of a day by publication time, keeping the original order.
 *
 * The API already sorts seasons by `pub_time`, so one pass is enough and the
 * neighbouring groups stay adjacent.
 *
 * @author sdttttt
 */
export function groupByPubTime(
    seasons: Array<SeasonPayload>
): Array<SeasonGroup> {
    const groups: Array<SeasonGroup> = [];

    for (const season of seasons) {
        const last = groups.at(-1);
        if (last && last.pubTime === season.pubTime) {
            last.seasons.push(season);
        } else {
            groups.push({ pubTime: season.pubTime, seasons: [season] });
        }
    }

    return groups;
}

/**
 * Renders one season entry of the schedule.
 *
 * The whole row is a single link so the cover, title and episode all share one
 * tab stop instead of three.
 *
 * @author sdttttt
 */
function Season({ season }: { season: SeasonPayload }) {
    return (
        <a
            class={season.delay ? "bangumi delay" : "bangumi"}
            href={season.url}
            title={season.title}>
            <span class="season-cover">
                <img
                    class={
                        season.delay
                            ? "season-cover-image season-cover-delay"
                            : "season-cover-image"
                    }
                    alt=""
                    src={season.cover}
                    loading="lazy"
                    decoding="async"
                />
            </span>
            <span class="season-info">
                <span
                    class={
                        season.delay
                            ? "season-title season-title-delay"
                            : "season-title"
                    }>
                    {season.title}
                </span>
                <span
                    class={
                        season.delay
                            ? "season-part season-part-delay"
                            : "season-part"
                    }>
                    {season.delay
                        ? `${season.delayIndex} w(ﾟДﾟ)w ${season.delayReason}`
                        : season.pubIndex}
                </span>
            </span>
        </a>
    );
}

/**
 * The "you are here" marker, drawn between two publication slots.
 *
 * The suffix is a countdown instead of the wall clock: the marker already sits
 * at its own position on the timetable, so the useful information is how long
 * the reader has to wait for the next update.
 *
 * `role="separator"` keeps it out of the reading flow of the schedule while the
 * label still announces the current time for assistive technology.
 *
 * @author sdttttt
 */
function NowMarker({ now, countdown }: { now: number; countdown: string }) {
    const clock = formatMinuteOfDay(minuteOfDay(now));

    return (
        <div
            class="now-marker"
            role="separator"
            aria-label={`当前时间 ${clock}，${countdown}`}>
            <span class="now-arrow" aria-hidden="true">
                ▶
            </span>
            <span class="now-label">{NOW_LABEL}</span>
            <span class="now-countdown">{countdown}</span>
        </div>
    );
}

/**
 * Renders one day of the schedule.
 *
 * The header keeps the weekday, the date and the "today" badge together so the
 * column reads as a single unit for assistive technology.
 *
 * Today also carries the "you are here" marker: the current instant is drawn
 * between the slots that already aired and the ones still ahead, which is the
 * one place on the board where the reader's position is unambiguous.
 *
 * @author sdttttt
 */
function Day({
    day,
    assets,
    now: pinned,
}: {
    day: WeekDayPayload;
    assets: AssetUris | undefined;
    now: number | undefined;
}) {
    const groups = groupByPubTime(day.seasons);
    const now = useNow(pinned, day.isToday);
    const nowMinute = minuteOfDay(now);
    const marker = day.isToday ? markerIndex(groups, nowMinute) : -1;
    const countdown = describeNow(groups, nowMinute);

    return (
        <section class={day.isToday ? "item today" : "item"}>
            <header class={day.isToday ? "day day-today" : "day"}>
                <h2
                    class={
                        day.isToday ? "day-title day-title-today" : "day-title"
                    }>
                    <span>{day.label}</span>
                    {day.isToday && assets ? (
                        <span class="today-badge">
                            <img
                                class="today-badge-image"
                                src={assets.todayBadge}
                                alt="今天更新"
                            />
                        </span>
                    ) : null}
                </h2>
                <span class="day-date">{day.date}</span>
            </header>
            <div class="timeline">
                {groups.map((group, index) => (
                    <Fragment key={group.pubTime}>
                        {marker === index ? (
                            <NowMarker now={now} countdown={countdown} />
                        ) : null}
                        <div class="time-group">
                            <div class="time-point">{group.pubTime}</div>
                            {group.seasons.map(season => (
                                <Season key={season.url} season={season} />
                            ))}
                        </div>
                    </Fragment>
                ))}
                {marker === groups.length ? (
                    <NowMarker now={now} countdown={countdown} />
                ) : null}
            </div>
        </section>
    );
}

/**
 * Weekly schedule view.
 *
 * The markup keeps the original semantics (day → publication slot → season) and
 * wraps them in a grid of equal-height day columns that scrolls horizontally.
 *
 * `today` is the anchor the board scrolls to, so the current day is visible
 * without the user dragging the strip.
 *
 * @author sdttttt
 */
export function WeekBangumiList({
    days,
    assets,
    now: pinned,
}: WeekBangumiListProps) {
    const board = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const today = board.current?.querySelector(".item.today");
        if (today && "scrollIntoView" in today) {
            today.scrollIntoView({ block: "nearest", inline: "start" });
        }
    }, [days]);

    return (
        <div class="board week-board" ref={board}>
            <div class="week">
                {days.map(day => (
                    <Day
                        key={day.date}
                        day={day}
                        assets={assets}
                        now={pinned}
                    />
                ))}
            </div>
        </div>
    );
}
