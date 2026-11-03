import type { SeasonPayload, WeekDayPayload } from "@shared/webview/protocol";

/**
 * 一份番剧渲染载荷。
 *
 * @author sdttttt
 */
export const season = (
    overrides: Partial<SeasonPayload> = {}
): SeasonPayload => ({
    cover: "https://example.test/square.jpg",
    delay: false,
    delayIndex: "",
    delayReason: "",
    pubIndex: "第3话",
    pubTime: "20:00",
    title: "测试番剧",
    url: "https://example.test/ss1",
    ...overrides,
});

/**
 * 一份日程渲染载荷。
 *
 * 默认日期与 `AT_*` 时刻常量同属 UTC+8 的 2026-10-31：标记与「今天」徽标
 * 现在要跟实时时钟核对日期，钉住的用例因此需要日期与时刻一致。
 *
 * @author sdttttt
 */
export const day = (
    overrides: Partial<WeekDayPayload> = {}
): WeekDayPayload => ({
    date: "10-31",
    dayOfWeek: 6,
    label: "星期六",
    isToday: false,
    seasons: [season()],
    ...overrides,
});

/**
 * 一份 Bangumi 渲染载荷：没有播出时刻，首播日期占集数的位置。
 *
 * @author sdttttt
 */
export const bgmDay = (
    overrides: Partial<WeekDayPayload> = {}
): WeekDayPayload =>
    day({
        source: "bangumi",
        seasons: [
            season({ pubTime: "", pubIndex: "2026-10-01", url: "a" }),
            season({ pubTime: "", pubIndex: "2026-10-02", url: "b" }),
        ],
        ...overrides,
    });

/**
 * 用于固定「你在这里」标记的 UTC+8 时刻。
 *
 * @author sdttttt
 */
export const AT_09_30 = Date.UTC(2026, 9, 31, 1, 30);

/**
 * 晚于测试数据中所有更新时段的 UTC+8 时刻。
 *
 * @author sdttttt
 */
export const AT_23_00 = Date.UTC(2026, 9, 31, 15, 0);

/**
 * 早于测试数据中所有更新时段的 UTC+8 时刻。
 *
 * @author sdttttt
 */
export const AT_08_00 = Date.UTC(2026, 9, 31, 0, 0);
