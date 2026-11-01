/**
 * 「不再提醒」二级菜单中的一项。
 *
 * 通知本身只提供两个平铺按钮，想要更细的粒度就只能再问一次；QuickPick 是
 * 编辑器里唯一能列出任意多条目的原生形态。
 *
 * @author sdttttt
 */
export interface MuteOption {
    /** QuickPick 中展示的文案，列表内唯一。 */
    readonly label: string;
    /** 忽略单部、忽略整个时段，还是关掉全部提醒。 */
    readonly kind: "titles" | "slot" | "global";
    /** `titles` / `slot` 要写入忽略列表的番剧名。 */
    readonly titles: ReadonlyArray<string>;
}

/**
 * 关闭全部更新提醒的选项文案。
 *
 * 与通知里的「不再提醒」按钮区分开：那一个现在只负责打开这个菜单。
 *
 * @author sdttttt
 */
export const MUTE_GLOBAL_LABEL = "关闭全部番剧的更新提醒";

/**
 * 单部番剧的忽略选项文案。
 *
 * @author sdttttt
 */
export function muteTitleLabel(title: string): string {
    return `不再提醒《${title}》`;
}

/**
 * 整个时段的忽略选项文案。
 *
 * @author sdttttt
 */
export function muteSlotLabel(count: number): string {
    return `该时段 ${count} 部都不再提醒`;
}

/**
 * 构造二级菜单。
 *
 * 只有一部番剧时不出现「该时段」项：它与单部选项完全等价，多一行只会让人犹豫。
 *
 * @param titles 本次提醒里尚未被忽略的番剧名
 * @author sdttttt
 */
export function buildMuteOptions(
    titles: ReadonlyArray<string>
): Array<MuteOption> {
    /*
     * 去重：同一组里理论上可能出现同名条目，而 QuickPick 的选项文案必须唯一，
     * 否则会出现两个一模一样的行。
     */
    const unique = [...new Set(titles)];
    const options: Array<MuteOption> = unique.map(title => ({
        label: muteTitleLabel(title),
        kind: "titles",
        titles: [title],
    }));

    if (1 < unique.length) {
        options.push({
            label: muteSlotLabel(unique.length),
            kind: "slot",
            titles: unique,
        });
    }

    options.push({ label: MUTE_GLOBAL_LABEL, kind: "global", titles: [] });

    return options;
}

/**
 * 把用户选中的文案映射回选项。
 *
 * 取消选择（或选中了已不存在的文案）返回 `undefined`，调用方据此什么都不做。
 *
 * @author sdttttt
 */
export function matchMuteOption(
    options: ReadonlyArray<MuteOption>,
    label: string | undefined
): MuteOption | undefined {
    return options.find(option => option.label === label);
}
