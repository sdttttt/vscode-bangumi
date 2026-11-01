import type {
    AssetUris,
    WeekDayPayload,
    WeekSourceKind,
} from "@shared/webview/protocol";
import { BgmTvWeek } from "./week/BgmTvWeek";
import { BilibiliWeek } from "./week/BilibiliWeek";

/**
 * 周番视图的属性。
 *
 * @author sdttttt
 */
export interface WeekBangumiListProps {
    days: Array<WeekDayPayload>;
    assets: AssetUris | undefined;
    /** 数据来源，缺省按 B 站处理。 */
    source?: WeekSourceKind;
    /** 覆盖走动的时钟；测试用它把时间固定住。 */
    now?: number;
    /**
     * 切换到另一个数据来源。
     *
     * 只作用于当前面板，不改写设置项；缺省时不显示切换按钮。
     */
    onSwitchSource?: (source: WeekSourceKind) => void;
}

/**
 * 周番视图。
 *
 * 两个来源的界面差别不小（B 站按更新时段分组并画「你在这里」标记，Bangumi 只有
 * 星期与首播日期），因此各自实现在 `week/` 下，这里只按来源分派。
 *
 * @author sdttttt
 */
export function WeekBangumiList({
    days,
    assets,
    source,
    now,
    onSwitchSource,
}: WeekBangumiListProps) {
    return "bangumi" === source ? (
        <BgmTvWeek
            days={days}
            assets={assets}
            onSwitchSource={onSwitchSource}
        />
    ) : (
        <BilibiliWeek
            days={days}
            assets={assets}
            now={now}
            onSwitchSource={onSwitchSource}
        />
    );
}
