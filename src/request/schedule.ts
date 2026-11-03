import type { WBangumi, WeekBangumiData } from "./bilibili/schema";
import type { BgmCalendarDay, BgmImages, BgmSubject } from "./bgmtv/schema";
import { dayKey, isCurrentDay, weekDayOf } from "../utils/clock";
import { toHttpsUrl } from "../utils/strings";

/**
 * 周番表的数据来源。
 *
 * @author sdttttt
 */
export type WeekSourceKind = "bilibili" | "bangumi";

/**
 * 统一的周番模型。
 *
 * 两种来源的原始响应差异很大（B 站带播出时刻与集数，Bangumi 只有星期与首播日期），
 * 视图与提醒之前必须先归一到这里：视图只认这个模型，因此不会再出现「某个字段只有某个来源有」的分支。
 *
 * @export
 * @interface WeeklySchedule
 * @author sdttttt
 */
export interface WeeklySchedule {
    source: WeekSourceKind;
    /**
     * 数据是否带播出时刻。
     *
     * 为 `false` 时视图不画更新时段与「你在这里」标记，提醒也不能消费它。
     */
    hasSlots: boolean;
    /** 七天，按星期 1–7 排列。 */
    days: Array<ScheduleDay>;
}

/**
 * 周番数据中的一天。
 *
 * @export
 * @interface ScheduleDay
 * @author sdttttt
 */
export interface ScheduleDay {
    /** 1 为周一，7 为周日。 */
    dayOfWeek: number;
    /** `月-日`，按 UTC+8 计算。 */
    date: string;
    isToday: boolean;
    items: Array<ScheduleItem>;
}

/**
 * 周番数据中的单部作品。
 *
 * @export
 * @interface ScheduleItem
 * @author sdttttt
 */
export interface ScheduleItem {
    /** 展示用的标题，中文名优先，缺失时回退原名。 */
    title: string;
    /** 原名；与 `title` 相同时省略。 */
    originalTitle?: string;
    /** 封面地址，已升级为 https；来源给不出封面时为空串。 */
    cover: string;
    /** 作品页面地址，已升级为 https。 */
    url: string;
    /** 播出时刻 `HH:MM`；没有该信息的来源为空串。 */
    pubTime: string;
    /** 进度文案：B 站是集数或延期说明，Bangumi 是首播日期。 */
    progress: string;
    delay: boolean;
    delayReason: string;
    /** 评分 0–10；只有 Bangumi 提供，0 表示无人评分。 */
    score?: number;
}

/**
 * 一天中的七个星期，按 1–7 排列。
 *
 * @author sdttttt
 */
const WEEK_DAYS: ReadonlyArray<number> = [1, 2, 3, 4, 5, 6, 7];

/**
 * 把给定时刻所在的 `月-日` 平移到同一周的某一天。
 *
 * Bangumi 只给星期不给日期，而视图要用日期作列表的键，因此按 UTC+8 从今天推算。
 * 一周以周一为起点：从今天回退到本周一，再向后数到目标星期，
 * 这样七天的日期始终递增，不会被拆成「本周剩下的几天 + 下周的周初」。
 *
 * @param dayOfWeek 目标星期，1–7
 * @param now 当前时刻
 * @author sdttttt
 */
function dateOfWeekDay(dayOfWeek: number, now: number): string {
    const mondayOffset = (weekDayOf(now) - 1) * 24 * 60 * 60 * 1000;
    const offset = (dayOfWeek - 1) * 24 * 60 * 60 * 1000;

    return dayKey(now - mondayOffset + offset);
}

/**
 * 把 B 站的单部番剧转换为统一条目。
 *
 * @author sdttttt
 */
function fromBilibiliSeason(season: WBangumi): ScheduleItem {
    const delay = 1 === season.delay;

    return {
        title: season.title,
        cover: toHttpsUrl(season.square_cover || season.cover),
        url: toHttpsUrl(season.url),
        pubTime: season.pub_time,
        progress: delay ? season.delay_index : season.pub_index,
        delay,
        delayReason: season.delay_reason,
    };
}

