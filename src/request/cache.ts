"use strict";

import { BangumisData, WeekBangumiData } from "./structure";

/**
 * Cache
 *
 * @class
 * @template T
 * @author sdttttt
 */
export class Cache<T = unknown> {
    private readonly caches: Map<string, T>;

    private readonly timers: Map<string, NodeJS.Timeout>;

    private readonly timeoutTime: number;

    constructor(timeoutTime: number) {
        this.timeoutTime = timeoutTime * 1000;
        this.caches = new Map<string, T>();
        this.timers = new Map<string, NodeJS.Timeout>();
    }

    /**
     * Get cache
     *
     * @param key
     * @author sdttttt
     */
    get(key: string): T | undefined {
        return this.caches.get(key);
    }

    /**
     * Sets cache
     *
     * @param key
     * @param value
     * @author sdttttt
     */
    set(key: string, value: T): void {
        const previous: NodeJS.Timeout | undefined = this.timers.get(key);
        if (previous) {
            clearTimeout(previous);
        }

        this.caches.set(key, value);
        /* 覆盖写入时必须重建计时器，否则旧计时器会提前删掉新值 */
        const timer: NodeJS.Timeout = setTimeout(() => {
            this.caches.delete(key);
            this.timers.delete(key);
        }, this.timeoutTime);
        this.timers.set(key, timer);
    }

    /**
     * Drops every entry and pending expiry timer.
     *
     * @author sdttttt
     */
    clear(): void {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
        this.caches.clear();
    }
}

export const BangumiCache: Cache<BangumisData> = new Cache(600);

export const WeekBangumiCache: Cache<Array<WeekBangumiData>> = new Cache(60);
