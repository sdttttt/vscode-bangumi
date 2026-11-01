import { describe, expect, it, vi } from "vitest";
import { createBangumiApi, type Sources } from "@/request";
import { bangumisData } from "@/test/mocks/fixtures/bangumi";
import { bgmCalendar } from "@/test/mocks/fixtures/bgm";
import { weekBangumi } from "@/test/mocks/fixtures/weekBangumi";
import { buildBangumiUrl, DEFAULT_QUERY } from "@/request/bilibili/query";

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

describe("createBangumiApi", () => {
    it("forwards the index url to the bilibili implementation", async () => {
        const sources = makeSources();
        const page = bangumisData();
        vi.mocked(sources.bilibili.getAllBangumi).mockResolvedValue(page);
        const api = createBangumiApi(sources);
        const url = buildBangumiUrl(DEFAULT_QUERY, 2);

        await expect(api.getIndexPage(url)).resolves.toEqual(page);
        expect(sources.bilibili.getAllBangumi).toHaveBeenCalledWith(url);
    });

    it("hands the bilibili week over to the adapter", async () => {
        const sources = makeSources();
        vi.mocked(sources.bilibili.getWeekBangumi).mockResolvedValue(
            weekBangumi()
        );
        const api = createBangumiApi(sources);

        const schedule = await api.getBilibiliSchedule();

        expect(schedule?.source).toBe("bilibili");
        expect(schedule?.days).toHaveLength(7);
    });

    it("returns undefined when the bilibili week is missing", async () => {
        const sources = makeSources();
        vi.mocked(sources.bilibili.getWeekBangumi).mockResolvedValue(undefined);
        const api = createBangumiApi(sources);

        await expect(api.getBilibiliSchedule()).resolves.toBeUndefined();
    });

    it("hands the calendar over to the adapter", async () => {
        const sources = makeSources();
        vi.mocked(sources.bgmtv.getCalendar).mockResolvedValue(bgmCalendar());
        const api = createBangumiApi(sources);

        const schedule = await api.getBgmTvSchedule();

        expect(schedule?.source).toBe("bangumi");
        expect(schedule?.hasSlots).toBe(false);
        expect(schedule?.days).toHaveLength(7);
    });

    it("returns undefined when the calendar is missing", async () => {
        const sources = makeSources();
        vi.mocked(sources.bgmtv.getCalendar).mockResolvedValue(undefined);
        const api = createBangumiApi(sources);

        await expect(api.getBgmTvSchedule()).resolves.toBeUndefined();
    });
});
