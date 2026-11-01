import type { ComponentChildren } from "preact";
import { useEffect, useRef } from "preact/hooks";

/**
 * 可横向滚动的按天网格。
 *
 * `today` 是滚动的锚点：数据变化后自动把它滚进视野，读者因此不必自己拖动。
 *
 * @author sdttttt
 */
export function WeekBoard({
    children,
    source,
}: {
    children: ComponentChildren;
    /** 有值时在顶部额外显示一条来源提示。 */
    source?: ComponentChildren;
}) {
    const board = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const today = board.current?.querySelector(".item.today");
        if (today && "scrollIntoView" in today) {
            today.scrollIntoView({ block: "nearest", inline: "start" });
        }
    }, [children]);

    return (
        <div class="week-shell">
            {source}
            <div class="board week-board" ref={board}>
                <div class="week">{children}</div>
            </div>
        </div>
    );
}
