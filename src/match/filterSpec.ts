import type { BangumiQuery } from "../request/query";

/**
 * 索引菜单中的一个筛选项。
 *
 * 筛选是纯数据：它提供的选项，以及每个选项产生的 query 补丁。所有带副作用的
 * 部分——选择框、标签记录、打开列表——都归 `useFilterMenu` 负责。
 *
 * @author sdttttt
 */
export interface FilterSpec {
    /** 菜单文案，例如「地区」。 */
    readonly label: string;
    /** 记录在标签表中的维度，例如 `Area`。 */
    readonly tag: string;
    /** 选择框提供的选项，按菜单顺序排列。 */
    readonly choices: ReadonlyArray<string>;
    /** 纯函数：选中某个选项所对应的筛选条件。 */
    readonly query: (label: string) => Partial<BangumiQuery>;
}

/**
 * 创建选项与 query 取值一一对应的筛选。
 *
 * @param label 菜单文案
 * @param tag 记录在标签表中的维度
 * @param entries 选项与取值的配对，按菜单顺序排列
 * @param key 选中后写入的 query 字段
 * @author sdttttt
 */
export function valueFilter(
    label: string,
    tag: string,
    entries: ReadonlyArray<readonly [string, string]>,
    key: keyof BangumiQuery
): FilterSpec {
    const values = new Map(entries);

    return {
        label,
        tag,
        choices: entries.map(([choice]) => choice),
        query: choice => {
            const value = values.get(choice);
            return undefined === value ? {} : { [key]: value };
        },
    };
}
