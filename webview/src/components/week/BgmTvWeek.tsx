import type {
    AssetUris,
    SeasonPayload,
    WeekDayPayload,
    WeekSourceKind,
} from "@shared/webview/protocol";
import { isLiveToday, useNow } from "./marker";
import { WeekBoard } from "./WeekBoard";
import { SourceNote, SourceSwitch } from "./SourceNote";

/**
 * 渲染 Bangumi 的一条番剧。
 *
 * 与 B 站不同，条目里没有播出时刻、集数进度与延期概念，取而代之的是首播日期、
 * 评分与原作名：首播日期占原本集数的位置（带「首播」前缀，否则会被读成本周的日期），
 * 评分单独一行，原名放在悬浮提示里。
 *
 * 封面用比 B 站更高的画框（`season-poster`）：Bangumi 的封面是书封式的长条，
 * 塞进方形画框会被裁掉大半构图。
 *
 * @author sdttttt
 */
function SeasonRow({ season }: { season: SeasonPayload }) {
    return (
        <a class="bangumi" href={season.url} title={season.title}>
            <span class="season-poster">
                <img
                    class="season-poster-image"
                    alt=""
                    src={season.cover}
                    loading="lazy"
                    decoding="async"
                />
            </span>
            <span class="season-info">
                <span class="season-title" title={season.originalTitle}>
                    {season.title}
                </span>
                {season.pubIndex ? (
                    <span class="season-part">首播 {season.pubIndex}</span>
                ) : null}
                {undefined === season.score ? null : (
                    <span class="chip season-score">
                        评分 {season.score.toFixed(1)}
                    </span>
                )}
            </span>
        </a>
    );
}

/**
 * 渲染一天。
 *
 * 没有更新时段，因此渲染的是普通列表而不是时间表：既不画 `.time-point`，
 * 也不画「你在这里」标记与倒计时。「今天」徽标要跟着实时时钟走——跨过
 * 午夜后过期的 isToday 不再画徽标，因此这里同样订阅时钟。
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
    const now = useNow(pinned, day.isToday);
    const liveToday = isLiveToday(day, now);

    return (
        <section class={liveToday ? "item today" : "item"}>
            <header class={liveToday ? "day day-today" : "day"}>
                <h2
                    class={
                        liveToday ? "day-title day-title-today" : "day-title"
                    }>
                    <span>{day.label}</span>
                    {liveToday && assets ? (
                        <span class="today-badge">
                            <img
                                class="today-badge-image"
                                src={assets.image}
                                alt="今天更新"
                            />
                        </span>
                    ) : null}
                </h2>
                <span class="day-date">{day.date}</span>
            </header>
            <div class="timeline">
                {day.seasons.map(season => (
                    <SeasonRow key={season.url} season={season} />
                ))}
            </div>
        </section>
    );
}

/**
 * Bangumi 每日放送。
 *
 * 它的数据只有星期而没有播出时刻，因此这里没有时段分组、没有倒计时，
 * 顶部固定说明数据来源与「不提醒」这件事。
 *
 * @author sdttttt
 */
export function BgmTvWeek({
    days,
    assets,
    now,
    onSwitchSource,
}: {
    days: Array<WeekDayPayload>;
    assets: AssetUris | undefined;
    /** 冻结「今天」判断所用时刻，测试用；缺省跟随实时时钟。 */
    now?: number;
    onSwitchSource?: (source: WeekSourceKind) => void;
}) {
    return (
        <WeekBoard
            source={
                <SourceNote
                    action={
                        <SourceSwitch
                            current="bangumi"
                            onSwitch={onSwitchSource}
                        />
                    }>
                    数据来源：Bangumi 每日放送 · 不含播出时间，因此没有更新提醒
                </SourceNote>
            }>
            {days.map(day => (
                <Day key={day.date} day={day} assets={assets} now={now} />
            ))}
        </WeekBoard>
    );
}
