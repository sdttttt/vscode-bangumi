import { defineConfig } from "unocss";

/**
 * UnoCSS configuration of the webview.
 *
 * All webview styling is authored with atomic utilities: inline in the JSX when
 * a rule applies to one element, and as the shortcuts below when several
 * elements share it. The shortcuts keep the semantic class names the components
 * already used, so the markup stays readable and the tests keep their selectors.
 *
 * Colours are mapped onto the surface tokens declared in
 * `src/styles/main.css`, which in turn resolve to `--vscode-*` values. Every
 * screen therefore shares one palette and follows the active theme.
 *
 * `unocss/vite` already supplies the `presetWind3()` preset, so it is not
 * repeated here.
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
            muted: "var(--muted)",
            "warning-line": "var(--warning-line)",
            "warning-soft": "var(--warning-soft)",
            "warning-text": "var(--warning-text)",
        },
    },
    shortcuts: {
        /* -------------------------------------------------------------- shared */

        // The scrolling root of every screen. `.board` also owns the scrollbar
        // sizing in the base stylesheet.
        board: "box-border overflow-auto p-3 min-[600px]:p-5",
        // Card surface shared by the index cards and the week columns.
        surface:
            "box-border min-w-0 bg-surface border border-solid border-line rounded-3 [box-shadow:var(--card-shadow)]",
        // Small rounded label used by dates, times, badges and page numbers.
        chip: "inline-flex flex-none items-center px-2 py-0.5 text-[11px] leading-normal text-fg bg-tint rounded-full tabular-nums",
        "chip-accent": "text-accent bg-accent-soft",
        "chip-warning": "text-warning-text bg-warning-soft",
        "row-link":
            "text-inherit no-underline transition-colors duration-[120ms] motion-reduce:transition-none hover:no-underline",
        "focus-ring":
            "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-accent",

        /* ----------------------------------------------------------------- pager */

        pager: "sticky top-0 z-10 flex flex-wrap items-center gap-3 px-5 py-3 bg-editor border-b-1 border-b-solid border-line",
        "pager-button":
            "px-3 py-1 text-button-fg bg-button border-none rounded-[3px] cursor-pointer [font:inherit] hover:bg-button-hover",
        "page-number": "chip",

        /* ------------------------------------------------------------ index list */

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

        /* ---------------------------------------------------------- placeholder */

        load: "box-border flex h-screen flex-col items-center justify-center gap-4 p-6",
        "load-card":
            "flex flex-col items-center gap-3 px-10 py-8 bg-surface border border-solid border-line rounded-3 [box-shadow:var(--card-shadow)]",
        "load-image": "w-30 h-32.5 bg-tint rounded-2 object-contain",
        "load-text": "m-0 text-sm font-500 text-muted",

        /* ----------------------------------------------------------- week board */

        // `.board` supplies the padding and scrolling; the week view also pins
        // itself to the viewport height so the columns scroll sideways.
        "week-board":
            "h-screen [scroll-padding-inline:12px] min-[600px]:[scroll-padding-inline:20px]",
        week: "grid grid-flow-col auto-cols-[232px] min-[600px]:auto-cols-[252px] items-stretch gap-3 min-[600px]:gap-4 w-max m-0 p-0",
        item: "surface flex flex-col",
        // `!` wins over the colours of `item` regardless of the utilities order.
        today: "!border-accent [box-shadow:var(--card-shadow),0_0_0_1px_var(--accent)]",
        day: "flex items-center justify-between gap-2 px-3.5 py-3 border-b-1 border-b-solid border-line",
        "day-today":
            "[background-image:linear-gradient(180deg,var(--accent-soft),transparent)]",
        "day-title":
            "flex items-center gap-1.5 m-0 text-sm font-600 leading-[1.3] whitespace-nowrap",
        "day-title-today": "text-accent",
        "day-date": "chip flex-none",
        "today-badge": "inline-flex flex-none w-5.5 h-5.5",
        "today-badge-image": "block w-full h-full rounded-[4px]",
        timeline: "flex flex-col gap-4 p-3.5",
        "time-group": "flex flex-col gap-2",
        "time-point": "chip self-start font-600 tracking-[0.02em]",
        bangumi:
            "grid grid-cols-[56px_minmax(0,1fr)] items-center gap-2.5 p-2 rounded-2 row-link border border-solid border-transparent focus-ring hover:bg-hover hover:border-line",
        // A delayed season keeps its warning colours even while hovered; the
        // hover colours of `bangumi` would otherwise tie on specificity.
        delay: "!border-warning-line !bg-warning-soft",
        "season-cover": "block w-14 h-14 overflow-hidden bg-tint rounded-1.5",
        "season-cover-image": "block w-full h-full object-cover",
        "season-cover-delay": "grayscale opacity-85",
        "season-info": "flex flex-col gap-1 min-w-0",
        "season-title":
            "line-clamp-3 text-xs font-500 leading-[1.4] text-fg [overflow-wrap:anywhere] [.bangumi:hover_&]:text-accent",
        "season-title-delay": "!text-muted",
        "season-part":
            "block overflow-hidden text-[11px] text-accent tabular-nums leading-[1.4] text-ellipsis whitespace-nowrap",
        "season-part-delay": "!whitespace-normal !text-warning-text",
    },
});
