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
 * @author sdttttt
 */
function BangumiRow({ bangumi }: { bangumi: BangumiPayload }) {
    const title =
        LONG_TITLE < bangumi.title.length ? (
            <h4>{bangumi.title}</h4>
        ) : (
            <h3>{bangumi.title}</h3>
        );

    return (
        <div class="cover">
            <div class="big">
                <img src={bangumi.cover} alt="抱歉啊" />
            </div>
            <div class="info">
                {title}
                <h4>关注度： {bangumi.order}</h4>
                {"" === bangumi.badge ? (
                    <h5>❤白嫖</h5>
                ) : (
                    <h5>{bangumi.badge}</h5>
                )}
                <span>{bangumi.finish ? "已完结 😎" : "未完结 😕"}</span>
                <br />
                <br />
                状态: <span>{bangumi.indexShow}</span>
                <br />
                <br />
                <a class="btn" href={bangumi.link}>
                    To Chase Bangumi
                </a>
            </div>
        </div>
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
                <button type="button" onClick={onBackPage}>
                    上一页
                </button>
                <span class="page-number">第 {page ?? 1} 页</span>
                <button type="button" onClick={onNextPage}>
                    下一页
                </button>
                <button type="button" onClick={onJumpPage}>
                    跳页
                </button>
            </div>
            <div class="container">
                {bangumis.map(bangumi => (
                    <BangumiRow key={bangumi.link} bangumi={bangumi} />
                ))}
            </div>
        </div>
    );
}
