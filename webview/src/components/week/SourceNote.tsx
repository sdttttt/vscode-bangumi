import type { ComponentChildren } from "preact";

/**
 * 顶部的数据来源提示条。
 *
 * 两个来源的能力不一样（B 站带播出时刻、支持提醒，Bangumi 收录更全但没有播出时刻），
 * 把它固定写在顶部，读者一眼就能看出当前面板来自哪里、为什么行为不同。
 *
 * @author sdttttt
 */
export function SourceNote({ children }: { children: ComponentChildren }) {
    return (
        <p class="week-source" role="note">
            {children}
        </p>
    );
}
