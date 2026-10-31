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
 * Label that clears every filter.
 *
 * @author sdttttt
 */
export const RESTORE_LABEL = "(恢复默认)";

/**
 * Every filter of the menu, in the order it is offered.
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
 * Menu labels, with the restore entry last.
 *
 * @author sdttttt
 */
export const MENU_LABELS: ReadonlyArray<string> = [
    ...FILTERS.map(filter => filter.label),
    RESTORE_LABEL,
];

/**
 * Dependencies of the index menu command.
 *
 * @author sdttttt
 */
export interface IndexCommandOptions {
    readonly state: AppStore;
    readonly menu: FilterMenu;
    /** User facing output. */
    readonly notifier: Notifier;
    readonly filters?: ReadonlyArray<FilterSpec>;
}

/**
 * Builds the filter menu command of one extension session.
 *
 * @author sdttttt
 */
export function useIndexCommand(options: IndexCommandOptions): {
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
