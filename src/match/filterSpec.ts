import type { BangumiQuery } from "../request/query";

/**
 * One entry of the index menu.
 *
 * A filter is pure data: the labels it offers and the query patch each label
 * produces. Everything with a side effect — the quick pick, the tag bookkeeping,
 * opening the list — belongs to `useFilterMenu`.
 *
 * @author sdttttt
 */
export interface FilterSpec {
    /** Menu label, e.g. "地区". */
    readonly label: string;
    /** Dimension recorded in the tag map, e.g. "Area". */
    readonly tag: string;
    /** Labels offered by the quick pick, in menu order. */
    readonly choices: ReadonlyArray<string>;
    /** Pure: the filters a picked label selects. */
    readonly query: (label: string) => Partial<BangumiQuery>;
}

/**
 * Builds a filter whose labels map one to one onto query values.
 *
 * @param label menu label
 * @param tag dimension recorded in the tag map
 * @param entries label / value pairs, in menu order
 * @param key query field written by the pick
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
