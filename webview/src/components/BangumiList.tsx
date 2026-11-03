import type { BangumiPayload } from "@shared/webview/protocol";

/**
 * 索引列表视图的属性。
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
 * 标题超过该长度时，标题层级下调一级。
 *
 * @author sdttttt
 */
const LONG_TITLE = 17;

/**
 * 渲染索引列表中的单部番剧。
 *
 * 整张卡片就是一个链接，封面、标题与操作因此共用同一个 tab 焦点。
 * 操作项用样式化的元素表示而不是嵌套的 `<a>`，因为 `<a>` 套 `<a>` 不合法。
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
        <a
            class="cover"
            href={bangumi.link || undefined}
            title={bangumi.title}>
            <span class="cover-media">
                {bangumi.cover ? (
                    <img
                        class="cover-image"
                        src={bangumi.cover}
                        alt=""
                        loading="lazy"
                        decoding="async"
                    />
                ) : null}
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
                    <span class="btn">去追番</span>
                </div>
            </div>
        </a>
    );
}

/**
 * 带分页器的索引列表视图。
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
                        <BangumiRow
                            key={bangumi.link || bangumi.title}
                            bangumi={bangumi}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
