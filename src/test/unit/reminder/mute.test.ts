import { describe, expect, it } from "vitest";
import {
    buildMuteOptions,
    matchMuteOption,
    MUTE_GLOBAL_LABEL,
} from "@/reminder/mute";

describe("buildMuteOptions", () => {
    it("offers no slot option for a single bangumi", () => {
        expect(buildMuteOptions(["甲"]).map(option => option.label)).toEqual([
            "不再提醒《甲》",
            MUTE_GLOBAL_LABEL,
        ]);
    });

    it("offers one entry per bangumi and a slot entry", () => {
        expect(
            buildMuteOptions(["甲", "乙", "丙"]).map(option => option.label)
        ).toEqual([
            "不再提醒《甲》",
            "不再提醒《乙》",
            "不再提醒《丙》",
            "该时段 3 部都不再提醒",
            MUTE_GLOBAL_LABEL,
        ]);
    });

    it("deduplicates repeated titles", () => {
        expect(
            buildMuteOptions(["甲", "甲"]).map(option => option.label)
        ).toEqual(["不再提醒《甲》", MUTE_GLOBAL_LABEL]);
    });

    it("carries the titles each option should ignore", () => {
        const [, , slot, global] = buildMuteOptions(["甲", "乙"]);

        expect(slot.kind).toBe("slot");
        expect(slot.titles).toEqual(["甲", "乙"]);
        expect(global.kind).toBe("global");
        expect(global.titles).toEqual([]);
    });
});

describe("matchMuteOption", () => {
    const options = buildMuteOptions(["甲", "乙"]);

    it("finds the option by its label", () => {
        expect(matchMuteOption(options, "不再提醒《乙》")?.titles).toEqual([
            "乙",
        ]);
    });

    it("is undefined when the menu was dismissed", () => {
        expect(matchMuteOption(options, undefined)).toBeUndefined();
    });

    it("is undefined for an unknown label", () => {
        expect(matchMuteOption(options, "别的按钮")).toBeUndefined();
    });
});
