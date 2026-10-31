import type { BangumiPayload } from "@shared/webview/protocol";

/**
 * Props of the index list view.
 *
 * @author sdttttt
 */
interface BangumiListProps {
    bangumis: Array<BangumiPayload>;
    page: number | undefined;
    onNextPage: () => void;
    onBackPage: () => void;
    onJumpPage: () => void;
}

/**
 * Title length above which the heading drops a level.
 *
 * @author sdttttt
 */
const LONG_TITLE = 17;

/**
 * Renders one bangumi of the index list.
 *
 * The whole card is a single link, so the cover, the title and the action share
 * one tab stop. The action is a styled element instead of a nested anchor,
 * because an anchor inside an anchor is invalid HTML.
 *
 * @author sdttttt
 */
function BangumiRow({ bangumi }: { bangumi: BangumiPayload }) {
    const title =
        LONG_TITLE < bangumi.title.length ? (
            <h4 class="cover-title">{bangumi.title}</h4>
        ) : (
            <h3 class="cover-title">{bangumi.title}</h3>
        );

    return (
        <a class="cover" href={bangumi.link} title={bangumi.title}>
            <span class="cover-media">
                <img
                    class="cover-image"
                    src={bangumi.cover}
                    alt=""
                    loading="lazy"
                    decoding="async"
                />
            </span>
            <div class="cover-body">
                <div class="cover-head">
                    {title}
                    <span class="chip">
                        {"" === bangumi.badge ? "白嫖" : bangumi.badge}
                    </span>
                </div>
                <div class="cover-meta">
                    <span>关注度 {bangumi.order}</span>
                    <span class="chip">{bangumi.indexShow}</span>
                </div>
                <div class="cover-foot">
                    <span class={bangumi.finish ? "chip" : "chip chip-accent"}>
                        {bangumi.finish ? "已完结" : "未完结"}
                    </span>
                    <span class="btn">To Chase Bangumi</span>
                </div>
            </div>
        </a>
    );
}

/**
 * Index list view with its pager.
 *
 * @author sdttttt
 */
export function BangumiList({
    bangumis,
    page,
    onNextPage,
    onBackPage,
    onJumpPage,
}: BangumiListProps) {
    return (
        <div class="bangumi-list">
            <div class="pager">
                <button type="button" class="pager-button" onClick={onBackPage}>
                    上一页
                </button>
                <span class="page-number">第 {page ?? 1} 页</span>
                <button type="button" class="pager-button" onClick={onNextPage}>
                    下一页
                </button>
                <button type="button" class="pager-button" onClick={onJumpPage}>
                    跳页
                </button>
            </div>
            <div class="board">
                <div class="bangumi-grid">
                    {bangumis.map(bangumi => (
                        <BangumiRow key={bangumi.link} bangumi={bangumi} />
                    ))}
                </div>
            </div>
        </div>
    );
}
