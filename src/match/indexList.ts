import type { Settings } from "../configuration";
import type { Commands } from "../commands";
import type { AppStore } from "../state/app";
import type { Notifier } from "../notifier";
import type { FilterSpec } from "./filterSpec";

/**
 * Dependencies of the filter menu.
 *
 * @author sdttttt
 */
export interface FilterMenuOptions {
    /** State the picked filters are written to. */
    readonly state: AppStore;
    /** Settings of the session. */
    readonly settings: Settings;
    /** User facing output. */
    readonly notifier: Notifier;
    /** Runs the extension commands. */
    readonly commands: Commands;
}

/**
 * The filter menu of one extension session.
 *
 * @author sdttttt
 */
export interface FilterMenu {
    /** Shows the choices of a filter and applies the picked one. */
    open(filter: FilterSpec): void;
}

/**
 * Creates the filter menu of one extension session.
 *
 * The tag is recorded before the query changes, and the bangumi list is only
 * opened once the query changed, matching the previous hook pipeline.
 *
 * @author sdttttt
 */
export function useFilterMenu(options: FilterMenuOptions): FilterMenu {
    const { state, settings, notifier, commands } = options;

    /**
     * Shows the labels of the tags picked so far.
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
