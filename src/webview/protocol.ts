/**
 * Message protocol shared by the extension host and the webview bundle.
 *
 * This file must stay free of runtime dependencies: it is imported by both
 * sides, and the webview bundle must never pull in `vscode` or Node.js.
 *
 * @author sdttttt
 */

/**
 * Which screen the webview should render.
 *
 * @author sdttttt
 */
export type ViewKind = "loading" | "notFound" | "bangumi" | "weekBangumi";

/**
 * A day of the weekly schedule, flattened for rendering.
 *
 * @author sdttttt
 */
export interface WeekDayPayload {
    date: string;
    dayOfWeek: number;
    /** Localised weekday label, resolved by the host. */
    label: string;
    isToday: boolean;
    seasons: Array<SeasonPayload>;
}

/**
 * One season entry of the weekly schedule.
 *
 * @author sdttttt
 */
export interface SeasonPayload {
    cover: string;
    delay: boolean;
    delayIndex: string;
    delayReason: string;
    pubIndex: string;
    pubTime: string;
    title: string;
    url: string;
}

/**
 * One bangumi of the index list.
 *
 * @author sdttttt
 */
export interface BangumiPayload {
    badge: string;
    cover: string;
    finish: boolean;
    indexShow: string;
    link: string;
    order: string;
    title: string;
}

/**
 * Data sent from the extension host to the webview.
 *
 * @author sdttttt
 */
export interface ViewState {
    kind: ViewKind;
    /** Rendered page number, only meaningful for `bangumi`. */
    page?: number;
    bangumis?: Array<BangumiPayload>;
    days?: Array<WeekDayPayload>;
    /** URIs the webview cannot guess, resolved through `asWebviewUri`. */
    assets?: AssetUris;
}

/**
 * Local files the webview has to load. The host fills them in because only the
 * extension side can turn a disk path into a webview-safe URI.
 *
 * @author sdttttt
 */
export interface AssetUris {
    todayBadge: string;
    enterprise: string;
    loading: string;
}

/**
 * Commands the webview may send back to the extension host.
 *
 * @author sdttttt
 */
export type WebviewCommand =
    | { type: "ready" }
    | { type: "bangumi:nextPage" }
    | { type: "bangumi:backPage" }
    | { type: "bangumi:jumpPage" }
    | { type: "weekBangumi:refresh" };
