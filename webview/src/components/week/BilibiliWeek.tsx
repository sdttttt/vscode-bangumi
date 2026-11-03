import { Fragment } from "preact";
import type {
    AssetUris,
    SeasonPayload,
    WeekDayPayload,
    WeekSourceKind,
} from "@shared/webview/protocol";
import { formatMinuteOfDay, minuteOfDay } from "@shared/utils/clock";
import {
    describeNow,
    groupByPubTime,
    isLiveToday,
    markerIndex,
    NOW_LABEL,
    useNow,
} from "./marker";
import { WeekBoard } from "./WeekBoard";
import { SourceNote, SourceSwitch } from "./SourceNote";

/**
 * 渲染日程中的单部番剧。
 *
 * 整行是一个链接，封面、标题与集数因此共用同一个 tab 焦点，而不是三个。
 * 延期条目换成警告配色，并把延期说明接在原来的集数位置。
 *
 * @author sdttttt
 */
function SeasonRow({ season }: { season: SeasonPayload }) {
    const part = season.delay
        ? `${season.delayIndex} w(ﾟДﾟ)w ${season.delayReason}`
        : season.pubIndex;

    return (
        <a
            class={season.delay ? "bangumi delay" : "bangumi"}
            /* 空 url 降级为不可点的行：把 webview 自身地址转发出去毫无意义。 */
            href={season.url || undefined}
            title={season.title}>
            <span class="season-cover">
                {season.cover ? (
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
                ) : null}
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
                {part ? (
                    <span
                        class={
                            season.delay
                                ? "season-part season-part-delay"
                                : "season-part"
                        }>
                        {part}
                    </span>
                ) : null}
            </span>
        </a>
    );
}

/**
 * 画在两个更新时段之间的「你在这里」标记。
 *
 * 后缀是倒计时而不是墙上时钟：标记本身已经落在时间表的对应位置上，
 * 真正有用的信息是读者还要等多久才到下一场更新。
 *
 * `role="separator"` 让它不进入日程的阅读流，同时标签仍会为辅助技术播报当前时间。
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
 * 渲染日程中的一天。
 *
 * 表头把星期、日期与「今天」徽标放在一起，整列因此对辅助技术而言是一个整体。
 *
 * 今天这一列还会带上「你在这里」标记：当前时刻画在已经播出与尚未播出的时段之间，
 * 这是整个面板上唯一能明确表达读者位置的地方。
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
    /* 跨过 UTC+8 午夜后 isToday 就过期了：日期与实时时钟对不上不再画标记。 */
    const liveToday = isLiveToday(day, now);
    const marker = liveToday ? markerIndex(groups, nowMinute) : -1;
    const countdown = describeNow(groups, nowMinute);

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
                {groups.map((group, index) => (
                    <Fragment key={group.pubTime}>
                        {marker === index ? (
                            <NowMarker now={now} countdown={countdown} />
                        ) : null}
                        <div class="time-group">
                            <div class="time-point">{group.pubTime}</div>
                            {group.seasons.map(season => (
                                <SeasonRow
                                    key={season.url || season.title}
                                    season={season}
                                />
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
 * B 站周番表。
 *
 * 它的数据带播出时刻，因此按「时段 → 番剧」分组，并在当天画「你在这里」标记。
 *
 * @author sdttttt
 */
export function BilibiliWeek({
    days,
    assets,
    now,
    onSwitchSource,
    fallback,
}: {
    days: Array<WeekDayPayload>;
    assets: AssetUris | undefined;
    now?: number;
    onSwitchSource?: (source: WeekSourceKind) => void;
    /** 数据是否由 bgm.tv 回退而来。 */
    fallback?: boolean;
}) {
    return (
        <WeekBoard
            source={
                <SourceNote
                    fallback={fallback}
                    action={
                        <SourceSwitch
                            current="bilibili"
                            onSwitch={onSwitchSource}
                        />
                    }>
                    数据来源：Bilibili 番剧时间表 · 播出时刻为北京时间
                </SourceNote>
            }>
            {days.map(day => (
                <Day key={day.date} day={day} assets={assets} now={now} />
            ))}
        </WeekBoard>
    );
}
