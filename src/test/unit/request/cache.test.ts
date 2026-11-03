import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCache } from "@/request/cache";

describe("useCache", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns undefined for a key that was never set", () => {
        const cache = useCache<number>(10);

        expect(cache.get("missing")).toBeUndefined();
    });

    it("returns the value before the ttl elapses", () => {
        const cache = useCache<number>(10);
        cache.set("key", 1);

        vi.advanceTimersByTime(9_999);

        expect(cache.get("key")).toBe(1);
    });

    it("evicts the value once the ttl elapses", () => {
        const cache = useCache<number>(10);
        cache.set("key", 1);

        vi.advanceTimersByTime(10_000);

        expect(cache.get("key")).toBeUndefined();
    });

    it("does not serve an entry whose ttl passed while the timers were idle", () => {
        /*
         * 复现（L14，见 TODO.md）：过期只由定时器驱动——宿主挂起恢复或
         * 事件循环阻塞的窗口内，时钟已越过 TTL 但定时器还没触发，get
         * 不该把过期条目当新鲜货端出来。
         */
        const cache = useCache<number>(1);
        cache.set("key", 1);

        vi.setSystemTime(Date.now() + 5_000);

        expect(cache.get("key")).toBeUndefined();
    });

    it("keeps the newest value when the same key is written twice", () => {
        const cache = useCache<number>(10);
        cache.set("key", 1);
        vi.advanceTimersByTime(5_000);

        cache.set("key", 2);
        /* 旧的定时器本会在这里触发并删掉新值 */
        vi.advanceTimersByTime(5_500);

        expect(cache.get("key")).toBe(2);
    });

    it("expires each key independently", () => {
        const cache = useCache<string>(10);
        cache.set("early", "a");
        vi.advanceTimersByTime(5_000);
        cache.set("late", "b");

        vi.advanceTimersByTime(5_000);

        expect(cache.get("early")).toBeUndefined();
        expect(cache.get("late")).toBe("b");
    });

    it("drops every entry and pending timer on clear", () => {
        const cache = useCache<number>(10);
        cache.set("one", 1);
        cache.set("two", 2);

        cache.clear();

        expect(cache.get("one")).toBeUndefined();
        expect(cache.get("two")).toBeUndefined();
        /* 残留的定时器不得抛错，也不得让条目复活 */
        vi.advanceTimersByTime(20_000);
        expect(cache.get("one")).toBeUndefined();
        expect(vi.getTimerCount()).toBe(0);
    });

    it("stores reference types without cloning them", () => {
        const cache = useCache<{ readonly id: number }>(10);
        const value = { id: 1 };

        cache.set("object", value);

        expect(cache.get("object")).toBe(value);
    });

    it("gives every instance its own storage", () => {
        const first = useCache<number>(10);
        const second = useCache<number>(10);

        first.set("key", 1);

        expect(second.get("key")).toBeUndefined();
    });
});
