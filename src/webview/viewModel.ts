import type { Bangumi } from "../request/bilibili/schema";
import type {
    ScheduleDay,
    ScheduleItem,
    WeeklySchedule,
} from "../request/schedule";
import { toWeekDay } from "../utils/strings";
import type { BangumiPayload, SeasonPayload, WeekDayPayload } from "./protocol";

/**
 * 裁掉今天之前的天，只留下从今天开始的日程。
 *
 * 过去的几天排在前面，用户没有要求查看时就不渲染。天数由接口决定，
 * 不能写死：接口返回的过去天数会变，写死会把昨天一并留下。
 *
 * @param days 统一模型中的七天
 * @author sdttttt
 */
function fromToday(days: ReadonlyArray<ScheduleDay>): Array<ScheduleDay> {
    const today = days.findIndex(day => day.isToday);

    /* 找不到今天时不做裁剪，宁可多显示一天，也不要留白。 */
    return 0 > today ? [...days] : days.slice(today);
}

/**
 * 把统一模型中的单部作品转换为渲染载荷。
 *
 * @author sdttttt
 */
export function toSeasonPayload(item: ScheduleItem): SeasonPayload {
    return {
        cover: item.cover,
        delay: item.delay,
        delayIndex: item.delay ? item.progress : "",
        delayReason: item.delayReason,
        pubIndex: item.delay ? "" : item.progress,
        pubTime: item.pubTime,
        title: item.title,
        url: item.url,
        ...(item.originalTitle ? { originalTitle: item.originalTitle } : {}),
        ...(undefined === item.score ? {} : { score: item.score }),
    };
}

/**
 * 把统一模型转换为周番表的渲染载荷。
 *
 * 只有带播出时刻的来源才按「今天」裁剪：Bangumi 的每日放送本身就是七组星期，
 * 没有「过去几天」的概念，因此始终渲染七天，历史显示设置对它不生效。
 *
 * @param schedule 统一模型
 * @param displayHistory 是否也渲染过去的几天
 * @author sdttttt
 */
export function toWeekDayPayloads(
    schedule: WeeklySchedule,
    displayHistory: boolean
): Array<WeekDayPayload> {
    const days =
        schedule.hasSlots && !displayHistory
            ? fromToday(schedule.days)
            : schedule.days;

    return days.map(day => ({
        date: day.date,
        dayOfWeek: day.dayOfWeek,
        label: toWeekDay(day.dayOfWeek),
        isToday: day.isToday,
        seasons: day.items.map(toSeasonPayload),
        source: schedule.source,
    }));
}

/**
 * 把索引列表转换为渲染载荷。
 *
 * 索引只有 B 站提供，因此这里仍直接消费 B 站的响应类型。
 *
 * @author sdttttt
 */
export function toBangumiPayloads(
    bangumis: Array<Bangumi>
): Array<BangumiPayload> {
    /*
     * 接口异常时可能混进 null 或缺字段的条目：undefined 直达 Webview 会在
     * `bangumi.title.length` 之类的地方抛错，Preact 渲染树整体失败、面板
     * 白屏。没有名字的条目没有展示价值，直接滤掉；其余缺省字段补成空串，
     * 坏一行不能坏一页。
     */
    return bangumis
        .filter(
            (bangumi): bangumi is Bangumi =>
                null !== bangumi &&
                undefined !== bangumi &&
                "object" === typeof bangumi &&
                "string" === typeof bangumi.title
        )
        .map(bangumi => ({
            badge: bangumi.badge ?? "",
            cover: bangumi.cover ?? "",
            finish: 1 === bangumi.is_finish,
            indexShow: bangumi.index_show ?? "",
            link: bangumi.link ?? "",
            order: bangumi.order ?? "",
            title: bangumi.title,
        }));
}
