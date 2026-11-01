import type { WeeklySchedule } from "../request/schedule";
import { listTitles, truncateToColumns } from "../utils/titles";
import { STATUS_BAR_NAME_COLUMNS } from "./schedule";

/**
 * 状态栏中展示的当日概览。
 *
 * Bangumi 没有播出时刻，既不能算出提醒事件，也画不出倒计时；它能提供的是
 * 「今天有哪些番剧更新」，因此该模式下状态栏改为展示这份概览。
 *
 * @export
 * @interface TodaySummary
 * @author sdttttt
 */
export interface TodaySummary {
    /** 当天的 `月-日`，按 UTC+8 计算。 */
    readonly date: string;
    /** 当天更新的番剧标题，按来源给出的顺序排列。 */
    readonly titles: ReadonlyArray<string>;
}

/**
 * 概览使用的图标。
 *
 * 与提醒条目的时钟图标区分开：这个条目不带时刻，看的是「今天有什么」。
 *
 * @author sdttttt
 */
export const SUMMARY_ICON = "$(calendar)";

/**
 * 当天没有任何番剧时的文案。
 *
 * Bangumi 的日历总是覆盖七天，因此「没有更新」本身是一条有意义的信息，
 * 不像提醒那样应当整条隐藏。
 *
 * @author sdttttt
 */
export const SUMMARY_EMPTY_TEXT = "今日没有更新";

/**
 * 悬浮提示中最多列出的番剧数量。
 *
 * 周六、周日常有二十部以上，全部列出会让提示长到无法阅读；超出的部分收敛为数量。
 *
 * @author sdttttt
 */
export const SUMMARY_TOOLTIP_TITLES = 10;

/**
 * 取出日程中当天的概览。
 *
 * 纯函数：来源的 `isToday` 已经由适配器按 UTC+8 算好，这里不再做日期运算。
 *
 * @param schedule 统一模型
 * @returns 当天存在时返回概览，否则返回 `undefined`
 * @author sdttttt
 */
export function summarizeToday(
    schedule: WeeklySchedule
): TodaySummary | undefined {
    const day = schedule.days.find(other => other.isToday);

    return day
        ? { date: day.date, titles: day.items.map(item => item.title) }
        : undefined;
}

/**
 * 概览在状态栏中的文本。
 *
 * 只有一部时直接写剧名，多了才收敛为数量：状态栏很窄，单部番剧的名字比
 * 「1部番」有用得多。
 *
 * @author sdttttt
 */
export function describeSummary(summary: TodaySummary): string {
    const { titles } = summary;

    if (0 === titles.length) {
        return `${SUMMARY_ICON} ${SUMMARY_EMPTY_TEXT}`;
    }

    const name =
        1 === titles.length
            ? truncateToColumns(titles[0], STATUS_BAR_NAME_COLUMNS)
            : `${titles.length}部番`;

    return `${SUMMARY_ICON} 今日 ${name}`;
}

/**
 * 概览的悬浮提示：日期加当天更新的番剧列表。
 *
 * @author sdttttt
 */
export function describeSummaryTooltip(summary: TodaySummary): string {
    const head = `今日（${summary.date}）`;

    if (0 === summary.titles.length) {
        return head;
    }

    const shown = summary.titles.slice(0, SUMMARY_TOOLTIP_TITLES);
    const rest = summary.titles.length - shown.length;
    const list = listTitles(shown);

    return `${head}\n${0 === rest ? list : `${list} 等 ${summary.titles.length} 部`}`;
}

/**
 * 概览的无障碍标签。
 *
 * 状态栏文本为宽度而缩写，这里给出完整句子的读法。
 *
 * @author sdttttt
 */
export function describeSummaryLabel(summary: TodaySummary): string {
    const { titles } = summary;

    return 0 === titles.length
        ? `今日（${summary.date}）没有番剧更新`
        : `今日（${summary.date}）有 ${titles.length} 部番剧更新：${listTitles(titles)}`;
}