/**
 * 把 B 站周番转换为统一模型。
 *
 * B 站已经按星期排好并给出日期，因此只做字段重命名，保持接口原序。
 *
 * @param data 周番原始数据
 * @param now 当前时刻，仅用于判断「今天」
 * @author sdttttt
 */
export function toScheduleFromBilibili(
    data: Array<WeekBangumiData>,
    now: number = Date.now()
): WeeklySchedule {
    return {
        source: "bilibili",
        hasSlots: true,
        days: data.map(day => ({
            dayOfWeek: day.day_of_week,
            date: day.date,
            isToday: isCurrentDay(day, now),
            items: day.seasons.map(fromBilibiliSeason),
        })),
    };
}

/**
 * 取 Bangumi 封面的中等尺寸。
 *
 * 接口的五档尺寸里 `grid` 只有 48×48，放大到面板的封面尺寸会明显发糊；
 * `large` 又常有 1500–2500 像素宽、单张几百 KB，一次渲染上百条并不划算。
 * `common` 约 150 像素宽，正好覆盖列宽在高分屏下的需求，因此优先选它，
 * 缺失时才依次退到更大的 `large` 与更小的几档。
 *
 * @author sdttttt
 */
function coverOf(images: BgmImages | null): string {
    return toHttpsUrl(
        images?.common ||
            images?.large ||
            images?.medium ||
            images?.small ||
            images?.grid
    );
}

/**
 * 把 Bangumi 的单部作品转换为统一条目。
 *
 * 接口的图片与页面地址都是 http，必须升级；`name_cn` 为空时退回原名。
 *
 * @author sdttttt
 */
function fromBgmSubject(subject: BgmSubject): ScheduleItem {
    const title = subject.name_cn || subject.name;
    const score = subject.rating?.score;

    return {
        title,
        ...(title === subject.name ? {} : { originalTitle: subject.name }),
        cover: coverOf(subject.images),
        url: toHttpsUrl(subject.url),
        /* 接口没有播出时刻，也没有集数进度；首播日期是它能给出的最具体信息。 */
        pubTime: "",
        progress: subject.air_date,
        delay: false,
        delayReason: "",
        ...(score && 0 < score ? { score } : {}),
    };
}

/**
 * 同一天内的排序：首播日期新的在前，日期相同时按原名排列。
 *
 * 接口返回的顺序并不按日期，且这里必须稳定，否则每次刷新顺序都会变。
 *
 * @author sdttttt
 */
function compareSubjects(left: BgmSubject, right: BgmSubject): number {
    if (left.air_date !== right.air_date) {
        return right.air_date.localeCompare(left.air_date);
    }

    return left.name.localeCompare(right.name);
}

/**
 * 把 Bangumi 每日放送转换为统一模型。
 *
 * 接口给七组星期，没有播出时刻，也没有「过去几天」的概念，因此固定输出七天。
 *
 * @param days 每日放送原始数据
 * @param now 当前时刻，用于判断「今天」并推算日期
 * @author sdttttt
 */
export function toScheduleFromBgmTv(
    days: Array<BgmCalendarDay>,
    now: number = Date.now()
): WeeklySchedule {
    const today = weekDayOf(now);

    return {
        source: "bangumi",
        hasSlots: false,
        days: WEEK_DAYS.map(dayOfWeek => {
            const items = days
                .filter(day => day.weekday.id === dayOfWeek)
                .flatMap(day => day.items)
                /* 缺 air_date 的条目会让排序比较器抛错，宁缺毋滥。 */
                .filter(
                    subject =>
                        null !== subject &&
                        undefined !== subject &&
                        "string" === typeof subject.air_date
                )
                .slice()
                .sort(compareSubjects);

            return {
                dayOfWeek,
                date: dateOfWeekDay(dayOfWeek, now),
                isToday: dayOfWeek === today,
                items: items.map(fromBgmSubject),
            };
        }),
    };
}
