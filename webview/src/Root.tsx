import { useEffect, useState } from "preact/hooks";
import type { ViewState } from "@shared/webview/protocol";
import { App } from "./components/App";
import { onHostMessage, readState, saveState, send } from "./api";

/**
 * Webview 应用的根组件。
 *
 * 数据由扩展宿主持有：内容变化时它会推送一份状态。最后一份状态同时写入
 * `setState`，从后台恢复的面板因此可以先绘制出来，无需等待宿主响应。
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

        // 文档刚刚（重新）创建，因此向宿主索取当前数据。
        send({ type: "ready" });

        return stop;
    }, []);

    return (
        <App
            state={state}
            onNextPage={() => send({ type: "bangumi:nextPage" })}
            onBackPage={() => send({ type: "bangumi:backPage" })}
            onJumpPage={() => send({ type: "bangumi:jumpPage" })}
            onSwitchSource={source =>
                send({ type: "weekBangumi:switchSource", source })
            }
        />
    );
}
