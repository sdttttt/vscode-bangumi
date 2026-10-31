import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import Axios from "@/request/instance";
import { BangumiUrl } from "@/request/bangumiUrl";
import { getAllBangumi, getWeekBangumi } from "@/request/bangumi";
import { BangumiCache, WeekBangumiCache } from "@/request/cache";
import { bangumisData } from "@/test/mocks/fixtures/bangumi";
import { weekBangumi } from "@/test/mocks/fixtures/weekBangumi";
import * as vscode from "vscode";

vi.mock("@/request/instance", () => ({
    default: { get: vi.fn() },
}));

describe("getAllBangumi", () => {
    beforeEach(() => {
        BangumiCache.clear();
    });

    afterEach(() => {
        vi.mocked(Axios.get).mockReset();
    });

    it("returns the data of a valid response", async () => {
        const payload = bangumisData();
        vi.mocked(Axios.get).mockResolvedValue({
            data: { code: 0, message: "success", data: payload },
        });

        await expect(getAllBangumi(new BangumiUrl())).resolves.toEqual(payload);
    });

    it("requests the url produced by the builder", async () => {
        vi.mocked(Axios.get).mockResolvedValue({
            data: { code: 0, message: "success", data: bangumisData() },
        });

        const url = new BangumiUrl().setPage(2);
        await getAllBangumi(url);

        expect(Axios.get).toHaveBeenCalledWith(url.build().finalUrl);
    });

    it("serves the second identical call from the cache", async () => {
        vi.mocked(Axios.get).mockResolvedValue({
            data: { code: 0, message: "success", data: bangumisData() },
        });

        const url = new BangumiUrl();
        await getAllBangumi(url);
        await getAllBangumi(url);

        expect(Axios.get).toHaveBeenCalledTimes(1);
    });

    it("requests the network again for a different url", async () => {
        vi.mocked(Axios.get).mockResolvedValue({
            data: { code: 0, message: "success", data: bangumisData() },
        });

        await getAllBangumi(new BangumiUrl().setPage(1));
        await getAllBangumi(new BangumiUrl().setPage(2));

        expect(Axios.get).toHaveBeenCalledTimes(2);
    });

    it("returns undefined without caching when the response is not valid", async () => {
        vi.mocked(Axios.get).mockResolvedValue({
            data: {
                code: -404,
                message: "boom",
                data: { has_next: 0, list: [] },
            },
        });

        await expect(getAllBangumi(new BangumiUrl())).resolves.toBeUndefined();

        await getAllBangumi(new BangumiUrl());
        expect(Axios.get).toHaveBeenCalledTimes(2);
    });

    it("propagates a network failure", async () => {
        vi.mocked(Axios.get).mockRejectedValue(
            new AxiosError("timeout", "ECONNABORTED")
        );

        await expect(getAllBangumi(new BangumiUrl())).rejects.toThrow(
            "timeout"
        );
    });
});

describe("getWeekBangumi", () => {
    beforeEach(() => {
        WeekBangumiCache.clear();
    });

    afterEach(() => {
        vi.mocked(Axios.get).mockReset();
        vi.mocked(vscode.window.showInformationMessage).mockClear();
    });

    it("returns the schedule of a valid response", async () => {
        const payload = weekBangumi();
        vi.mocked(Axios.get).mockResolvedValue({
            data: { code: 0, message: "success", result: payload },
        });

        await expect(getWeekBangumi()).resolves.toEqual(payload);
    });

    it("serves the second call from the cache", async () => {
        vi.mocked(Axios.get).mockResolvedValue({
            data: { code: 0, message: "success", result: weekBangumi() },
        });

        await getWeekBangumi();
        await getWeekBangumi();

        expect(Axios.get).toHaveBeenCalledTimes(1);
    });

    it("warns the user and returns undefined for an empty schedule", async () => {
        vi.mocked(Axios.get).mockResolvedValue({
            data: { code: 0, message: "success", result: [] },
        });

        await expect(getWeekBangumi()).resolves.toBeUndefined();

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "诶?!没有找到番剧时间表诶..."
        );
    });

    it("does not cache an empty schedule", async () => {
        vi.mocked(Axios.get).mockResolvedValue({
            data: { code: 0, message: "success", result: [] },
        });

        await getWeekBangumi();
        await getWeekBangumi();

        expect(Axios.get).toHaveBeenCalledTimes(2);
    });

    it("reports a network failure instead of rejecting", async () => {
        vi.mocked(Axios.get).mockRejectedValue(
            new AxiosError("timeout", "ECONNABORTED")
        );

        await expect(getWeekBangumi()).resolves.toBeUndefined();
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "诶?!没有找到番剧时间表诶..."
        );
    });

    it("returns undefined for an unsuccessful response", async () => {
        vi.mocked(Axios.get).mockResolvedValue({
            data: { code: -500, message: "boom", result: weekBangumi() },
        });

        await expect(getWeekBangumi()).resolves.toBeUndefined();
    });
});
