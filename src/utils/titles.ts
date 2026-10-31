/**
 * How many titles a notification lists before collapsing into a count.
 *
 * @author sdttttt
 */
export const MAX_NOTIFICATION_TITLES = 3;

/**
 * Compact title list, e.g. `《甲》、《乙》` or `《甲》等 5 部`.
 *
 * @author sdttttt
 */
export function describeTitles(titles: ReadonlyArray<string>): string {
    const quoted = titles
        .slice(0, MAX_NOTIFICATION_TITLES)
        .map(title => `《${title}》`);
    const rest = titles.length - quoted.length;
    const head = quoted.join("、");
    return 0 < rest ? `${head}等 ${titles.length} 部` : head;
}

/**
 * Half width columns taken by a full width CJK / emoji character.
 *
 * @author sdttttt
 */
const WIDE_COLUMNS = 2;

/**
 * Whether a code point is rendered two columns wide in a monospace UI.
 *
 * Covers the CJK, Hangul, full width and emoji blocks. A precise East Asian
 * width table is not worth its weight here: the goal is a stable entry, not an
 * exact on-screen measurement.
 *
 * @author sdttttt
 */
function isWide(char: string): boolean {
    const code = char.codePointAt(0) ?? 0;
    return (
        (0x1100 <= code && 0x115f >= code) ||
        (0x2e80 <= code && 0xa4cf >= code) ||
        (0xac00 <= code && 0xd7a3 >= code) ||
        (0xf900 <= code && 0xfaff >= code) ||
        (0xfe30 <= code && 0xfe6f >= code) ||
        (0xff00 <= code && 0xff60 >= code) ||
        (0xffe0 <= code && 0xffe6 >= code) ||
        (0x1f300 <= code && 0x1faff >= code)
    );
}

/**
 * Columns taken by a string in a monospace UI.
 *
 * @author sdttttt
 */
export function displayColumns(text: string): number {
    let columns = 0;
    for (const char of text) {
        columns += isWide(char) ? WIDE_COLUMNS : 1;
    }
    return columns;
}

/**
 * Shortens text to a column budget, on a code point boundary.
 *
 * Iterating code points instead of `slice` keeps surrogate pairs and combining
 * marks intact, so a title never ends with a broken character.
 *
 * @author sdttttt
 */
export function truncateToColumns(text: string, maxColumns: number): string {
    if (displayColumns(text) <= maxColumns) {
        return text;
    }

    /* One column is reserved for the ellipsis. */
    const budget = Math.max(0, maxColumns - 1);
    let columns = 0;
    let result = "";

    for (const char of text) {
        const width = isWide(char) ? WIDE_COLUMNS : 1;
        if (columns + width > budget) {
            break;
        }
        result += char;
        columns += width;
    }

    return `${result}…`;
}

/**
 * Every title of a group, quoted, without collapsing.
 *
 * The status bar has to stay short, so it collapses long groups; a tooltip has
 * room for the whole list.
 *
 * @author sdttttt
 */
export function listTitles(titles: ReadonlyArray<string>): string {
    return titles.map(title => `《${title}》`).join("、");
}
