import type { BangumisData, WeekBangumiData } from "./structure";

/**
 * A time limited key value store.
 *
 * @author sdttttt
 */
export interface Cache<T> {
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    /** Drops every entry and pending expiry timer. */
    clear(): void;
}

/**
 * Creates a cache whose entries expire on their own.
 *
 * Every write arms its own timer, so overwriting a key also resets its lifetime
 * instead of letting the previous timer delete the fresh value.
 *
 * @param timeoutSeconds lifetime of an entry
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
 * The caches of one extension session.
 *
 * @author sdttttt
 */
export interface RequestCaches {
    /** Ten minutes of bangumi index pages. */
    readonly bangumi: Cache<BangumisData>;
    /** One minute of weekly schedules. */
    readonly week: Cache<Array<WeekBangumiData>>;
}
