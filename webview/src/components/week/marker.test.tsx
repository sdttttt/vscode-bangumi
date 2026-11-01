import { describe, expect, it } from "vitest";
import {
    describeGap,
    describeNow,
    groupByPubTime,
    markerIndex,
    nextGapMinutes,
    NOW_DONE_LABEL,
    NOW_EMPTY_LABEL,
    pubTimeMinute,
} from "@webview/components/week/marker";
import type { SeasonGroup } from "@webview/components/week/marker";
import { season } from "@webview/test/week";

describe("groupByPubTime", () => {
    it("groups adjacent seasons sharing a publication time", () => {
        const groups = groupByPubTime([
            season({ pubTime: "20:00", url: "a" }),
            season({ pubTime: "20:00", url: "b" }),
            season({ pubTime: "21:00", url: "c" }),
        ]);

        expect(groups).toHaveLength(2);
        expect(groups[0].seasons).toHaveLength(2);
        expect(groups[1].pubTime).toBe("21:00");
    });

    it("returns no group for an empty list", () => {
        expect(groupByPubTime([])).toHaveLength(0);
    });
});

describe("pubTimeMinute", () => {
    it("converts a slot label into its minute of the day", () => {
        expect(pubTimeMinute("00:00")).toBe(0);
        expect(pubTimeMinute("09:30")).toBe(570);
        expect(pubTimeMinute("23:59")).toBe(1439);
    });

    it("accepts an unpadded hour", () => {
        expect(pubTimeMinute("9:05")).toBe(545);
    });

    it("rejects a label that is not a wall clock", () => {
        expect(pubTimeMinute("")).toBeUndefined();
        expect(pubTimeMinute("24:00")).toBeUndefined();
        expect(pubTimeMinute("20:60")).toBeUndefined();
        expect(pubTimeMinute("今晚八点")).toBeUndefined();
    });
});

describe("markerIndex", () => {
    const groups = (times: Array<string>): Array<SeasonGroup> =>
        times.map(pubTime => ({ pubTime, seasons: [season({ pubTime })] }));

    it("stays above the first slot before it airs", () => {
        expect(markerIndex(groups(["09:00", "20:00"]), 480)).toBe(0);
    });

    it("sits right after a slot that already aired", () => {
        expect(markerIndex(groups(["09:00", "20:00"]), 540)).toBe(1);
    });

    it("treats the exact slot minute as already aired", () => {
        expect(markerIndex(groups(["09:00", "20:00"]), 540)).toBe(1);
    });

    it("moves below every slot late in the day", () => {
        expect(markerIndex(groups(["09:00", "20:00"]), 1439)).toBe(2);
    });

    it("has no slot to guard against on an empty day", () => {
        expect(markerIndex([], 600)).toBe(0);
    });

    it("stops at a slot it cannot parse", () => {
        expect(markerIndex(groups(["09:00", "拖更", "20:00"]), 1439)).toBe(1);
    });
});

describe("nextGapMinutes", () => {
    const groups = (times: Array<string>): Array<SeasonGroup> =>
        times.map(pubTime => ({ pubTime, seasons: [season({ pubTime })] }));

    it("measures the wait until the next slot", () => {
        expect(nextGapMinutes(groups(["09:00", "20:00"]), 570)).toBe(630);
    });

    it("skips the slots that already aired", () => {
        expect(nextGapMinutes(groups(["09:00", "10:00", "20:00"]), 720)).toBe(
            480
        );
    });

    it("counts a slot airing right now as already aired", () => {
        expect(nextGapMinutes(groups(["20:00", "21:00"]), 1200)).toBe(60);
        expect(nextGapMinutes(groups(["20:00"]), 1200)).toBeUndefined();
    });

    it("has nothing left after the last slot", () => {
        expect(nextGapMinutes(groups(["09:00"]), 1439)).toBeUndefined();
    });

    it("has nothing for a day without slots", () => {
        expect(nextGapMinutes([], 600)).toBeUndefined();
    });

    it("skips a malformed slot and still finds the next one", () => {
        expect(nextGapMinutes(groups(["09:00", "拖更", "20:00"]), 720)).toBe(
            480
        );
    });
});

describe("describeGap", () => {
    it("counts minutes below an hour", () => {
        expect(describeGap(0)).toBe("还有 0 分钟");
        expect(describeGap(45)).toBe("还有 45 分钟");
        expect(describeGap(59)).toBe("还有 59 分钟");
    });

    it("counts whole hours without the minutes part", () => {
        expect(describeGap(60)).toBe("还有 1 小时");
        expect(describeGap(120)).toBe("还有 2 小时");
    });

    it("keeps the minutes of a mixed duration", () => {
        expect(describeGap(61)).toBe("还有 1 小时 1 分");
        expect(describeGap(630)).toBe("还有 10 小时 30 分");
    });
});

describe("describeNow", () => {
    const groups = (times: Array<string>): Array<SeasonGroup> =>
        times.map(pubTime => ({ pubTime, seasons: [season({ pubTime })] }));

    it("describes the wait until the next slot", () => {
        expect(describeNow(groups(["09:00", "20:00"]), 570)).toBe(
            "还有 10 小时 30 分"
        );
    });

    it("flags a finished day", () => {
        expect(describeNow(groups(["09:00"]), 1439)).toBe(NOW_DONE_LABEL);
    });

    it("flags an empty day", () => {
        expect(describeNow([], 600)).toBe(NOW_EMPTY_LABEL);
    });
});
