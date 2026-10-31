import { useEffect, useState } from "preact/hooks";
import type { ViewState } from "@shared/webview/protocol";
import { App } from "./components/App";
import { onHostMessage, readState, saveState, send } from "./api";

/**
 * Root of the webview application.
 *
 * The extension host owns the data: it posts a state whenever something
 * changes. The last state is also mirrored into `setState` so a panel restored
 * from the background paints immediately, before the host answers.
 *
 * @author sdttttt
 */
export function Root() {
    const [state, setState] = useState<ViewState | undefined>(readState);

    useEffect(() => {
        const stop = onHostMessage(next => {
            setState(next);
            saveState(next);
        });

        // The document was just (re)created, so ask for the current data.
        send({ type: "ready" });

        return stop;
    }, []);

    return (
        <App
            state={state}
            onNextPage={() => send({ type: "bangumi:nextPage" })}
            onBackPage={() => send({ type: "bangumi:backPage" })}
            onJumpPage={() => send({ type: "bangumi:jumpPage" })}
        />
    );
}
