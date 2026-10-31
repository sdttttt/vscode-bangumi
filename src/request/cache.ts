import type { BangumisData, WeekBangumiData } from "./structure";

/**
 * 带时效的键值缓存。
 *
 * @author sdttttt
 */
export interface Cache<T> {
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    /** 清空所有条目与待触发的过期定时器。 */
    clear(): void;
}

/**
 * 创建一个条目会自动过期的缓存。
 *
 * 每次写入都会装载自己的定时器，因此覆盖同一个键时寿命也会重置，
 * 不会被上一个定时器把新值删掉。
 *
 * @param timeoutSeconds 条目的存活时长
 * @author sdttttt
 */
export function useCache<T>(timeoutSeconds: number): Cache<T> {
    const timeout = timeoutSeconds * 1000;
    const values = new Map<string, T>();
    const timers = new Map<string, ReturnType<typeof setTimeout>>();

    return {
        get: key => values.get(key),
        set: (key, value) => {
            const previous = timers.get(key);
            if (previous) {
                clearTimeout(previous);
            }

            values.set(key, value);
            timers.set(
                key,
                setTimeout(() => {
                    values.delete(key);
                    timers.delete(key);
                }, timeout)
            );
        },
        clear: () => {
            for (const timer of timers.values()) {
                clearTimeout(timer);
            }
            timers.clear();
            values.clear();
        },
    };
}

/**
 * 一次扩展会话使用的缓存。
 *
 * @author sdttttt
 */
export interface RequestCaches {
    /** 番剧索引各页，缓存十分钟。 */
    readonly bangumi: Cache<BangumisData>;
    /** 周番数据，缓存一分钟。 */
    readonly week: Cache<Array<WeekBangumiData>>;
}
