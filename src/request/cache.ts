"use strict";

import { BangumisData, WeekBangumiData } from "./structure";

/**
 * Cache
 * 
 * @class
 * @template T 
 * @author sdttttt
 */
export class Cache<T = any> {

    private readonly caches: Map<string, T>;

    private readonly timeoutTime: number;
    
    constructor(timeoutTime: number) {
    	this.timeoutTime = timeoutTime * 1000;
    	this.caches = new Map<string,T>();
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
    	this.caches.set(key, value);
    	setTimeout(() => {
    		this.caches.delete(key);
    	},this.timeoutTime);
    }
}

export const BangumiCache: Cache<BangumisData> = new Cache(600);

export const WeekBangumiCache: Cache<Array<WeekBangumiData>> = new Cache(60);