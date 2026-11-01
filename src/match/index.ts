import type { FilterSpec } from "./filterSpec";
import type { Notifier } from "../notifier";
import type { AppStore } from "../state/app";
import type { FilterMenu } from "./indexList";
import SeasonVersionList from "./seasonVersionList";
import AreaList from "./areaList";
import FinishList from "./finishList";
import CopyRightList from "./copyRightList";
import SeasonStatusList from "./seasonStatusList";
import SeasonMonthList from "./seasonMonthList";
import YearList from "./yearList";
import StyleList from "./styleList";

/**
 * 清空所有筛选的菜单文案。
 *
 * @author sdttttt
 */
export const RESTORE_LABEL = "(恢复默认)";

/**
 * 菜单中的全部筛选，按展示顺序排列。
 *
 * @author sdttttt
 */
export const FILTERS: ReadonlyArray<FilterSpec> = [
    SeasonVersionList,
    AreaList,
    FinishList,
    CopyRightList,
    SeasonStatusList,
    SeasonMonthList,
    YearList,
    StyleList,
];

/**
 * 菜单文案，恢复默认项排在最后。
 *
 * @author sdttttt
 */
export const MENU_LABELS: ReadonlyArray<string> = [
    ...FILTERS.map(filter => filter.label),
    RESTORE_LABEL,
];

/**
 * 索引菜单命令的依赖。
 *
 * @author sdttttt
 */
export interface IndexCommandOptions {
    readonly state: AppStore;
    readonly menu: FilterMenu;
    /** 面向用户的输出。 */
    readonly notifier: Notifier;
    readonly filters?: ReadonlyArray<FilterSpec>;
}

/**
 * 创建一次扩展会话的筛选菜单命令。
 *
 * @author sdttttt
 */
export function createIndexCommand(options: IndexCommandOptions): {
    openIndex(): void;
} {
    const filters = options.filters ?? FILTERS;
    const menu = options.menu;
    const byLabel = new Map(filters.map(filter => [filter.label, filter]));

    const choose = (label: string): void => {
        if (RESTORE_LABEL === label) {
            options.state.resetQuery();
            options.state.clearTags();
            return;
        }

        const filter = byLabel.get(label);
        if (undefined === filter) {
            options.notifier.info("抱歉，这个选项还在施工中");
            return;
        }

        menu.open(filter);
    };

    return {
        openIndex: () => {
            void options.notifier
                .pick([...byLabel.keys(), RESTORE_LABEL])
                .then((label: string | undefined) => {
                    if (label) {
                        choose(label);
                    }
                });
        },
    };
}
