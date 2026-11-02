import { describe, expect, it, vi } from "vitest";
import { createBangumiApi, type Sources } from "@/request";
import { bangumisData } from "@/test/mocks/fixtures/bangumi";
import { bgmCalendar } from "@/test/mocks/fixtures/bgm";
import { weekBangumi } from "@/test/mocks/fixtures/weekBangumi";
import { buildBangumiUrl, DEFAULT_QUERY } from "@/request/bilibili/query";
import { createAvailabilityStub } from "@/test/mocks/ports";

/**
 * 两个来源的替身。
 *
 * @author sdttttt
 */
function makeSources(): Sources {
    return {
        bilibili: { getAllBangumi: vi.fn(), getWeekBangumi: vi.fn() },
        bgmtv: { getCalendar: vi.fn() },
    };
}

/**
 * 建好接口与可用性替身。
 *
 * @author sdttttt
 */
function makeApi(sources: Sources = makeSources()) {
    const availability = createAvailabilityStub();

    return {
        sources,
        availability,
        api: createBangumiApi(sources, availability.availability),
    };
}

describe("createBangumiApi", () => {
    it("forwards the index url to the bilibili implementation", async () => {
        const { sources, api } = makeApi();
        const page = bangumisData();
        vi.mocked(sources.bilibili.getAllBangumi).mockResolvedValue(page);
        const url = buildBangumiUrl(DEFAULT_QUERY, 2);

        await expect(api.getIndexPage(url)).resolves.toEqual(page);
        expect(sources.bilibili.getAllBangumi).toHaveBeenCalledWith(url);
    });

    it("hands the bilibili week over to the adapter", async () => {
        const { sources, api } = makeApi();
        vi.mocked(sources.bilibili.getWeekBangumi).mockResolvedValue(
            weekBangumi()
        );

        const schedule = await api.getBilibiliSchedule();

        expect(schedule?.source).toBe("bilibili");
        expect(schedule?.days).toHaveLength(7);
    });

    it("returns undefined when the bilibili week is missing", async () => {
        const { sources, api } = makeApi();
        vi.mocked(sources.bilibili.getWeekBangumi).mockResolvedValue(undefined);

        await expect(api.getBilibiliSchedule()).resolves.toBeUndefined();
    });

    it("hands the calendar over to the adapter", async () => {
        const { sources, api } = makeApi();
        vi.mocked(sources.bgmtv.getCalendar).mockResolvedValue(bgmCalendar());

        const schedule = await api.getBgmTvSchedule();

        expect(schedule?.source).toBe("bangumi");
        expect(schedule?.hasSlots).toBe(false);
        expect(schedule?.days).toHaveLength(7);
    });

    it("returns undefined when both sources are missing", async () => {
        const { sources, api } = makeApi();
        vi.mocked(sources.bgmtv.getCalendar).mockResolvedValue(undefined);
        vi.mocked(sources.bilibili.getWeekBangumi).mockResolvedValue(undefined);

        await expect(api.getBgmTvSchedule()).resolves.toBeUndefined();
    });

    it("falls back to the bilibili week when the calendar is missing", async () => {
        const { sources, api } = makeApi();
        vi.mocked(sources.bgmtv.getCalendar).mockResolvedValue(undefined);
        vi.mocked(sources.bilibili.getWeekBangumi).mockResolvedValue(
            weekBangumi()
        );

        const schedule = await api.getBgmTvSchedule();

        expect(schedule?.source).toBe("bilibili");
        expect(schedule?.hasSlots).toBe(true);
    });

    it("does not fall back from the bilibili source", async () => {
        const { sources, api } = makeApi();
        vi.mocked(sources.bilibili.getWeekBangumi).mockResolvedValue(undefined);
        vi.mocked(sources.bgmtv.getCalendar).mockResolvedValue(bgmCalendar());

        await expect(api.getBilibiliSchedule()).resolves.toBeUndefined();
        expect(sources.bgmtv.getCalendar).not.toHaveBeenCalled();
    });

    it("reports both sources to the availability", async () => {
        const { sources, availability, api } = makeApi();
        vi.mocked(sources.bgmtv.getCalendar).mockResolvedValue(undefined);
        vi.mocked(sources.bilibili.getWeekBangumi).mockResolvedValue(undefined);

        await api.getBgmTvSchedule();

        expect(availability.reports).toEqual([
            { source: "bangumi", ok: false },
            { source: "bilibili", ok: false },
        ]);
        expect(availability.isDown()).toBe(true);
    });

    it("reports a recovered calendar without touching the fallback", async () => {
        const { sources, availability, api } = makeApi();
        vi.mocked(sources.bgmtv.getCalendar).mockResolvedValue(bgmCalendar());

        await api.getBgmTvSchedule();

        expect(availability.reports).toEqual([{ source: "bangumi", ok: true }]);
        expect(sources.bilibili.getWeekBangumi).not.toHaveBeenCalled();
    });
});
