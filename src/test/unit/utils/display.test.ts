import { describe, expect, it } from "vitest";
import { updatedMessage, upcomingMessage } from "@/utils/display";

describe("updatedMessage", () => {
    it("tells the user the bangumi is updated", () => {
        expect(updatedMessage("咒术回战")).toBe("《咒术回战》 更新啦！");
    });

    it("lists every title of a group", () => {
        expect(updatedMessage(["甲", "乙"])).toBe("《甲》、《乙》 更新啦！");
    });

    it("collapses a large group into a count", () => {
        expect(updatedMessage(["甲", "乙", "丙", "丁"])).toBe(
            "《甲》、《乙》、《丙》等 4 部 更新啦！"
        );
    });
});

describe("upcomingMessage", () => {
    it("mentions how many minutes are left", () => {
        expect(upcomingMessage("咒术回战", 5)).toBe(
            "《咒术回战》 还有5分钟就更新啦！"
        );
    });

    it("lists every title of a group", () => {
        expect(upcomingMessage(["甲", "乙"], 10)).toBe(
            "《甲》、《乙》 还有10分钟就更新啦！"
        );
    });
});
