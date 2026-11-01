import { useEffect, useState } from "preact/hooks";
import type { SeasonPayload } from "@shared/webview/protocol";

/**
 * 一天中的一个更新时段。
 *
 * @author sdttttt
 */
export interface SeasonGroup {
    pubTime: string;
    seasons: Array<SeasonPayload>;
}

/**
 * 「你在这里」标记的刷新频率。
 *
 * 标记一分钟才移动一次，因此每分钟轮询两次既保证准确，又不会让 Webview 醒得太频繁。
 *
 * @author sdttttt
 */
export const NOW_TICK_MS = 30_000;

/**
 * 画在当前时刻标记中的文案。
 *
 * @author sdttttt
 */
export const NOW_LABEL = "你在这里~";

/**
 * 当天所有时段都已播出后，标记显示的后缀。
 *
 * @author sdttttt
 */
export const NOW_DONE_LABEL = "今日已播完";

/**
 * 当天没有任何更新时段时，标记显示的后缀。
 *
 * @author sdttttt
 */
export const NOW_EMPTY_LABEL = "今日没有更新";

/**
 * `HH:MM` 更新时段对应的当天分钟数。
 *
 * @returns 分钟数；时段格式不合法时返回 `undefined`
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
 * 「你在这里」标记应当画在哪个时段之前。
 *
 * `0` 表示当前时间早于所有时段，`groups.length` 表示晚于最后一个时段。
 * 无法解析的时段会终止扫描，因此格式错误的条目不会把标记推到仍在等待的时段之下。
 *
 * 正好在当前分钟播出的时段算作已播出，标记因此停留在读者正在看的那一组，
 * 而不会跳到它上面。
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
 * 距离当前时刻之后最近一个时段的剩余分钟数。
 *
 * 当天没有这样的时段时返回 `undefined`，这发生在最后一场更新播出之后，
 * 或者当天没有任何更新的时候。
 *
 * @author sdttttt
 */
export function nextGapMinutes(
    groups: ReadonlyArray<SeasonGroup>,
    nowMinute: number
): number | undefined {
    /*
     * 扫描从标记所在的位置开始，因此正在这一分钟播出的时段算作已播出：
     * 倒计时始终指向标记下方，而不是紧挨着它的上一行。
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
 * 标记中便于阅读的倒计时文案。
 *
 * 不足一小时时只写分钟；超过一小时则先写小时，数字一眼就能看清。
 * 两种写法都带上单位，因为在 `HH:MM` 时段旁边，光秃秃的 `2:05` 会被当成时刻。
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
 * 「你在这里」标记需要展示的倒计时文案。
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
 * 当前时刻，`active` 为真时每隔 {@link NOW_TICK_MS} 走动一次。
 *
 * 只有当天会订阅：其余六列是静态的，不应在标记每次移动时重新渲染。
 * 传入固定的 `pinned` 值会跳过定时器，测试因此可以把标记冻结在某一分钟上。
 *
 * @author sdttttt
 */
export function useNow(pinned: number | undefined, active: boolean): number {
    const [tick, setTick] = useState(() => Date.now());

    useEffect(() => {
        if (undefined !== pinned || !active) {
            return;
        }

        const update = (): void => setTick(Date.now());
        const timer = setInterval(update, NOW_TICK_MS);

        /*
         * 隐藏的面板会被 Chromium 降频，机器挂起时定时器更是完全停止。
         * 回到前台时重新读一次时钟，可以让标记立刻归位，而不是最多晚半分钟。
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
 * 按更新时间把一天的番剧分组，并保持原有顺序。
 *
 * 接口已经按 `pub_time` 排好序，因此一趟遍历即可，相邻的分组也会保持相邻。
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
