/**
 * 提醒忽略列表里的一条记录。
 *
 * 只记剧名而不绑定播出时刻：同一部番剧下周换个时段更新，用户当初的「不想被
 * 这部番打扰」依然成立。
 *
 * @author sdttttt
 */
export interface IgnoredReminder {
    /** 被忽略的番剧名，与接口返回的标题完全一致。 */
    readonly title: string;
    /** 写入该记录的时刻，ISO 8601 字符串。 */
    readonly ignoredAt: string;
}

/**
 * 忽略记录的保留时长。
 *
 * 半年按 180 天算：按日历月计算会在闰年与月份长度上绕圈子，而这条规则的
 * 目的只是不让人工写入的列表无限增长。
 *
 * @author sdttttt
 */
export const IGNORED_RETENTION_MS = 180 * 24 * 60 * 60 * 1000;

/**
 * 忽略记录的设置键里，供用户直接阅读的时间格式。
 *
 * @author sdttttt
 */
function stampOf(now: number): string {
    return new Date(now).toISOString();
}

/**
 * 判断一个未知值是否为合法的忽略记录。
 *
 * @author sdttttt
 */
function isEntry(value: unknown): value is IgnoredReminder {
    if (!value || "object" !== typeof value) {
        return false;
    }

    const entry = value as { title?: unknown; ignoredAt?: unknown };

    return (
        "string" === typeof entry.title &&
        "" !== entry.title.trim() &&
        "string" === typeof entry.ignoredAt &&
        !isNaN(Date.parse(entry.ignoredAt))
    );
}

/**
 * 把设置里的未知值收敛成合法列表。
 *
 * 设置项可能被手工编辑，也可能来自旧版本，因此这里丢弃无法解析的项，
 * 并合并同名记录——保留时间最新的那条。
 *
 * @param raw 设置里读到的原始值
 * @returns 合法的忽略列表，顺序按首次出现的位置
 * @author sdttttt
 */
export function normalizeIgnored(raw: unknown): Array<IgnoredReminder> {
    if (!Array.isArray(raw)) {
        return [];
    }

    const byTitle = new Map<string, IgnoredReminder>();

    for (const value of raw) {
        if (!isEntry(value)) {
            continue;
        }

        const title = value.title.trim();
        const known = byTitle.get(title);
        if (
            !known ||
            Date.parse(value.ignoredAt) > Date.parse(known.ignoredAt)
        ) {
            byTitle.set(title, { title, ignoredAt: value.ignoredAt });
        }
    }

    return [...byTitle.values()];
}

/**
 * 标题是否已被忽略。
 *
 * @author sdttttt
 */
export function isIgnoredIn(
    entries: ReadonlyArray<IgnoredReminder>,
    title: string
): boolean {
    return entries.some(entry => entry.title === title);
}

/**
 * 追加忽略记录。
 *
 * 同名记录会被覆盖成新的时刻，而不是并排堆积：列表是一份「要不要提醒」的
 * 判定依据，同一部番剧没有两条记录的语义。
 *
 * @param entries 现有记录
 * @param titles 本次要忽略的番剧名
 * @param now 写入时刻
 * @returns 新的忽略列表
 * @author sdttttt
 */
export function addIgnored(
    entries: ReadonlyArray<IgnoredReminder>,
    titles: ReadonlyArray<string>,
    now: number
): Array<IgnoredReminder> {
    const ignoredAt = stampOf(now);
    const result = [...entries];

    for (const title of titles) {
        const index = result.findIndex(entry => entry.title === title);
        if (0 > index) {
            result.push({ title, ignoredAt });
            continue;
        }
        result[index] = { ...result[index], title, ignoredAt };
    }

    return result;
}

/**
 * 两份列表是否逐项相同。
 *
 * 只比较本模块关心的两个字段：用户在设置里多写几个说明字段，不该让扩展
 * 每次启动都重写一遍文件。
 *
 * @author sdttttt
 */
function sameAs(raw: unknown, kept: ReadonlyArray<IgnoredReminder>): boolean {
    if (!Array.isArray(raw) || raw.length !== kept.length) {
        return false;
    }

    return raw.every((value, index) => {
        const entry = value as Partial<IgnoredReminder> | undefined;

        return (
            entry?.title === kept[index].title &&
            entry?.ignoredAt === kept[index].ignoredAt
        );
    });
}

/**
 * 清理忽略列表：丢弃脏数据与超过保留时长的记录。
 *
 * `changed` 为真时调用方需要把 `kept` 写回设置。没有配置过该项的会话不会
 * 产生任何写入，因此新装扩展不会平白往 `settings.json` 里塞一个空数组。
 *
 * @param raw 设置里读到的原始值
 * @param now 当前时刻
 * @param retentionMs 保留时长，默认半年
 * @author sdttttt
 */
export function pruneIgnored(
    raw: unknown,
    now: number,
    retentionMs: number = IGNORED_RETENTION_MS
): { readonly kept: Array<IgnoredReminder>; readonly changed: boolean } {
    const kept = normalizeIgnored(raw).filter(
        entry => now - Date.parse(entry.ignoredAt) <= retentionMs
    );

    /*
     * 没有配置过该项时不算「变化」：否则新装扩展会在启动时平白写一个空数组
     * 进 settings.json。时钟回拨或手工写入的未来日期都算有效，不能因为
     * 「太新」被删掉。
     */
    const unset = undefined === raw || null === raw;

    return { kept, changed: !unset && !sameAs(raw, kept) };
}
