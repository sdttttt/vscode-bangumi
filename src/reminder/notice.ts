import type { ScheduleEvent } from "./schedule";

/**
 * Remaining time under which an event is announced as already published.
 *
 * @author sdttttt
 */
export const PUBLISHED_THRESHOLD_MS = 60_000;

/**
 * What the user has to be told about a due event.
 *
 * @author sdttttt
 */
export type Notice =
    | { readonly kind: "published" }
    | { readonly kind: "ahead"; readonly minutes: number };

/**
 * Decides which notification a due event deserves.
 *
 * Pure, so the threshold and the rounding of the remaining time are covered by
 * the unit tests without a fake editor.
 *
 * @author sdttttt
 */
export function describeNotice(event: ScheduleEvent, now: number): Notice {
    const remain = event.pubTs - now;

    if (PUBLISHED_THRESHOLD_MS >= remain) {
        return { kind: "published" };
    }

    return { kind: "ahead", minutes: Math.ceil(remain / 60_000) };
}
