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
 * @author sdttttt
 */
function Season({ season }: { season: SeasonPayload }) {
    return (
        <div class={season.delay ? "bangumi delay" : "bangumi"}>
            <div class="cover">
                <a href={season.url}>
                    <img alt="加载不出来鸭!" src={season.cover} />
                </a>
            </div>
            <div class="info">
                <a href={season.url}>
                    <div class="title">{season.title}</div>
                </a>
                <a href={season.url}>
                    <div class="part-number">
                        {season.delay
                            ? `${season.delayIndex} w(ﾟДﾟ)w ${season.delayReason}`
                            : season.pubIndex}
                    </div>
                </a>
            </div>
        </div>
    );
}

/**
 * Renders one day of the schedule.
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
        <div class={day.isToday ? "item today" : "item"}>
            <div class="day">
                <h2>
                    {day.label}
                    {day.isToday && assets ? (
                        <span class="today-badge">
                            <img src={assets.todayBadge} alt="今天更新" />
                        </span>
                    ) : null}
                </h2>
                {day.date}
            </div>
            {groupByPubTime(day.seasons).map(group => (
                <div class="time-group" key={group.pubTime}>
                    <div class="time-point">🕒{group.pubTime}</div>
                    {group.seasons.map(season => (
                        <Season key={season.url} season={season} />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Weekly schedule view.
 *
 * @author sdttttt
 */
export function WeekBangumiList({ days, assets }: WeekBangumiListProps) {
    return (
        <div class="week">
            {days.map(day => (
                <Day key={day.date} day={day} assets={assets} />
            ))}
        </div>
    );
}
