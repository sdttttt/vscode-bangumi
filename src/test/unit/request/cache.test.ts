import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Cache } from "@/request/cache";

describe("Cache", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns undefined for a key that was never set", () => {
        const cache = new Cache<number>(10);

        expect(cache.get("missing")).toBeUndefined();
    });

    it("returns the value before the ttl elapses", () => {
        const cache = new Cache<number>(10);
        cache.set("key", 1);

        vi.advanceTimersByTime(9_999);

        expect(cache.get("key")).toBe(1);
    });

    it("evicts the value once the ttl elapses", () => {
        const cache = new Cache<number>(10);
        cache.set("key", 1);

        vi.advanceTimersByTime(10_000);

        expect(cache.get("key")).toBeUndefined();
    });

    it("keeps the newest value when the same key is written twice", () => {
        const cache = new Cache<number>(10);
        cache.set("key", 1);
        vi.advanceTimersByTime(5_000);

        cache.set("key", 2);
        /* the first timer would fire here and delete the fresh value */
        vi.advanceTimersByTime(5_500);

        expect(cache.get("key")).toBe(2);
    });

    it("expires each key independently", () => {
        const cache = new Cache<string>(10);
        cache.set("early", "a");
        vi.advanceTimersByTime(5_000);
        cache.set("late", "b");

        vi.advanceTimersByTime(5_000);

        expect(cache.get("early")).toBeUndefined();
        expect(cache.get("late")).toBe("b");
    });

    it("drops every entry and pending timer on clear", () => {
        const cache = new Cache<number>(10);
        cache.set("one", 1);
        cache.set("two", 2);

        cache.clear();

        expect(cache.get("one")).toBeUndefined();
        expect(cache.get("two")).toBeUndefined();
        /* a leftover timer must not throw or resurrect anything */
        vi.advanceTimersByTime(20_000);
        expect(cache.get("one")).toBeUndefined();
    });

    it("stores reference types without cloning them", () => {
        const cache = new Cache<{ readonly id: number }>(10);
        const value = { id: 1 };

        cache.set("object", value);

        expect(cache.get("object")).toBe(value);
    });
});
