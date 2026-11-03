import type { FilterSpec } from "./filterSpec";
import { numberOfStringPlus } from "../utils/strings";
import { yearOf } from "../utils/clock";

/**
 * 年份区间档的起点与跨度。
 *
 * 区间固定对齐到 2000 年（`2000-2004`、`2005-2009`…），标签因此不随年份漂移，
 * 同一个选项在任何一年都指同一段区间。
 *
 * @author sdttttt
 */
const BUCKET_ORIGIN = 2000;
const BUCKET_SIZE = 5;

/**
 * 今年往下至少列出的个体年份数。
 *
 * @author sdttttt
 */
const INDIVIDUAL_MIN_COUNT = 6;

/**
 * 个体年份与区间档之后的年代与更早选项，与当前年份无关。
 *
 * @author sdttttt
 */
const NAMED_TAIL: ReadonlyArray<string> = [
    "90年代",
    "80年代",
    "很久很久以前",
];

/**
 * 按接口要求编码左闭右开的年份区间。
 *
 * @author sdttttt
 */
function encodeYear(min: string, max: string): string {
    return encodeURI(`[${min},${max})`);
}

/**
 * 不遵循菜单中 `min-max` 形式的年代选项。
 *
 * @author sdttttt
 */
const NAMED_RANGES: ReadonlyMap<string, readonly [string, string]> = new Map([
    ["90年代", ["1990", "2000"]],
    ["80年代", ["1980", "1990"]],
    ["很久很久以前", ["", "1980"]],
]);

/**
 * 把年份菜单文案转换为请求中的 year 参数。
 *
 * @author sdttttt
 */
export function decodeYear(label: string): string {
    const named = NAMED_RANGES.get(label);
    if (named) {
        return encodeYear(named[0], named[1]);
    }

    const years = label.split("-");
    if (1 < years.length) {
        return encodeYear(years[0], numberOfStringPlus(years[1], 1));
    }

    return encodeYear(label, numberOfStringPlus(label, 1));
}

/**
 * 由给定时刻生成年份菜单。
 *
 * 个体年份从今年往下列，一直列到与区间档网格衔接的年份为止；区间档从那里
 * 继续按五年一档向下生成到 2000，最后接年代档。任何年份下整份菜单都无缝
 * 无重叠：个体覆盖 `[对齐点, 今年]`，区间档覆盖 `[2000, 对齐点)`。
 *
 * @param epochMs 计算「今年」所用时刻
 * @author sdttttt
 */
export function buildYearChoices(epochMs: number): ReadonlyArray<string> {
    const year = yearOf(epochMs);
    const floor = year - INDIVIDUAL_MIN_COUNT + 1;
    const offset =
        (((floor - BUCKET_ORIGIN) % BUCKET_SIZE) + BUCKET_SIZE) % BUCKET_SIZE;
    const aligned = floor - offset;

    const choices: Array<string> = [];
    for (let current = year; current >= aligned; current -= 1) {
        choices.push(String(current));
    }
    for (
        let start = aligned - BUCKET_SIZE;
        start >= BUCKET_ORIGIN;
        start -= BUCKET_SIZE
    ) {
        choices.push(`${start}-${start + BUCKET_SIZE - 1}`);
    }
    choices.push(...NAMED_TAIL);

    return choices;
}

/**
 * 年份筛选提供的选项，按扩展会话加载时的当前年份生成。
 *
 * 会话通常只有几个小时，跨年时菜单落后一年并无实害。
 *
 * @author sdttttt
 */
const CHOICES: ReadonlyArray<string> = buildYearChoices(Date.now());

/**
 * 时间（年份）筛选。
 *
 * @author sdttttt
 */
const yearList: FilterSpec = {
    label: "时间",
    tag: "Year",
    choices: CHOICES,
    query: label => ({ year: decodeYear(label) }),
};

export default yearList;
