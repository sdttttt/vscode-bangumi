import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { probeOf, RETRY_DELAYS_MS, useAvailability } from "@/availability";

/**
 * 创建被测对象，并记录恢复回调。
 *
 * @author sdttttt
 */
function makeAvailability(
    probe: () => Promise<{ bangumi: boolean; bilibili: boolean }>
) {
    const onRecovered = vi.fn();
    const availability = useAvailability({ probe, onRecovered });

    return { availability, onRecovered };
}

/**
 * 探测节奏的最后一档，用于断言「之后固定为这个间隔」。
 *
 * @author sdttttt
 */
const LAST_DELAY = RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];

describe("useAvailability", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("does not treat unknown sources as unavailable", () => {
        const { availability } = makeAvailability(() =>
            Promise.resolve({ bangumi: true, bilibili: true })
        );

        expect(availability.isDown()).toBe(false);
    });

    it("stays up while one source still works", () => {
        const { availability } = makeAvailability(() =>
            Promise.resolve({ bangumi: true, bilibili: true })
        );

        availability.report("bangumi", false);
        expect(availability.isDown()).toBe(false);

        availability.report("bilibili", true);
        expect(availability.isDown()).toBe(false);
    });

    it("goes down once both sources have failed", () => {
        const { availability } = makeAvailability(() =>
            Promise.resolve({ bangumi: true, bilibili: true })
        );

        availability.report("bangumi", false);
        availability.report("bilibili", false);

        expect(availability.isDown()).toBe(true);
    });

    it("notifies the change only once per transition", () => {
        const { availability } = makeAvailability(() =>
            Promise.resolve({ bangumi: true, bilibili: true })
        );
        const listener = vi.fn();
        availability.onDidChange(listener);

        availability.report("bangumi", false);
        availability.report("bilibili", false);
        availability.report("bangumi", false);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(true);
    });

    it("probes on the configured schedule after going down", async () => {
        const probe = vi.fn(() =>
            Promise.resolve({ bangumi: false, bilibili: false })
        );
        const { availability } = makeAvailability(probe);

        availability.report("bangumi", false);
        availability.report("bilibili", false);
        expect(probe).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(RETRY_DELAYS_MS[0]);
        expect(probe).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(RETRY_DELAYS_MS[1]);
        expect(probe).toHaveBeenCalledTimes(2);

        /* 后面的档位固定为最后一档。 */
        await vi.advanceTimersByTimeAsync(LAST_DELAY);
        expect(probe).toHaveBeenCalledTimes(3);
        await vi.advanceTimersByTimeAsync(LAST_DELAY);
        expect(probe).toHaveBeenCalledTimes(4);
    });

    it("recovers when a probe reaches one source again", async () => {
        const probe = vi.fn(() =>
            Promise.resolve({ bangumi: true, bilibili: false })
        );
        const { availability, onRecovered } = makeAvailability(probe);
        const listener = vi.fn();
        availability.onDidChange(listener);

        availability.report("bangumi", false);
        availability.report("bilibili", false);
        listener.mockClear();

        await vi.advanceTimersByTimeAsync(RETRY_DELAYS_MS[0]);

        expect(availability.isDown()).toBe(false);
        expect(listener).toHaveBeenCalledWith(false);
        expect(onRecovered).toHaveBeenCalledTimes(1);
    });

    it("keeps probing when the probe itself rejects", async () => {
        const probe = vi
            .fn()
            .mockRejectedValueOnce(new Error("offline"))
            .mockResolvedValue({ bangumi: true, bilibili: true });
        const { availability, onRecovered } = makeAvailability(probe);

        availability.report("bangumi", false);
        availability.report("bilibili", false);

        await vi.advanceTimersByTimeAsync(RETRY_DELAYS_MS[0]);
        expect(availability.isDown()).toBe(true);

        await vi.advanceTimersByTimeAsync(RETRY_DELAYS_MS[1]);
        expect(availability.isDown()).toBe(false);
        expect(onRecovered).toHaveBeenCalledTimes(1);
    });

    it("stops probing once disposed", async () => {
        const probe = vi.fn(() =>
            Promise.resolve({ bangumi: false, bilibili: false })
        );
        const { availability } = makeAvailability(probe);

        availability.report("bangumi", false);
        availability.report("bilibili", false);
        availability.dispose();

        await vi.advanceTimersByTimeAsync(LAST_DELAY);

        expect(probe).not.toHaveBeenCalled();
    });

    it("ignores reports after dispose", () => {
        const { availability } = makeAvailability(() =>
            Promise.resolve({ bangumi: true, bilibili: true })
        );

        availability.dispose();
        availability.report("bangumi", false);
        availability.report("bilibili", false);

        expect(availability.isDown()).toBe(false);
    });
});

describe("probeOf", () => {
    it("reports both sources as available when both resolve", async () => {
        const probe = probeOf({
            bangumi: () => Promise.resolve([]),
            bilibili: () => Promise.resolve([]),
        });

        await expect(probe()).resolves.toEqual({
            bangumi: true,
            bilibili: true,
        });
    });

    it("treats undefined as a failure", async () => {
        const probe = probeOf({
            bangumi: () => Promise.resolve(undefined),
            bilibili: () => Promise.resolve([]),
        });

        await expect(probe()).resolves.toEqual({
            bangumi: false,
            bilibili: true,
        });
    });

    it("treats a rejection as a failure", async () => {
        const probe = probeOf({
            bangumi: () => Promise.reject(new Error("offline")),
            bilibili: () => Promise.resolve([]),
        });

        await expect(probe()).resolves.toEqual({
            bangumi: false,
            bilibili: true,
        });
    });
});
