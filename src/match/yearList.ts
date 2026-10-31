import type { FilterSpec } from "./filterSpec";
import { numberOfStringPlus } from "../utils/strings";

/**
 * 年份筛选提供的选项。
 *
 * @author sdttttt
 */
const CHOICES: ReadonlyArray<string> = [
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2010-2014",
    "2005-2009",
    "2000-2004",
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
