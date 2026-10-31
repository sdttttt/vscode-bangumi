import * as vscode from "vscode";
import { useAppState } from "./state/app";
import { useSettings } from "./configuration";
import { useCache, type RequestCaches } from "./request/cache";
import { useBangumiApi } from "./request/bangumi";
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
 * Everything one activation created, so `deactivate()` can release it.
 *
 * @author sdttttt
 */
interface Session {
    readonly reminder: Reminder;
}

let session: Session | undefined;

/**
 * Composition root: builds every closure with the dependencies it needs.
 *
 * Each module only declares what it needs, never what it owns, so this is the
 * single place where a session is wired together. Nothing is created at module
 * load, and a second `activate()` reuses the session of the first.
 *
 * @param context activation context owned by the host
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
    };
    const api = useBangumiApi(caches, notifier);
    const host = useWebviewHost(context.extensionPath);

    /**
     * Opens a panel in the editor column the user was last active in.
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
        source: api.getWeekBangumi,
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

    /* The reminder registers its own settings listener, so it owns a disposable. */
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
 *  Main Function
 *
 * @param {vscode.ExtensionContext} context
 * @author sdttttt
 */
export function activate(context: vscode.ExtensionContext): void {
    if (session) {
        return;
    }

    const handlers = createSession(context);

    /*
     * The command has been defined in the package.json file
     * Now provide the implementation of the command with registerCommand
     * The commandId parameter must match the command field in package.json
     */
    context.subscriptions.push(
        ...Object.entries(handlers).map(([id, handler]) =>
            vscode.commands.registerCommand(id, handler)
        )
    );
}

/**
 * this method is called when your extension is deactivated
 *
 * @export
 * @author sdttttt
 */
export function deactivate(): void {
    session?.reminder.dispose();
    session = undefined;
}
