import * as vscode from "vscode";
import { useAppState } from "./state/app";
import { useSettings } from "./configuration";
import { useCache, type RequestCaches } from "./request/cache";
import { useBangumiApi, type Sources } from "./request";
import { useBilibiliApi } from "./request/bilibili/api";
import { useBgmTvApi } from "./request/bgmtv/api";
import { useWebviewHost } from "./webview/host";
import { usePanel } from "./views/panel";
import { useIndexCommand } from "./match/index";
import { useFilterMenu } from "./match/indexList";
import { useBangumiView } from "./views/bangumi";
import { useWeekBangumiView } from "./views/weekBangumi";
import { useReminder, type Reminder } from "./reminder";
import { useStatusBar } from "./reminder/statusBar";
import { useScheduler } from "./reminder/scheduler";
import { useCommands, type CommandId } from "./commands";
import { useNotifier } from "./notifier";

/**
 * 一次激活创建的全部内容，供 `deactivate()` 释放。
 *
 * @author sdttttt
 */
interface Session {
    readonly reminder: Reminder;
}

let session: Session | undefined;

/**
 * 组合根：用各自的依赖构建所有闭包。
 *
 * 每个模块只声明自己需要什么，从不声明自己拥有什么，因此这里是唯一装配会话的地方。
 * 模块加载阶段不会创建任何东西，第二次 `activate()` 会复用第一次的会话。
 *
 * @param context 宿主持有的激活上下文
 * @author sdttttt
 */
function createSession(
    context: vscode.ExtensionContext
): Record<CommandId, () => unknown> {
    const subscriptions = context.subscriptions;

    const state = useAppState();
    const settings = useSettings();
    const notifier = useNotifier();
    const commands = useCommands();
    const caches: RequestCaches = {
        bangumi: useCache(600),
        week: useCache(60),
        calendar: useCache(3600),
    };
    /* 两个来源由组合根装配：提醒拿 B 站实现，视图拿统一端口。 */
    const sources: Sources = {
        bilibili: useBilibiliApi(caches, notifier),
        bgmtv: useBgmTvApi(caches, notifier),
    };
    const api = useBangumiApi(sources);
    const host = useWebviewHost(context.extensionPath);

    /**
     * 在用户最近活动的编辑器列中打开面板。
     */
    const createViewPanel = (
        viewType: string,
        title: string
    ): vscode.WebviewPanel =>
        vscode.window.createWebviewPanel(
            viewType,
            title,
            vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.Two,
            host.options()
        );

    const menu = useFilterMenu({ state, settings, notifier, commands });
    const statusBar = useStatusBar("weekBangumi");

    const bangumiPanel = usePanel({
        viewType: "bangumiOpen.list",
        title: "番剧列表",
        host,
        subscriptions,
        createPanel: createViewPanel,
    });
    const weekPanel = usePanel({
        viewType: "bangumiOpen.week",
        title: "周番表",
        host,
        subscriptions,
        createPanel: createViewPanel,
    });

    const bangumi = useBangumiView({
        state,
        api,
        panel: bangumiPanel,
        notifier,
    });
    const weekBangumi = useWeekBangumiView({
        api,
        panel: weekPanel,
        settings,
    });
    const index = useIndexCommand({ state, menu, notifier });
    const reminder = useReminder({
        /* 提醒直接消费 B 站周番：它需要 `pub_ts`，Bangumi 没有这个字段。 */
        source: sources.bilibili.getWeekBangumi,
        statusBar,
        settings,
        notifier,
        commands,
        onSettingsChanged: listener =>
            vscode.workspace.onDidChangeConfiguration(event =>
                listener(section => event.affectsConfiguration(section))
            ),
        scheduler: useScheduler(
            {
                onEvent: event => reminder.fire(event),
                onRollover: () => void reminder.refresh(),
            },
            Date.now
        ),
    });

    bangumiPanel.onCommand(bangumi.handleCommand);
    weekPanel.onCommand(weekBangumi.handleCommand);

    /* 提醒会自行注册设置监听，因此它自己持有一个可释放对象。 */
    context.subscriptions.push(reminder);
    void reminder.start();
    session = { reminder };

    return {
        openBangumi: bangumi.openBangumi,
        nextPage: bangumi.nextPage,
        backPage: bangumi.backPage,
        jumpPage: bangumi.jumpPage,
        weekBangumi: weekBangumi.openWeekBangumi,
        index: index.openIndex,
    };
}

/**
 * 扩展入口。
 *
 * @param context 宿主持有的激活上下文
 * @author sdttttt
 */
export function activate(context: vscode.ExtensionContext): void {
    if (session) {
        return;
    }

    const handlers = createSession(context);

    /*
     * 命令已在 package.json 中声明，这里用 registerCommand 提供实现。
     * 命令 id 必须与 package.json 中的 command 字段一致。
     */
    context.subscriptions.push(
        ...Object.entries(handlers).map(([id, handler]) =>
            vscode.commands.registerCommand(id, handler)
        )
    );
}

/**
 * 扩展被停用时调用。
 *
 * @export
 * @author sdttttt
 */
export function deactivate(): void {
    session?.reminder.dispose();
    session = undefined;
}
