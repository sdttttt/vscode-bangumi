import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getJson } from "@/request/http";
import { buildBangumiUrl, DEFAULT_QUERY } from "@/request/bilibili/query";
import { createBilibiliApi, type BilibiliApi } from "@/request/bilibili/api";
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
        api = createBilibiliApi(
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

    it("returns undefined and reports when the request fails", async () => {
        vi.mocked(getJson).mockRejectedValue(new Error("timeout"));

        await expect(
            api.getAllBangumi(buildBangumiUrl(DEFAULT_QUERY, 1))
        ).resolves.toBeUndefined();

        expect(notifier.info).toHaveBeenCalledOnce();

        /*
         * 失败的响应不该被缓存：把网络恢复后的正常响应喂回去，
         * 下一次调用应当重新走网络。
         */
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            data: bangumisData(),
        });

        await expect(
            api.getAllBangumi(buildBangumiUrl(DEFAULT_QUERY, 1))
        ).resolves.toEqual(bangumisData());
        expect(getJson).toHaveBeenCalledTimes(2);
    });

    it("returns undefined without reporting when the data field is missing", async () => {
        vi.mocked(getJson).mockResolvedValue({ code: 0, message: "success" });

        await expect(
            api.getAllBangumi(buildBangumiUrl(DEFAULT_QUERY, 1))
        ).resolves.toBeUndefined();

        /*
         * 成功码但缺 data 是服务端的形态异常：响应按不可用处理，
         * 但不打「B 站服务异常」的文案（那只留给非成功码）。
         */
        expect(notifier.info).not.toHaveBeenCalled();
    });

    it("shares one request between concurrent calls for the same url", async () => {
        /*
         * 复现（L13，见 TODO.md）：午夜 rollover 的提醒刷新与用户打开面板
         * 并发时，同一地址此前会发两次请求、写两次缓存。
         */
        let resolveJson: (value: unknown) => void = () => undefined;
        vi.mocked(getJson).mockReturnValue(
            new Promise(resolve => {
                resolveJson = resolve;
            })
        );
        const url = buildBangumiUrl(DEFAULT_QUERY, 1);

        const first = api.getAllBangumi(url);
        const second = api.getAllBangumi(url);

        resolveJson({ code: 0, message: "success", data: bangumisData() });
        await Promise.all([first, second]);

        expect(getJson).toHaveBeenCalledTimes(1);
    });
});

describe("getWeekBangumi", () => {
    let api: BilibiliApi;
    let notifier: NotifierStub;

    beforeEach(() => {
        notifier = createNotifierStub();
        api = createBilibiliApi(
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

    it("returns undefined without reporting for an empty schedule", async () => {
        vi.mocked(getJson).mockResolvedValue({
            code: 0,
            message: "success",
            result: [],
        });

        await expect(api.getWeekBangumi()).resolves.toBeUndefined();

        /*
         * 数据层保持静默（M10，见 TODO.md）：这条提示原本会在离线重试的
         * 每一轮都弹一次。何时提示由调用方决定——提醒按失败序列只报一次，
         * 视图有「未找到」页面兜底。
         */
        expect(notifier.info).not.toHaveBeenCalled();
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

    it("returns undefined without reporting on a network failure", async () => {
        vi.mocked(getJson).mockRejectedValue(new Error("timeout"));

        await expect(api.getWeekBangumi()).resolves.toBeUndefined();
        expect(notifier.info).not.toHaveBeenCalled();
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
