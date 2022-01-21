import { BangumisData, WeekBangumiData } from "./structure";
/**
 * Cache
 *
 * @class
 * @template T
 * @author sdttttt
 */
export declare class Cache<T = unknown> {
    private readonly caches;
    private readonly timeoutTime;
    constructor(timeoutTime: number);
    /**
     * Get cache
     *
     * @param key
     * @author sdttttt
     */
    get(key: string): T | undefined;
    /**
     * Sets cache
     *
     * @param key
     * @param value
     * @author sdttttt
     */
    set(key: string, value: T): void;
}
export declare const BangumiCache: Cache<BangumisData>;
export declare const WeekBangumiCache: Cache<Array<WeekBangumiData>>;
