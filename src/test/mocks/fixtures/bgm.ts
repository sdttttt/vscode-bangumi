import type { BgmCalendarDay, BgmSubject } from "@/request/bgmtv/structure";

/**
 * Bangumi 每日放送中的单部作品。
 *
 * 延迟填写的地址刻意保留 `http://`，用例因此能覆盖升级逻辑。
 *
 * @author sdttttt
 */
export const bgmSubject = (
    overrides: Partial<BgmSubject> = {}
): BgmSubject => ({
    air_date: "2026-10-01",
    air_weekday: 1,
    images: {
        large: "http://lain.bgm.tv/pic/cover/l/a.jpg",
        common: "http://lain.bgm.tv/pic/cover/c/a.jpg",
        medium: "http://lain.bgm.tv/pic/cover/m/a.jpg",
        small: "http://lain.bgm.tv/pic/cover/s/a.jpg",
        grid: "http://lain.bgm.tv/pic/cover/g/a.jpg",
    },
    id: 1,
    name: "テストアニメ",
    name_cn: "测试番剧",
    rating: { score: 7.5, total: 100 },
    type: 2,
    url: "http://bgm.tv/subject/1",
    ...overrides,
});

/**
 * 每日放送中的一天。
 *
 * @author sdttttt
 */
export const bgmCalendarDay = (
    overrides: Partial<BgmCalendarDay> = {}
): BgmCalendarDay => ({
    weekday: { cn: "星期一", en: "Mon", id: 1, ja: "月耀日" },
    items: [bgmSubject()],
    ...overrides,
});

/**
 * 完整的七天每日放送，每天一部作品。
 *
 * @author sdttttt
 */
export const bgmCalendar = (): Array<BgmCalendarDay> =>
    Array.from({ length: 7 }, (_, index) =>
        bgmCalendarDay({
            weekday: {
                cn: `星期${["一", "二", "三", "四", "五", "六", "日"][index]}`,
                en: "Mon",
                id: index + 1,
                ja: "月耀日",
            },
            items: [
                bgmSubject({
                    id: index + 1,
                    name: `第${index + 1}天的番剧`,
                    name_cn: `第${index + 1}天的番剧`,
                    air_weekday: index + 1,
                }),
            ],
        })
    );
