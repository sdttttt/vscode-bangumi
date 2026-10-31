import { useEffect, useRef } from "preact/hooks";
import type {
    AssetUris,
    SeasonPayload,
    WeekDayPayload,
} from "@shared/webview/protocol";

/**
 * Props of the weekly schedule view.
 *
 * @author sdttttt
 */
interface WeekBangumiListProps {
    days: Array<WeekDayPayload>;
    assets: AssetUris | undefined;
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
 * Renders one day of the schedule.
 *
 * The header keeps the weekday, the date and the "today" badge together so the
 * column reads as a single unit for assistive technology.
 *
 * @author sdttttt
 */
function Day({
    day,
    assets,
}: {
    day: WeekDayPayload;
    assets: AssetUris | undefined;
}) {
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
                {groupByPubTime(day.seasons).map(group => (
                    <div class="time-group" key={group.pubTime}>
                        <div class="time-point">{group.pubTime}</div>
                        {group.seasons.map(season => (
                            <Season key={season.url} season={season} />
                        ))}
                    </div>
                ))}
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
export function WeekBangumiList({ days, assets }: WeekBangumiListProps) {
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
                    <Day key={day.date} day={day} assets={assets} />
                ))}
            </div>
        </div>
    );
}
