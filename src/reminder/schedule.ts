import type { WBangumi, WeekBangumiData } from "../request/bilibili/schema";
import { dayDistance, isCurrentDay, nextDayStart } from "../utils/clock";
import { truncateToColumns } from "../utils/titles";

/**
 * 日程中至少有一部番剧更新的某一时刻。
 *
 * 共享同一个 `pub_ts` 的番剧会合并成一个事件，这样用户收到的是一条通知，
 * 而不是每部番剧各一条。
 *
 * @author sdttttt
 */
export interface ScheduleEvent {
    /** 提醒应当触发的时刻，已应用提前量。 */
    readonly at: number;
    /** 剧集真正更新的时刻。 */
    readonly pubTs: number;
    /** 接口返回的更新时刻文案，例如 `20:00`。 */
    readonly pubTime: string;
    /** 同一时刻更新的番剧标题，按日程顺序排列。 */
    readonly titles: ReadonlyArray<string>;
}

/**
 * 提醒所需的全部信息，由周番数据一次性推导得出。
 *
 * @author sdttttt
 */
export interface Schedule {
    /** 尚未触发的通知事件，按 `at` 升序排列。 */
    readonly events: ReadonlyArray<ScheduleEvent>;
    /** 需要重新拉取次日日程的时刻。 */
    readonly rolloverAt: number;
}

/**
 * 午夜之后重新拉取日程的缓冲时长。
 *
 * 接口在午夜整点切换 `is_today` 标记，稍微延后可以避免读到只更新了一半的响应。
 *
 * @author sdttttt
 */
export const ROLLOVER_DELAY_MS = 5 * 60 * 1000;

/**
 * 判断该条目是否为延期番剧，延期番剧没有可靠的更新时间。
 *
 * @author sdttttt
 */
function isDelayed(season: WBangumi): boolean {
    return 1 === season.delay;
}

/**
 * 构建日程中的通知事件。
 *
 * 延期番剧会被跳过，没有更新时刻的番剧同样跳过。`aheadSeconds` 提前量按事件
 * 逐个收敛，提前量大于剩余时间时立即触发，而不是算出一个负的延迟。
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
        /* 已经播出，或者远到不值得再上定时器。 */
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
 * 当前日程覆盖到接口番剧的哪个时刻为止。
 *
 * 跨两个日界：今天剩余的时间加上整个明天，正好是提醒需要前瞻的范围。
 * 每日滚动时会重新拉取日程，因此覆盖面不会断档。
 *
 * @author sdttttt
 */
export function horizonOf(now: number): number {
    return nextDayStart(nextDayStart(now));
}

/**
 * 构建完整日程，包括次日滚动的时刻。
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
 * 今天在周番数据中的下标。
 *
 * 接口直接标记了当天，因此不需要做本地日期运算。
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
 * 状态栏条目开头渲染的图标。
 *
 * codicon 只占一个字形，而写出「更新于」要占九列；同时它能让条目在拥挤的
 * 状态栏里一眼被认出来。
 *
 * @author sdttttt
 */
export const STATUS_BAR_ICON = "$(clock)";

/**
 * 事件距今天多少天时，状态栏会标注为「明日」。
 *
 * @author sdttttt
 */
const TOMORROW_DAYS = 1;

/**
 * 状态栏条目中留给标题的列数。
 *
 * 七个中日韩字符加省略号：足够认出剧名，又不会把时间挤出可视区域。
 *
 * @author sdttttt
 */
export const STATUS_BAR_NAME_COLUMNS = 15;

/**
 * 分组标题的展示名，不带通知里使用的书名号。
 *
 * 状态栏是扩展里最窄的展示面，书名号每处要占两列却没有增加信息量；
 * 悬浮提示里仍然保留书名号。
 *
 * @author sdttttt
 */
function groupName(event: ScheduleEvent): string {
    return 1 === event.titles.length
        ? truncateToColumns(event.titles[0], STATUS_BAR_NAME_COLUMNS)
        : `${event.titles.length}部番`;
}

/**
 * 非当天事件的「明日 」前缀。
 *
 * 当天事件返回空串，这是最常见的情况，必须保持无噪声。前缀自带尾随空格，
 * 调用方可以直接和时刻拼接；悬浮提示与无障碍标签复用它，保持与条目本身一致。
 *
 * @author sdttttt
 */
export function dayMarker(event: ScheduleEvent, now: number): string {
    return TOMORROW_DAYS === dayDistance(now, event.pubTs) ? "明日 " : "";
}

/**
 * 事件在状态栏中的文本。
 *
 * 时间放在最前面，条目宽度才能保持稳定，视线也会落在刷新之间唯一变化的部分；
 * 标题接在后面，不带书名号。
 *
 * @author sdttttt
 */
export function describeEvent(event: ScheduleEvent, now: number): string {
    return `${STATUS_BAR_ICON} ${dayMarker(event, now)}${event.pubTime} ${groupName(event)}`;
}
