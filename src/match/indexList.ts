import type { Settings } from "../configuration";
import type { Commands } from "../commands";
import type { AppStore } from "../state/app";
import type { Notifier } from "../notifier";
import type { FilterSpec } from "./filterSpec";

/**
 * 筛选菜单的依赖。
 *
 * @author sdttttt
 */
export interface FilterMenuOptions {
    /** 选中的筛选写入的状态。 */
    readonly state: AppStore;
    /** 本次会话的设置。 */
    readonly settings: Settings;
    /** 面向用户的输出。 */
    readonly notifier: Notifier;
    /** 执行扩展命令。 */
    readonly commands: Commands;
}

/**
 * 一次扩展会话的筛选菜单。
 *
 * @author sdttttt
 */
export interface FilterMenu {
    /** 展示某个筛选的选项，并应用选中的那项。 */
    open(filter: FilterSpec): void;
}

/**
 * 创建一次扩展会话的筛选菜单。
 *
 * 先记录标签再修改 query，query 改完才打开番剧列表，与此前的 hook 流水线一致。
 *
 * @author sdttttt
 */
export function createFilterMenu(options: FilterMenuOptions): FilterMenu {
    const { state, settings, notifier, commands } = options;

    /**
     * 展示目前已选标签的文案。
     */
    const showTags = (): void => {
        if (!settings.isDisplayIndexTags()) {
            return;
        }

        const tags = state.getTags();
        if (0 === tags.size) {
            notifier.error("标签：默认");
            return;
        }

        notifier.info(`已选标签：${[...tags.values()].join("、")}`);
    };

    return {
        open: filter => {
            void notifier
                .pick(filter.choices)
                .then((label: string | undefined) => {
                    if (!label) {
                        return;
                    }

                    if (settings.isDisplayIndexTags()) {
                        state.recordTag(filter.tag, label);
                    }

                    state.setQuery(filter.query(label));
                    commands.execute("openBangumi");
                    showTags();
                });
        },
    };
}
