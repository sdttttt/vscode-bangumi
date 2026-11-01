import type { ViewState, WeekSourceKind } from "@shared/webview/protocol";
import { BangumiList } from "./BangumiList";
import { Placeholder } from "./Placeholder";
import { WeekBangumiList } from "./WeekBangumiList";

/**
 * 根组件的属性。
 *
 * @author sdttttt
 */
export interface AppProps {
    state: ViewState | undefined;
    onNextPage: () => void;
    onBackPage: () => void;
    onJumpPage: () => void;
    /** 切换到另一个数据来源，只作用于当前面板。 */
    onSwitchSource?: (source: WeekSourceKind) => void;
}

/**
 * 根据扩展宿主发送的状态选择要渲染的界面。
 *
 * @author sdttttt
 */
export function App({
    state,
    onNextPage,
    onBackPage,
    onJumpPage,
    onSwitchSource,
}: AppProps) {
    if (!state) {
        return <Placeholder image={undefined} message="加载中..." />;
    }

    switch (state.kind) {
        case "loading":
            return (
                <Placeholder image={state.assets?.image} message="加载中..." />
            );
        case "notFound":
            return (
                <Placeholder
                    image={state.assets?.image}
                    message="没有找到数据！"
                />
            );
        case "bangumi":
            return (
                <BangumiList
                    bangumis={state.bangumis ?? []}
                    page={state.page}
                    onNextPage={onNextPage}
                    onBackPage={onBackPage}
                    onJumpPage={onJumpPage}
                />
            );
        case "weekBangumi":
            return (
                <WeekBangumiList
                    days={state.days ?? []}
                    assets={state.assets}
                    source={state.source}
                    onSwitchSource={onSwitchSource}
                />
            );
        default:
            return assertNever(state.kind);
    }
}

/**
 * 编译期守卫：新增 `ViewKind` 却没有对应界面时会导致构建失败。
 *
 * @author sdttttt
 */
function assertNever(kind: never): never {
    throw new Error(`unhandled view kind: ${String(kind)}`);
}
