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
