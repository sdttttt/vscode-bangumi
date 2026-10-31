import { describe, expect, it } from "vitest";
import { describeNotice, PUBLISHED_THRESHOLD_MS } from "@/reminder/notice";
import type { ScheduleEvent } from "@/reminder/schedule";

/**
 * 2026-11-01 20:00 UTC+8，被测事件的更新时刻。
 *
 * @author sdttttt
 */
const PUB_TS = Date.UTC(2026, 10, 1, 12, 0);

/**
 * 在 `PUB_TS` 更新的时间事件替身。
 *
 * @author sdttttt
 */
function event(): ScheduleEvent {
    return { at: PUB_TS, pubTs: PUB_TS, pubTime: "20:00", titles: ["甲"] };
}

describe("describeNotice", () => {
    it("announces a fresh episode as published", () => {
        expect(describeNotice(event(), PUB_TS)).toEqual({ kind: "published" });
    });

    it("announces an event exactly at the threshold as published", () => {
        expect(
            describeNotice(event(), PUB_TS - PUBLISHED_THRESHOLD_MS)
        ).toEqual({ kind: "published" });
    });

    it("announces a future event with the remaining minutes", () => {
        expect(describeNotice(event(), PUB_TS - 10 * 60_000)).toEqual({
            kind: "ahead",
            minutes: 10,
        });
    });

    it("rounds a partial minute up", () => {
        expect(
            describeNotice(event(), PUB_TS - PUBLISHED_THRESHOLD_MS - 1)
        ).toEqual({ kind: "ahead", minutes: 2 });
    });
});
