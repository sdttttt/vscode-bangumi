/**
 * 通知中最多列出多少个标题，超出后收敛为数量。
 *
 * @author sdttttt
 */
export const MAX_NOTIFICATION_TITLES = 3;

/**
 * 紧凑的标题列表，例如 `《甲》、《乙》` 或 `《甲》等 5 部`。
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
 * 全角中日韩字符或 emoji 占用的半角列数。
 *
 * @author sdttttt
 */
const WIDE_COLUMNS = 2;

/**
 * 判断某个码点在等宽界面中是否渲染为两列宽。
 *
 * 覆盖中日韩、谚文、全角与 emoji 区段。这里没必要引入精确的东亚宽度表：
 * 目标只是让条目宽度稳定，而不是精确测量屏幕上的宽度。
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
 * 字符串在等宽界面中占用的列数。
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
 * 把文本裁剪到给定的列数预算内，并保证落在码点边界上。
 *
 * 按码点遍历而不是用 `slice`，可以保持代理对与组合字符完整，
 * 标题因此不会以残缺字符结尾。
 *
 * @author sdttttt
 */
export function truncateToColumns(text: string, maxColumns: number): string {
    if (displayColumns(text) <= maxColumns) {
        return text;
    }

    /* 预留一列给省略号。 */
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
 * 分组的全部标题，带书名号，不做收敛。
 *
 * 状态栏必须保持简短，长分组会被收敛；悬浮提示则有空间容纳整个列表。
 *
 * @author sdttttt
 */
export function listTitles(titles: ReadonlyArray<string>): string {
    return titles.map(title => `《${title}》`).join("、");
}
