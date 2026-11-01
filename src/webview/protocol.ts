/**
 * 扩展宿主与 Webview 打包产物共用的消息协议。
 *
 * 这个文件必须保持零运行时依赖：两端都会导入它，而 Webview 产物绝不能
 * 引入 `vscode` 或 Node.js。
 *
 * @author sdttttt
 */

/**
 * Webview 应当渲染哪个界面。
 *
 * @author sdttttt
 */
export type ViewKind = "loading" | "notFound" | "bangumi" | "weekBangumi";

/**
 * 周番数据中的一天，为渲染而展平。
 *
 * @author sdttttt
 */
export interface WeekDayPayload {
    date: string;
    dayOfWeek: number;
    /** 本地化的星期文案，由宿主解析。 */
    label: string;
    isToday: boolean;
    seasons: Array<SeasonPayload>;
    /** 该天的数据来源，缺省按 B 站处理。 */
    source?: WeekSourceKind;
}

/**
 * 周番表的数据来源。
 *
 * 这个文件必须保持零运行时依赖，因此这里单独声明一份，
 * 而不是从请求层引类型。
 *
 * @author sdttttt
 */
export type WeekSourceKind = "bilibili" | "bangumi";

/**
 * 周番数据中的单部番剧。
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
    /** 原名；与中文名相同时省略。 */
    originalTitle?: string;
    /** 评分 0–10，只有 Bangumi 提供。 */
    score?: number;
}

/**
 * 索引列表中的单部番剧。
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
 * 由扩展宿主发往 Webview 的数据。
 *
 * @author sdttttt
 */
export interface ViewState {
    kind: ViewKind;
    /** 当前渲染的页码，仅对 `bangumi` 有意义。 */
    page?: number;
    bangumis?: Array<BangumiPayload>;
    days?: Array<WeekDayPayload>;
    /** 周番表的数据来源，供 Webview 决定是否显示来源提示。 */
    source?: WeekSourceKind;
    /** Webview 无法自行推出的 Uri，由 `asWebviewUri` 解析。 */
    assets?: AssetUris;
}

/**
 * Webview 需要加载的本地文件。由宿主填充，因为只有扩展侧才能把磁盘路径
 * 转换成 Webview 可安全访问的 Uri。
 *
 * @author sdttttt
 */
export interface AssetUris {
    todayBadge: string;
    enterprise: string;
    loading: string;
}

/**
 * Webview 可能回传给扩展宿主的命令。
 *
 * @author sdttttt
 */
export type WebviewCommand =
    | { type: "ready" }
    | { type: "bangumi:nextPage" }
    | { type: "bangumi:backPage" }
    | { type: "bangumi:jumpPage" }
    | { type: "weekBangumi:refresh" }
    /**
     * 只切换当前面板的数据来源，不写回设置项。
     *
     * 与刷新分开，宿主因此能区分「重拉当前来源」与「换一个来源再拉」。
     */
    | { type: "weekBangumi:switchSource"; source: WeekSourceKind };
