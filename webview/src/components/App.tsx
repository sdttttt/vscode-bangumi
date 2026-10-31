import type { ViewState } from "@shared/webview/protocol";
import { BangumiList } from "./BangumiList";
import { Placeholder } from "./Placeholder";
import { WeekBangumiList } from "./WeekBangumiList";

/**
 * Props of the root component.
 *
 * @author sdttttt
 */
export interface AppProps {
    state: ViewState | undefined;
    onNextPage: () => void;
    onBackPage: () => void;
    onJumpPage: () => void;
}

/**
 * Picks the screen matching the state sent by the extension host.
 *
 * @author sdttttt
 */
export function App({ state, onNextPage, onBackPage, onJumpPage }: AppProps) {
    if (!state) {
        return <Placeholder image={undefined} message="Loading..." />;
    }

    switch (state.kind) {
        case "loading":
            return (
                <Placeholder
                    image={state.assets?.loading}
                    message="Loading..."
                />
            );
        case "notFound":
            return (
                <Placeholder
                    image={state.assets?.enterprise}
                    message="没有数据!"
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
                />
            );
        default:
            return assertNever(state.kind);
    }
}

/**
 * Compile time guard: adding a `ViewKind` without a screen fails to build.
 *
 * @author sdttttt
 */
function assertNever(kind: never): never {
    throw new Error(`unhandled view kind: ${String(kind)}`);
}
