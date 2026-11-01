import type { ComponentChildren } from "preact";
import type { WeekSourceKind } from "@shared/webview/protocol";

/**
 * 两个数据来源在切换按钮上的展示名。
 *
 * 用的是读者认得的站点名而不是设置项里的枚举值：`bangumi` 在这里写作 `bgm.tv`，
 * 与面板标题里的「Bangumi 每日放送」区分开，按钮只说明会切到哪个站点。
 *
 * @author sdttttt
 */
const SOURCE_LABELS: Record<WeekSourceKind, string> = {
    bilibili: "bilibili",
    bangumi: "bgm.tv",
};

/**
 * 来源提示条右侧的切换按钮。
 *
 * 只切换当前面板的数据来源，不写回设置项，因此不影响提醒、状态栏与下次打开的面板；
 * 文案直接说明会切到哪一边，读者不必先记得自己现在在哪一边。
 *
 * @author sdttttt
 */
export function SourceSwitch({
    current,
    onSwitch,
}: {
    current: WeekSourceKind;
    onSwitch: ((source: WeekSourceKind) => void) | undefined;
}) {
    if (!onSwitch) {
        return null;
    }

    const next: WeekSourceKind = "bangumi" === current ? "bilibili" : "bangumi";

    return (
        <button
            type="button"
            class="week-source-switch"
            onClick={() => onSwitch(next)}
            aria-label={`切换到 ${SOURCE_LABELS[next]} 数据源`}>
            切换到 {SOURCE_LABELS[next]}
        </button>
    );
}

/**
 * 顶部的数据来源提示条。
 *
 * 两个来源的能力不一样（B 站带播出时刻、支持提醒，Bangumi 收录更全但没有播出时刻），
 * 把它固定写在顶部，读者一眼就能看出当前面板来自哪里、为什么行为不同。
 *
 * @author sdttttt
 */
export function SourceNote({
    children,
    action,
}: {
    children: ComponentChildren;
    /** 右侧的补充操作，通常是来源切换按钮。 */
    action?: ComponentChildren;
}) {
    return (
        <div class="week-source">
            <p class="week-source-note" role="note">
                {children}
            </p>
            {action}
        </div>
    );
}
