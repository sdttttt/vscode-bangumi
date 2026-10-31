import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExtensionContext, Webview } from "vscode";
import BangumisHTMLGenerator from "@/html/bangumiHtml";
import WeekBangumisHTMLGenerator from "@/html/weekBangumiHtml";
import LoadingHTMLGenerator from "@/html/loadingHtml";
import NotFoundHTMLGenerator from "@/html/NotFoundHtml";
import { isDisplayHistory } from "@/configuration";
import { setContext } from "@/constants";
import { bangumi } from "@/test/mocks/fixtures/bangumi";
import {
    wBangumi,
    weekBangumi,
    weekBangumiData,
} from "@/test/mocks/fixtures/weekBangumi";

vi.mock("@/configuration", () => ({
    isDisplayHistory: vi.fn(() => false),
}));

/**
 * Builds a webview whose `asWebviewUri` is namespaced by panel id, so a uri
 * leaked from another panel becomes visible in the generated HTML.
 *
 * @author sdttttt
 */
function makeWebview(panelId: string): Webview {
    return {
        asWebviewUri: (uri: { fsPath: string }) => `${panelId}:${uri.fsPath}`,
    } as unknown as Webview;
}

describe("LoadingHTMLGenerator", () => {
    beforeEach(() => {
        setContext({ extensionPath: "/extension" } as ExtensionContext);
    });

    it("binds every resource to the given webview", () => {
        const html = LoadingHTMLGenerator.generateHTML(
            undefined,
            makeWebview("panel-a")
        );

        expect(html).toContain("panel-a:/extension/resources/loading.gif");
        expect(html).toContain("panel-a:/extension/resources/css/loading.css");
    });

    it("does not reuse the uri of a previously rendered panel", () => {
        LoadingHTMLGenerator.generateHTML(undefined, makeWebview("panel-a"));
        const second = LoadingHTMLGenerator.generateHTML(
            undefined,
            makeWebview("panel-b")
        );

        expect(second).toContain("panel-b:");
        expect(second).not.toContain("panel-a:");
    });

    it("wraps the body in the shared html skeleton", () => {
        const html = LoadingHTMLGenerator.generateHTML(
            undefined,
            makeWebview("panel")
        );

        expect(html.startsWith("<html>")).toBe(true);
        expect(html.endsWith("</div></body></html>")).toBe(true);
    });
});

describe("NotFoundHTMLGenerator", () => {
    beforeEach(() => {
        setContext({ extensionPath: "/extension" } as ExtensionContext);
    });

    it("binds the placeholder image to the given webview", () => {
        const html = NotFoundHTMLGenerator.generateHTML(
            undefined,
            makeWebview("panel-c")
        );

        expect(html).toContain("panel-c:/extension/resources/enterprise.jpg");
        expect(html).toContain("没有数据!");
    });
});

