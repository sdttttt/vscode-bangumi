import { StatusBarAlignment, window, type StatusBarItem } from "vscode";
import { dayMarker, describeEvent } from "./schedule";
import type { ScheduleEvent } from "./schedule";
import {
    describeSummary,
    describeSummaryLabel,
    describeSummaryTooltip,
    type TodaySummary,
} from "./summary";
import { listTitles } from "../utils/titles";

/**
 * 状态栏悬浮提示中列出的待更新事件数量。
 *
 * @author sdttttt
 */
const TOOLTIP_EVENTS = 3;

/**
 * 提醒的状态栏条目。
 *
 * 条目有两种形态：带播出时刻的「下一场更新」，以及没有时刻时的「今日概览」。
 * 两种形态共用同一个条目实例，切换来源时只是换一份内容。
 *
 * @author sdttttt
 */
export interface StatusBar {
    /** 展示最近的待更新事件；没有待更新事件时隐藏条目。 */
    show(upcoming: ReadonlyArray<ScheduleEvent>, now: number): void;
    /** 展示当天的番剧概览；数据来源没有播出时刻时使用。 */
    showSummary(summary: TodaySummary): void;
    /** 隐藏条目，但保留实例供下一个日程复用。 */
    hide(): void;
    /** 释放条目。 */
    dispose(): void;
}

/**
 * 创建提醒的状态栏条目。
 *
 * 条目是懒创建的，因此创建提醒本身不会触碰编辑器 UI；它随提醒一起释放。
 *
 * @param command 点击条目时执行的命令
 * @author sdttttt
 */
export function useStatusBar(command: string): StatusBar {
    let item: StatusBarItem | undefined;
    let visible = false;

    const ensureItem = (): StatusBarItem => {
        if (!item) {
            item = window.createStatusBarItem(StatusBarAlignment.Right, 100);
            item.name = "Bangumi Open";
            item.command = command;
        }
        return item;
    };

    const hide = (): void => {
        if (!item) {
            return;
        }
        item.hide();
        visible = false;
    };

    /**
     * 写入条目内容，并在首次展示时显示出来。
     */
    const render = (text: string, tooltip: string, label: string): void => {
        const bar = ensureItem();
        bar.text = text;
        bar.tooltip = tooltip;
        bar.accessibilityInformation = { label };

        if (!visible) {
            bar.show();
            visible = true;
        }
    };

    /**
     * 待更新事件的完整标题与时刻。状态栏会截断，悬浮提示不会。
     */
    const buildTooltip = (
        next: ScheduleEvent,
        rest: ReadonlyArray<ScheduleEvent>,
        now: number
    ): string =>
        [next, ...rest.slice(0, TOOLTIP_EVENTS - 1)]
            .map(
                event =>
                    `${dayMarker(event, now)}${event.pubTime} ${listTitles(event.titles)}`
            )
            .join("\n");

    return {
        show: (upcoming, now) => {
            const next = upcoming[0];
            if (!next) {
                hide();
                return;
            }

            render(
                describeEvent(next, now),
                buildTooltip(next, upcoming.slice(1), now),
                `${listTitles(next.titles)} 将于 ${dayMarker(next, now)}${next.pubTime} 更新`
            );
        },
        showSummary: summary =>
            render(
                describeSummary(summary),
                describeSummaryTooltip(summary),
                describeSummaryLabel(summary)
            ),
        hide,
        dispose: () => {
            item?.dispose();
            item = undefined;
            visible = false;
        },
    };
}
