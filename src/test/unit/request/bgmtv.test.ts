import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getJson } from "@/request/http";
import { createBgmTvApi, type BgmTvApi } from "@/request/bgmtv/api";
import { BANGUMI_CALENDAR } from "@/request/bgmtv/query";
import { useCache } from "@/request/cache";
import { createNotifierStub, type NotifierStub } from "@/test/mocks/ports";
import { bgmCalendar, bgmCalendarDay } from "@/test/mocks/fixtures/bgm";

vi.mock("@/request/http", () => ({
    getJson: vi.fn(),
}));

describe("getCalendar", () => {
    let api: BgmTvApi;
    let notifier: NotifierStub;

    beforeEach(() => {
        notifier = createNotifierStub();
        api = createBgmTvApi(
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

    it("returns the calendar of a valid response", async () => {
        const payload = bgmCalendar();
        vi.mocked(getJson).mockResolvedValue(payload);

        await expect(api.getCalendar()).resolves.toEqual(payload);
    });

    it("requests the calendar endpoint", async () => {
        vi.mocked(getJson).mockResolvedValue(bgmCalendar());

        await api.getCalendar();

        expect(getJson).toHaveBeenCalledWith(BANGUMI_CALENDAR);
    });

    it("serves the second call from the cache", async () => {
        vi.mocked(getJson).mockResolvedValue(bgmCalendar());

        await api.getCalendar();
        await api.getCalendar();

        expect(getJson).toHaveBeenCalledTimes(1);
    });

    it("warns the user and returns undefined for an empty calendar", async () => {
        vi.mocked(getJson).mockResolvedValue([bgmCalendarDay({ items: [] })]);

        await expect(api.getCalendar()).resolves.toBeUndefined();

        expect(notifier.info).toHaveBeenCalledWith(
            "咦？没有找到 Bangumi 的放送表……"
        );
    });

    it("does not cache an unsuable calendar", async () => {
        vi.mocked(getJson).mockResolvedValue({});

        await api.getCalendar();
        await api.getCalendar();

        expect(getJson).toHaveBeenCalledTimes(2);
    });

    it("reports a network failure instead of rejecting", async () => {
        vi.mocked(getJson).mockRejectedValue(new Error("timeout"));

        await expect(api.getCalendar()).resolves.toBeUndefined();
        expect(notifier.info).toHaveBeenCalledWith(
            "咦？没有找到 Bangumi 的放送表……"
        );
    });
});
