import { defineConfig } from "unocss";

/**
 * Webview 的 UnoCSS 配置。
 *
 * Webview 的样式全部用原子类编写：只作用于单个元素时直接写在 JSX 上，
 * 多个元素共用时写成下面的 shortcut。shortcut 保留了组件原本就在用的语义类名，
 * 因此结构可读，测试里的选择器也不受影响。
 *
 * 颜色映射到 `webview/src/styles/main.css` 里声明的表面 token，
 * 而这些 token 又解析到 `--vscode-*` 变量，所有界面因此共用同一套配色并跟随当前主题。
 *
 * `unocss/vite` 已经内置 `presetWind3()`，这里不再重复声明。
 *
 * @author sdttttt
 */
export default defineConfig({
    theme: {
        colors: {
            editor: "var(--vscode-editor-background)",
            fg: "var(--vscode-foreground)",
            link: "var(--vscode-textLink-foreground)",
            "link-active": "var(--vscode-textLink-activeForeground)",
            button: "var(--vscode-button-background)",
            "button-fg": "var(--vscode-button-foreground)",
            "button-hover": "var(--vscode-button-hoverBackground)",
            "button-border": "var(--vscode-button-border, transparent)",
            panel: "var(--panel-border)",
            focus: "var(--focus-border)",
            surface: "var(--surface)",
            line: "var(--line)",
            tint: "var(--tint)",
            hover: "var(--hover)",
            accent: "var(--accent)",
            "accent-soft": "var(--accent-soft)",
            gold: "var(--gold)",
            muted: "var(--muted)",
            "warning-line": "var(--warning-line)",
            "warning-soft": "var(--warning-soft)",
            "warning-text": "var(--warning-text)",
        },
    },
    shortcuts: {
        /* -------------------------------------------------------------- 共享 */

        // 每个界面的滚动根节点。`.board` 还在基础样式表里负责滚动条尺寸。
        board: "box-border overflow-auto p-3 min-[600px]:p-5",
        // 索引卡片与周番列共用的卡片表面。
        surface:
            "box-border min-w-0 bg-surface border border-solid border-line rounded-3 [box-shadow:var(--card-shadow)]",
        // 日期、时刻、徽标与页码共用的小圆角标签。
        chip: "inline-flex flex-none items-center px-2 py-0.5 text-[11px] leading-normal text-fg bg-tint rounded-full tabular-nums",
        "chip-accent": "text-accent bg-accent-soft",
        "chip-warning": "text-warning-text bg-warning-soft",
        "row-link":
            "text-inherit no-underline transition-colors duration-[120ms] motion-reduce:transition-none hover:no-underline",
        "focus-ring":
            "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-accent",

        /* ----------------------------------------------------------------- 分页器 */

        pager: "sticky top-0 z-10 flex flex-wrap items-center gap-3 px-5 py-3 bg-editor border-b-1 border-b-solid border-line",
        "pager-button":
            "px-3 py-1 text-button-fg bg-button border-none rounded-[3px] cursor-pointer [font:inherit] hover:bg-button-hover",
        "page-number": "chip",

        /* ------------------------------------------------------------ 索引列表 */

        "bangumi-grid":
            "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr))]",
        cover: "grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3.5 p-3.5 surface row-link focus-ring hover:border-accent",
        "cover-media": "block w-24 h-32 overflow-hidden bg-tint rounded-1.5",
        "cover-image": "block w-full h-full object-cover",
        "cover-body": "flex min-w-0 flex-1 flex-col gap-2",
        "cover-head": "flex items-start justify-between gap-2",
        "cover-title":
            "m-0 text-sm font-600 leading-[1.4] line-clamp-2 [overflow-wrap:anywhere] [.cover:hover_&]:text-accent",
        "cover-meta":
            "flex flex-wrap items-center gap-2 text-[11px] text-muted tabular-nums",
        "cover-foot": "mt-auto flex items-center justify-between gap-2 pt-1",
        btn: "inline-flex flex-none items-center rounded-[3px] px-[11px] py-[3px] text-[11px] text-button-fg bg-button border border-solid border-button-border hover:bg-button-hover hover:text-button-fg hover:no-underline",

        /* ---------------------------------------------------------- 占位界面 */

        load: "box-border flex h-screen flex-col items-center justify-center gap-4 p-6",
        "load-card":
            "flex flex-col items-center gap-3 px-10 py-8 bg-surface border border-solid border-line rounded-3 [box-shadow:var(--card-shadow)]",
        // 插图是 746×870 的竖向立绘（约 1:1.17），画框按同一比例取值，
        // 否则更方的框会把立绘裁掉或留出明显的留白。
        "load-image": "w-28 h-32.5 bg-tint rounded-2 object-contain",
        "load-text": "m-0 text-sm font-500 text-muted",

        /* ----------------------------------------------------------- 周番面板 */

        // 内边距与滚动由 `.board` 提供；周番视图还会把自己固定为视口高度，
        // 让各列可以横向滚动。
        "week-board":
            "h-full [scroll-padding-inline:12px] min-[600px]:[scroll-padding-inline:20px]",
        // 来源提示条占住高度后，剩下的空间才交给可滚动的日程。
        "week-shell": "flex h-screen flex-col",
        "week-source":
            "flex-none flex items-center justify-between gap-3 px-3 py-1.5 text-[11px] leading-normal text-muted bg-tint border-b-1 border-b-solid border-line min-[600px]:px-5",
        // 提示文案可能很长，允许它换行并占满剩余宽度，按钮因此始终贴在最右侧。
        "week-source-note": "m-0 min-w-0",
        "week-source-switch":
            "flex-none px-2 py-0.5 text-[11px] leading-normal text-button-fg bg-button border border-solid border-button-border rounded-[3px] cursor-pointer [font:inherit] hover:bg-button-hover focus-ring",
        week: "grid grid-flow-col auto-cols-[232px] min-[600px]:auto-cols-[252px] items-stretch gap-3 min-[600px]:gap-4 w-max m-0 p-0",
        item: "surface flex flex-col",
        // 无论工具类的输出顺序如何，`!` 都能压过 `item` 的颜色。
        today: "!border-accent [box-shadow:var(--card-shadow),0_0_0_1px_var(--accent)]",
        day: "flex items-center justify-between gap-2 px-3.5 py-3 border-b-1 border-b-solid border-line",
        "day-today":
            "[background-image:linear-gradient(180deg,var(--accent-soft),transparent)]",
        "day-title":
            "flex items-center gap-1.5 m-0 text-sm font-600 leading-[1.3] whitespace-nowrap",
        "day-title-today": "text-accent",
        "day-date": "chip flex-none",
        // 徽标的画框沿用插图的竖立比例；方框会把全身立绘裁成一条。
        "today-badge": "inline-flex flex-none w-6 h-7",
        "today-badge-image": "block w-full h-full rounded-[3px] object-cover",
        timeline: "flex flex-col gap-4 p-3.5",
        "time-group": "flex flex-col gap-2",
        "time-point": "chip self-start font-600 tracking-[0.02em]",
        // 当天的「你在这里」标记：闪烁的金色箭头加上当前时刻，使标记既能在日程的
        // 蓝色强调中脱颖而出，又不会被误读成又一个更新时段。
        "now-marker":
            "flex items-center gap-1.5 py-0.5 text-[11px] font-600 leading-[1.4] text-gold tabular-nums select-none",
        "now-arrow": "flex-none animate-pulse motion-reduce:animate-none",
        "now-label": "flex-none whitespace-nowrap",
        "now-countdown": "flex-none whitespace-nowrap opacity-90",
        bangumi:
            "grid grid-cols-[56px_minmax(0,1fr)] items-center gap-2.5 p-2 rounded-2 row-link border border-solid border-transparent focus-ring hover:bg-hover hover:border-line",
        // 延期番剧在悬浮时也保持警告色，否则会和 `bangumi` 的悬浮色权重打平。
        delay: "!border-warning-line !bg-warning-soft",
        "season-cover": "block w-14 h-14 overflow-hidden bg-tint rounded-1.5",
        "season-cover-image": "block w-full h-full object-cover",
        "season-cover-delay": "grayscale opacity-85",
        // Bangumi 的封面绝大多数是书封式的长条（约 1:1.4），套进方形画框会被上下裁掉一大半，
        // 因此它单独用一套更高的画框，让封面本身的构图完整露出来。
        "season-poster": "block w-14 h-20 overflow-hidden bg-tint rounded-1.5",
        "season-poster-image": "block w-full h-full object-cover",
        "season-info": "flex flex-col gap-1 min-w-0",
        "season-title":
            "line-clamp-3 text-xs font-500 leading-[1.4] text-fg [overflow-wrap:anywhere] [.bangumi:hover_&]:text-accent",
        "season-title-delay": "!text-muted",
        "season-part":
            "block overflow-hidden text-[11px] text-accent tabular-nums leading-[1.4] text-ellipsis whitespace-nowrap",
        "season-part-delay": "!whitespace-normal !text-warning-text",
        // Bangumi 才有评分，因此单独一行、靠左，不与首播日期抢位置。
        "season-score": "self-start",
    },
});