describe("BangumisHTMLGenerator", () => {
    beforeEach(() => {
        setContext({ extensionPath: "/extension" } as ExtensionContext);
    });

    it("renders one block per bangumi", () => {
        const html = BangumisHTMLGenerator.generateHTML(
            [bangumi({ title: "番剧甲" }), bangumi({ title: "番剧乙" })],
            makeWebview("panel")
        );

        expect(html.match(/class="cover"/g)).toHaveLength(2);
        expect(html).toContain("番剧甲");
        expect(html).toContain("番剧乙");
    });

    it("marks a finished bangumi", () => {
        const html = BangumisHTMLGenerator.generateHTML(
            [bangumi({ is_finish: 1 })],
            makeWebview("panel")
        );

        expect(html).toContain("已完结");
    });

    it("marks an unfinished bangumi", () => {
        const html = BangumisHTMLGenerator.generateHTML(
            [bangumi({ is_finish: 0 })],
            makeWebview("panel")
        );

        expect(html).toContain("未完结");
    });

    it("falls back to a placeholder when the badge is empty", () => {
        const html = BangumisHTMLGenerator.generateHTML(
            [bangumi({ badge: "" })],
            makeWebview("panel")
        );

        expect(html).toContain("❤白嫖");
    });

    it("uses a smaller heading for long titles", () => {
        const short = BangumisHTMLGenerator.generateHTML(
            [bangumi({ title: "短标题" })],
            makeWebview("panel")
        );
        const long = BangumisHTMLGenerator.generateHTML(
            [bangumi({ title: "这是一个非常非常长的番剧标题超过十七个字" })],
            makeWebview("panel")
        );

        expect(short).toContain("<h3>短标题</h3>");
        expect(long).toContain(
            "<h4>这是一个非常非常长的番剧标题超过十七个字</h4>"
        );
    });

    it("links to the bangumi page", () => {
        const html = BangumisHTMLGenerator.generateHTML(
            [bangumi({ link: "https://example.test/play/ss9" })],
            makeWebview("panel")
        );

        expect(html).toContain('href="https://example.test/play/ss9"');
    });

    it("renders an empty body for an empty list", () => {
        const html = BangumisHTMLGenerator.generateHTML(
            [],
            makeWebview("panel")
        );

        expect(html).not.toContain('class="cover"');
        expect(html).toContain("/extension/resources/css/bangumi.css");
    });
});

describe("WeekBangumisHTMLGenerator", () => {
    beforeEach(() => {
        setContext({ extensionPath: "/extension" } as ExtensionContext);
        vi.mocked(isDisplayHistory).mockReturnValue(false);
    });

    it("renders every day when history is enabled", () => {
        vi.mocked(isDisplayHistory).mockReturnValue(true);

        const html = WeekBangumisHTMLGenerator.generateHTML(
            [
                weekBangumiData({ date: "1-1", day_of_week: 1 }),
                weekBangumiData({ date: "1-2", day_of_week: 2 }),
            ],
            makeWebview("panel")
        );

        expect(html).toContain("星期一");
        expect(html).toContain("星期二");
    });

    it("skips the first five days when history is disabled", () => {
        const html = WeekBangumisHTMLGenerator.generateHTML(
            weekBangumi(),
            makeWebview("panel")
        );

        expect(html).not.toContain("星期一");
        expect(html).not.toContain("星期五");
        expect(html).toContain("星期六");
        expect(html).toContain("星期日");
    });

    it("marks a delayed bangumi with the delay block", () => {
        vi.mocked(isDisplayHistory).mockReturnValue(true);

        const html = WeekBangumisHTMLGenerator.generateHTML(
            [
                weekBangumiData({
                    seasons: [
                        wBangumi({
                            delay: 1,
                            delay_index: "第4话",
                            delay_reason: "制作延期",
                        }),
                    ],
                }),
            ],
            makeWebview("panel")
        );

        expect(html).toContain('class="bangumi delay"');
        expect(html).toContain("制作延期");
    });

    it("groups bangumi sharing a publication time under one time point", () => {
        vi.mocked(isDisplayHistory).mockReturnValue(true);

        const html = WeekBangumisHTMLGenerator.generateHTML(
            [
                weekBangumiData({
                    seasons: [
                        wBangumi({ title: "甲", pub_time: "20:00" }),
                        wBangumi({ title: "乙", pub_time: "20:00" }),
                        wBangumi({ title: "丙", pub_time: "21:00" }),
                    ],
                }),
            ],
            makeWebview("panel")
        );

        expect(html.match(/class="time-point"/g)).toHaveLength(2);
        expect(html).toContain("20:00");
        expect(html).toContain("21:00");
    });

    it("binds the stylesheet to the given webview", () => {
        vi.mocked(isDisplayHistory).mockReturnValue(true);

        const html = WeekBangumisHTMLGenerator.generateHTML(
            [weekBangumiData({ date: "1-6", day_of_week: 6 })],
            makeWebview("panel-w")
        );

        expect(html).toContain(
            "panel-w:/extension/resources/css/weekBangumi.css"
        );
    });
});
