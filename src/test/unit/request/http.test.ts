import { afterEach, describe, expect, it, vi } from "vitest";
import { getJson, REQUEST_TIMEOUT_MS } from "@/request/http";

/**
 * 构建一个携带 JSON 响应体的 fetch 响应。
 *
 * @author sdttttt
 */
function jsonResponse(payload: unknown, status = 200): Response {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

describe("getJson", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns the parsed JSON body", async () => {
        const fetchMock = vi.fn(() =>
            Promise.resolve(jsonResponse({ code: 0 }))
        );
        vi.stubGlobal("fetch", fetchMock);

        await expect(getJson("https://example.com/api")).resolves.toEqual({
            code: 0,
        });
    });

    it("requests the url with a json accept header and a timeout signal", async () => {
        const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({})));
        vi.stubGlobal("fetch", fetchMock);
        const timeout = vi.spyOn(AbortSignal, "timeout");

        await getJson("https://example.com/api");

        expect(fetchMock).toHaveBeenCalledWith("https://example.com/api", {
            headers: { Accept: "application/json" },
            signal: timeout.mock.results[0].value,
        });
        expect(timeout).toHaveBeenCalledWith(REQUEST_TIMEOUT_MS);
    });

    it("rejects with the status of a non-2xx response", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(jsonResponse({}, 503)))
        );

        await expect(getJson("https://example.com/api")).rejects.toThrow("503");
    });

    it("propagates a network failure", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("timeout")))
        );

        await expect(getJson("https://example.com/api")).rejects.toThrow(
            "timeout"
        );
    });
});
