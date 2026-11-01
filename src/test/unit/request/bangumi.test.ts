import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getJson } from "@/request/http";
import { buildBangumiUrl, DEFAULT_QUERY } from "@/request/bilibili/query";
import { useBilibiliApi, type BilibiliApi } from "@/request/bilibili/api";
import { useCache } from "@/request/cache";
import { createNotifierStub, type NotifierStub } from "@/test/mocks/ports";
import { bangumisData } from "@/test/mocks/fixtures/bangumi";
import { weekBangumi } from "@/test/mocks/fixtures/weekBangumi";

vi.mock("@/request/http", () => ({
    getJson: vi.fn(),
}));

describe("getAllBangumi", () => {
    let api: BilibiliApi;
    let notifier: NotifierStub;

    beforeEach(() => {
        notifier = createNotifierStub();
        api = useBilibiliApi(
            {
                bangumi: useCache(600),
                week: useCache(60),
                calendar: useCache(3600),
            },
            notifier.notifier
        );
    });

    afterEach(() => {
        vi.mocked(getJson).mockReset();
    });

    it("returns the data of a valid response", async () => {
        const payload = bangumisData();
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            data: payload,
        });

        await expect(
            api.getAllBangumi(buildBangumiUrl(DEFAULT_QUERY, 1))
        ).resolves.toEqual(payload);
    });

    it("requests the url produced by the builder", async () => {
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            data: bangumisData(),
        });

        const url = buildBangumiUrl(DEFAULT_QUERY, 2);
        await api.getAllBangumi(url);

        expect(getJson).toHaveBeenCalledWith(url);
    });

    it("serves the second identical call from the cache", async () => {
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            data: bangumisData(),
        });

        const url = buildBangumiUrl(DEFAULT_QUERY, 1);
        await api.getAllBangumi(url);
        await api.getAllBangumi(url);

        expect(getJson).toHaveBeenCalledTimes(1);
    });

    it("requests the network again for a different url", async () => {
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            data: bangumisData(),
        });

        await api.getAllBangumi(buildBangumiUrl(DEFAULT_QUERY, 1));
        await api.getAllBangumi(buildBangumiUrl(DEFAULT_QUERY, 2));

        expect(getJson).toHaveBeenCalledTimes(2);
    });

    it("returns undefined without caching when the response is not valid", async () => {
        vi.mocked(getJson).mockResolvedValue({
            code: -404,
            message: "boom",
            data: { has_next: 0, list: [] },
        });

        await expect(
            api.getAllBangumi(buildBangumiUrl(DEFAULT_QUERY, 1))
        ).resolves.toBeUndefined();

        await api.getAllBangumi(buildBangumiUrl(DEFAULT_QUERY, 1));
        expect(getJson).toHaveBeenCalledTimes(2);
    });

    it("propagates a network failure", async () => {
        vi.mocked(getJson).mockRejectedValue(new Error("timeout"));

        await expect(
            api.getAllBangumi(buildBangumiUrl(DEFAULT_QUERY, 1))
        ).rejects.toThrow("timeout");
    });
});

describe("getWeekBangumi", () => {
    let api: BilibiliApi;
    let notifier: NotifierStub;

    beforeEach(() => {
        notifier = createNotifierStub();
        api = useBilibiliApi(
            {
                bangumi: useCache(600),
                week: useCache(60),
                calendar: useCache(3600),
            },
            notifier.notifier
        );
    });

    afterEach(() => {
        vi.mocked(getJson).mockReset();
        notifier.info.mockClear();
    });

    it("returns the schedule of a valid response", async () => {
        const payload = weekBangumi();
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            result: payload,
        });

        await expect(api.getWeekBangumi()).resolves.toEqual(payload);
    });

    it("serves the second call from the cache", async () => {
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            result: weekBangumi(),
        });

        await api.getWeekBangumi();
        await api.getWeekBangumi();

        expect(getJson).toHaveBeenCalledTimes(1);
    });

    it("warns the user and returns undefined for an empty schedule", async () => {
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            result: [],
        });

        await expect(api.getWeekBangumi()).resolves.toBeUndefined();

        expect(notifier.info).toHaveBeenCalledWith("咦？没有找到番剧时间表……");
    });

    it("does not cache an empty schedule", async () => {
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            result: [],
        });

        await api.getWeekBangumi();
        await api.getWeekBangumi();

        expect(getJson).toHaveBeenCalledTimes(2);
    });

    it("reports a network failure instead of rejecting", async () => {
        vi.mocked(getJson).mockRejectedValue(new Error("timeout"));

        await expect(api.getWeekBangumi()).resolves.toBeUndefined();
        expect(notifier.info).toHaveBeenCalledWith("咦？没有找到番剧时间表……");
    });

    it("returns undefined for an unsuccessful response", async () => {
        vi.mocked(getJson).mockResolvedValue({
            code: -500,
            message: "boom",
            result: weekBangumi(),
        });

        await expect(api.getWeekBangumi()).resolves.toBeUndefined();
    });
});
