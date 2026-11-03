import { Component, type ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { ViewState } from "@shared/webview/protocol";
import { App } from "./components/App";
import { onHostMessage, readState, saveState, send } from "./api";

/**
 * 渲染失败时的兜底文案。
 *
 * @author sdttttt
 */
const RENDER_ERROR_LABEL = "渲染失败了，正在向宿主要求重放数据……";

/**
 * Preact 的错误边界。
 *
 * 只能以 class 组件实现（需要 `getDerivedStateFromError`）：没有它，一次
 * 渲染异常会把整棵树卸载——effect 随之停摆，`ready` 永远发不出去，宿主
 * 没有机会重放好状态，面板从此空白。捕获后先展示兜底界面，再向宿主重发
 * `ready`；好状态到达时 Root 换一个新的 key 重挂载边界，失败标记随之复位。
 *
 * @author sdttttt
 */
class RenderBoundary extends Component<
    { children: ComponentChildren },
    { failed: boolean }
> {
    state = { failed: false };

    static getDerivedStateFromError(): { failed: boolean } {
        return { failed: true };
    }

    componentDidUpdate(
        _previousProps: Readonly<{ children: ComponentChildren }>,
        previousState: Readonly<{ failed: boolean }>
    ): void {
        if (!previousState.failed && this.state.failed) {
            send({ type: "ready" });
        }
    }

    render() {
        return this.state.failed ? (
            <div class="render-error">{RENDER_ERROR_LABEL}</div>
        ) : (
            this.props.children
        );
    }
}

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
    /* 每份新状态自增一次，作为错误边界的 key：好状态到达即重挂载复位。 */
    const [replay, setReplay] = useState(0);

    useEffect(() => {
        const stop = onHostMessage(next => {
            setState(next);
            saveState(next);
            setReplay(count => count + 1);
        });

        // 文档刚刚（重新）创建，因此向宿主索取当前数据。
        send({ type: "ready" });

        return stop;
    }, []);

    return (
        <RenderBoundary key={replay}>
            <App
                state={state}
                onNextPage={() => send({ type: "bangumi:nextPage" })}
                onBackPage={() => send({ type: "bangumi:backPage" })}
                onJumpPage={() => send({ type: "bangumi:jumpPage" })}
                onSwitchSource={source =>
                    send({ type: "weekBangumi:switchSource", source })
                }
            />
        </RenderBoundary>
    );
}
