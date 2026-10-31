# 项目开发指引

这是一个 VS Code 扩展（`bangumiopen`），在 Webview 面板中展示 B 站番剧信息。

## 构建与测试

包管理器固定为 pnpm 10（见 `package.json` 的 `packageManager` 字段），**不要**使用 npm 或 yarn。Node.js 需要 22 及以上（Vite 8、Vitest 5 与 oxlint 的要求）。

| 用途      | 命令                                                             |
| --------- | ---------------------------------------------------------------- |
| 构建      | `pnpm build`（先扩展、后 Webview，两条独立流水线）               |
| 监听构建  | `pnpm watch`（并行跑 `watch:extension` 与 `watch:webview`）      |
| 类型检查  | `pnpm typecheck`（`tsc -p ./` + `tsc -p webview`，strict，TS 7） |
| 单元测试  | `pnpm test`（Vitest 双 project，监听模式用 `pnpm test:watch`）   |
| 覆盖率    | `pnpm test:coverage`（v8，阈值 90% 行/函数、85% 分支）           |
| 代码检查  | `pnpm lint`（oxlint），自动修复用 `pnpm lint:fix`                |
| 格式化    | `pnpm format`（oxfmt 原地写入），只检查用 `pnpm format:check`    |
| 生产打包  | `pnpm vscode:prepublish`（等价 `pnpm build`）                    |
| 生成 VSIX | `pnpm package`（本地 `vsce`，附加参数写在 `--` 之后）            |

提交改动前至少跑通 `pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm test`。

## GitHub Actions

`.github/workflows/build.yml` 是唯一的校验入口，`push`、`pull_request` 与 `workflow_call` 三种触发方式共用同一份定义：

- `quality` —— `format:check`、`lint`、`typecheck` 三个独立步骤，失败时能一眼看出问题类别。
- `test` —— 只跑 `pnpm test:coverage`。覆盖率命令本身就会执行全部用例，再跑一次 `pnpm test` 纯属浪费。
- `package` —— 依赖前两个 job，构建并上传 `bangumiopen.vsix`。

发布由 `.github/workflows/release.yml` 在推送 `v*` 标签时触发：先以 `workflow_call` 复用 `build.yml`（完整校验 + 产出 VSIX），再下载**同一份**产物推送到 VS Code Marketplace、Open VSX 与 GitHub Release。三处发布共用一份 VSIX，产物不会互相漂移。

- 依赖安装统一走 `.github/actions/setup` 复合 action，`pnpm` 版本取自 `package.json#packageManager`，Node 版本取自 `.nvmrc`。
- 版本以 `package.json` 为准：标签去掉 `v` 后必须等于版本号、或以其为前缀（`v2.2.8` 与 `v2.2.8.patch3` 都算 `2.2.8`），否则发布 job 直接失败。
- 只有 `x.y.z` 形式的版本视为正式版，`v2.3.0.beta.1` 这类会带上 `--pre-release`。
- 令牌通过环境变量传入（`VSCE_PAT`、`OVSX_PAT`），不要写成命令行参数，否则会出现在进程列表里。
- `vsce` / `ovsx` 已装为 devDependency（`pnpm package` / `pnpm publish:vsce` / `pnpm publish:ovsx`），不要再在 CI 里 `dlx`，这样可以锁版本。

## 目录结构与职责

- `src/extension.ts` —— 激活入口，注册 `package.json` 中声明的所有命令。
- `src/views/` —— `AbstractView` 封装 Webview 面板生命周期与消息通道，另有番剧列表视图、周番视图及翻页状态。
- `src/webview/` —— 宿主侧 Webview 基础设施：`protocol.ts`（双向消息类型，两段共享）、`host.ts`（CSP、nonce、`localResourceRoots`、资源 URI）、`viewModel.ts`（API 原始数据 → 渲染载荷）。
- `webview/` —— 独立的前端工程（Preact + TypeScript + UnoCSS），源码在 `webview/src/`，样式配置在 `webview/uno.config.ts`，产物由 `vite.webview.mts` 输出到 `webview-dist/`。
- `src/request/` —— `http.ts`（`fetch` 封装与超时）、URL 构造器、响应类型定义以及内存缓存（`cache.ts`）。
- `src/match/` —— 索引视图（年份 / 季度 / 标签 / 地区筛选），由若干静态列表模块组合而成。
- `src/reminder/` —— 更新提醒：`schedule.ts`（周番数据 → 触发事件，纯函数）、`scheduler.ts`（单定时器重新调度器，可注入时钟）、`statusBar.ts`（状态栏条目封装）、`index.ts`（配置、数据源与生命周期编排）。
- `src/utils/` —— 纯函数工具（`strings`、`type`、`file`、`display`、`clock`（UTC+8 日界）、`titles`（通知文案））。
- `src/test/` —— 单元测试目录，布局见下方「测试约定」。
- `resources/` —— 占位图片，由宿主通过 `asWebviewUri` 注入给 Webview，不参与打包。

## 打包约束

扩展与 Webview 各有一个 Vite 配置，**依次**执行（`pnpm build` 已封装）：

- [vite.config.mts](vite.config.mts) → `dist/extension.js`（CommonJS，Node.js 20）
- [vite.webview.mts](vite.webview.mts) → `webview-dist/main.js` + `webview-dist/main.css`（ES module，Chromium 132）

两者不能合并成一个数组配置：Vite 8 的 `defineConfig` 只接受单个对象（传数组会报 `config must export or return an object`）。也不能让 Webview 产物落在 `dist/` 下：`emptyOutDir` 会清空整个 `outDir`，扩展的监听构建每次重编都会把 `dist/webview` 一并删掉，所以 Webview 产物固定在仓库根部的 `webview-dist/`。

[vite.config.mts](vite.config.mts) 中有几处配置不能随意改动：

- 产物必须是 CommonJS 且位于 `dist/extension.js`（`build.lib` + `formats: ["cjs"]`），因为 `package.json#main` 指向该文件。
- `vscode` 与全部 Node 内置模块保持 external（`build.rolldownOptions.external`）。绝不要把 `vscode` 打进产物，也不要引入扩展宿主环境中不存在的运行时依赖。
- `resolve.mainFields: ["module", "main"]` 与 `resolve.conditions: ["node"]` 是必需的：缺少它们时 Vite 会解析到依赖的浏览器版本，把只在 Node.js 下可用的实现替换成空桩。验证方法是产物中不含 `browser-external` 桩。
- `build.target` 为 `node20`，对应 VS Code 1.100 自带的 Electron 34（内含 Node.js 20）。升级 `engines.vscode` 时记得同步调整这里的 target；`vite.webview.mts` 的 `chrome132` 同理（Electron 34 = Chromium 132）。
- Webview 配置里 `base: "./"` 与 `build.lib` + `formats: ["es"]` 是必需的。`base` 绝对路径会在 `vscode-webview://` 源下解析失败；lib 模式保证产物文件名固定为 `main.js`，宿主无需读取 manifest。CSS 通过 `rolldownOptions.output.assetFileNames` 固定为 `main.css`，因为 ES 格式的 lib 产物不会 import 自己的样式表。
- UnoCSS 插件必须传入配置文件路径（`UnoCSS(path.resolve(import.meta.dirname, "webview/uno.config.ts"))`），不能依赖默认的文件查找：Vite 的 root 是 `webview/`，但插件按 `process.cwd()`（仓库根）查找，会报 `Config file not found` 并退回默认配置，产物里所有自定义颜色与 shortcut 都会消失。
- Webview 侧不允许 `import "vscode"`，也不允许 Node.js 内置模块；`webview/tsconfig.json` 已把 `types` 限定为 `vscode-webview`，越界会直接编译失败。
- `@types/vscode` 的 major.minor **不能高于** `engines.vscode`，这是 `vsce package` 的强制校验（`validateVSCodeTypesCompatibility`），不满足会直接打包失败。两者必须同步升级。
- `@types/vscode` 只用于类型检查，扩展运行时不受它影响；但不要依赖比 `engines.vscode` 更新的 API，否则老版本 VS Code 上会调用不存在的接口。
- `engines.vscode` 取 **最低可用版本**而非最新版，这是市场惯例（cpptools `^1.77`、python `^1.95`、eslint `^1.90`、gitlens `^1.101`）。VS Code 约每两周一版，锁死最新版会让老用户直接装不上。

## Webview 架构

Webview 不再是字符串拼接出来的静态 HTML，而是一个独立构建的前端应用。两段之间的契约是 `src/webview/protocol.ts`。

- 宿主只负责取数、生命周期与消息转发：`AbstractView.render(state)` 把 `ViewState` 通过 `postMessage` 推给 Webview，视图类不再拼 HTML。
- Webview 启动后先 `postMessage({ type: "ready" })`，宿主收到后重放最后一份 state。因为 `retainContextWhenHidden: false`，面板每次显示都会重建文档，重放是让内容不丢的唯一手段。
- Webview 侧的交互（翻页、跳页、刷新）通过 `WebviewCommand` 回传给宿主，宿主仍在 `src/views/` 里维持页码等业务状态，Webview 保持无状态。
- 不要再往 Webview 里加直连 HTTP 的代码：Webview 没有 Node.js、受 CORS 限制，请求、缓存、错误提示都留在宿主侧的 `src/request/`。
- 文档由 `createWebviewHtml()` 生成，必须是完整 HTML（`<!DOCTYPE html>` + `charset` + `viewport`），并带 CSP 与 nonce。禁止引入 inline `<script>`。
- 需要新增本地图片时，走 `createAssetUris()` 放进 `ViewState.assets`，由 Webview 从 props 取用；不要硬编码 `vscode-resource` 或绝对路径。
- 两个视图的 `viewType` 必须唯一（现为 `bangumiOpen.list` 与 `bangumiOpen.week`），重复会让 `registerWebviewPanelSerializer` 之类的 API 冲突。

## 代码检查与格式化

代码检查用 [oxlint](https://oxc.rs/docs/guide/usage/linter)，配置在 [.oxlintrc.json](.oxlintrc.json)；格式化用 [oxfmt](https://oxc.rs/docs/guide/usage/formatter)，配置在 [.oxfmtrc.json](.oxfmtrc.json)。两者都是 Rust 原生实现，速度远快于 ESLint + Prettier。

- oxlint **不实现**格式化类规则（`indent`、`quotes`、`semi`、`brace-style`、`key-spacing` 等），这些全部由 oxfmt 负责，不要在 oxlint 配置里写。
- oxfmt **只支持 K&R 花括号风格**，没有 `braceStyle` 选项。因此本项目统一使用 `if (cond) {` 同行写法，不要手动改成左花括号独占一行。
- oxfmt 会重排 import（`import { A, B } from "x";` 合并为一行）并把对象属性的对齐冒号还原成单个空格，这是预期行为。
- `pnpm format` 会原地改写文件；提交前用 `pnpm format:check` 确认无差异。

## TypeScript 版本约定

项目直接使用 TypeScript 7（`typescript@^7.0.2`）。它是 Go 原生实现，**不提供 JS 编译器 API**：

- `npx tsc` / `pnpm typecheck` 正常工作
- 任何依赖 TypeScript 旧版 API 的工具（如 typescript-eslint）都无法使用，因此本项目不再引入这类工具

如果将来需要 oxlint 的类型感知规则（`--type-aware`），要额外安装 `oxlint-tsgolint` 包。

## 测试约定

全部用例都是可在纯 Node.js 里运行的单元测试，不启动 VS Code，也不打真实网络。

Vitest 配置了两个 project，互不干扰：

- `extension`（`node` 环境）—— `src/test/unit/**/*.test.ts`
- `webview`（`happy-dom` 环境）—— `webview/src/**/*.test.tsx`

`pnpm test` 会跑两者；只跑一侧用 `vitest run --project webview`。

- `src/test/unit/` —— 宿主侧用例，按被测目录镜像分层（`utils/`、`request/`、`match/`、`views/`、`webview/`）。
- `webview/src/**/*.test.tsx` —— 组件用例，与被测组件同目录。渲染用 `@testing-library/preact` 的 `render`/`screen`，查询用语义选择器（`getByText`），不要断言完整 HTML 字符串。
- `src/test/setup.ts` —— 全局 `setupFiles`，负责把 `vscode` 模块替换成桩，测试文件里不要再写 `vi.mock("vscode")`。
- `src/test/mocks/vscode.ts` —— `vscode` 桩工厂。新增用到的 API 时在这里补，不要在各用例里就地 mock。
- `src/test/mocks/fixtures/` —— 响应夹具（`bangumi.ts`、`weekBangumi.ts`），用带 `overrides` 的工厂函数构造，不要在用例里手写完整对象。
- `src/test/mocks/panel.ts` —— `WebviewPanel` 桩，记录 `postMessage` 的每一份 state，并支持 `receive()` 模拟 Webview 发来的命令。视图测试一律用它，不要再手工拼 `webview` 对象。
- 模块级单例（视图、`Reminder`、`Tagger`）状态会跨用例泄漏，用例里用 `vi.resetModules()` 后重新 `import()`；重新导入后需要重新 `setContext()`，因为 `@/constants` 也是新实例。
- 断言统一用 Vitest 原生 matcher（`toBe`/`toEqual`/`toBeUndefined`/`toBeGreaterThanOrEqual`），**不要**用 chai 风格（`to.be.equal`、`to.be.exist`）——后者是裸表达式，会迫使 oxlint 关掉 `no-unused-expressions`。
- 涉及时间、定时器、随机数的用例必须用假时钟（`vi.useFakeTimers()` + `vi.setSystemTime`）或 `vi.spyOn(Math, "random")`，不要依赖真实时钟。
- 提醒相关的用例用 `new Reminder(source, now)` 注入假数据源与时钟，不要 `import()` 模块单例；`src/reminder/*` 的纯函数与调度器各自有独立用例，改动其中一处时同步补对应断言。
- 请求层测试 `vi.mock("@/request/instance")`，用夹具构造响应；`Cache` 每例前调用 `clear()` 重置。
- `src/test/unit/manifest.test.ts` 校验 `package.json` 的 commands 与 `src/commands.ts` 的 `COMMAND_IDS` 一致、`@types/vscode` 不高于 `engines.vscode`。新增命令时先改 `src/commands.ts`，TypeScript 会强制 `extension.ts` 补上处理函数。
- Webview 用例需要在 `acquireVsCodeApi` 存在的前提下运行；`webview/src/test/setup.ts` 已注入桩，断言消息用其中的 `vsCodeApi`。Preact 的 effect 清理是异步刷新的，涉及卸载的断言要先 `await new Promise(r => setTimeout(r, 0))`，否则会读到未清理的监听器。

## 编码约定

- 4 空格缩进、双引号、行尾分号、K&R 花括号（`{` 与控制语句同行）。这些由 [.oxfmtrc.json](.oxfmtrc.json) 与 oxfmt 保证，不要手动写成相反风格。
- 宿主侧跨目录引用使用 `@/*` 别名指向 `src/*`，该别名在 `vite.config.mts` 与 `vitest.config.mts` 中均已配置。
- Webview 侧代码放在 `webview/src/`，用相对路径引用同目录模块；共享协议用 `@shared/webview/protocol`（映射到 `src/webview/protocol.ts`）。`protocol.ts` 必须保持零运行时依赖，两端都要能编译。
- Webview 组件一律写成函数组件 + Preact hooks，JSX 走 `jsx: "react-jsx"` + `jsxImportSource: "preact"`（`webview/tsconfig.json` 与 `vitest.config.mts` 的 `oxc.jsx.importSource` 各配一份，改一处就要同步另一处）。
- 样式统一用 UnoCSS（`webview/uno.config.ts`）编写：单元素规则直接写原子类，多处复用的写成 shortcut。颜色只能来自 `theme.colors` 里映射的 `--vscode-*` 变量与 `--surface` / `--line` / `--accent` 等表面 token，不要硬编码色值，否则明暗主题下会看不清。
- `webview/src/styles/main.css` 只保留原子类表达不了的部分：文档 reset、`:where(a)` 默认链接样式、共享表面 token（`--surface` / `--line` / `--tint` / `--hover` / `--accent` / `--muted` / `--warning-*` / `--card-shadow`），以及依赖祖先选择器的主题覆盖（`body.vscode-dark`、`vscode-high-contrast`、`vscode-reduce-motion`、滚动条）。它在 `uno.css` 之后导入，同权重时后者胜出，所以这里的规则可以放心覆盖工具类。
- 三个页面（索引列表、周番、加载/空态）共用同一套 shortcut：`board`（滚动根）、`surface`（卡片表面）、`chip`（小标签）、`row-link`（整行链接）、`focus-ring`。新增页面优先复用它们，不要另造一套色值。
- `.today` / `.delay` 用 `!` 前缀（如 `!border-accent`）压过同一元素的其它颜色工具类：UnoCSS 的输出顺序不按 class 书写顺序，不加 `!` 时结果不可预测。
- `@unocss/vite` 会自动扫描 `.tsx`，但也会把源码里的普通英文单词当成候选类名（例如注释里的 `tab stop` 会生成 `.tab`）。这些多出来的规则无害，不要为了消除它们而下调 `content` 的扫描范围：关掉 pipeline 会让 Vite 引入的虚拟样式表解析失败。
- 视图类沿用 `export default new (class ...)` 的模块级单例写法，状态放在实例上，不要新增游离的模块级变量。
- `Reminder` 是显式 `new Reminder()` 的类实例：可注入数据源与时钟，实现 `Disposable` 并在 `context.subscriptions` 中注册，不要在模块求值时创建 `StatusBarItem`。
- 新增命令需同时修改 `contributes.commands`、`src/commands.ts` 的 `COMMAND_IDS` 与 `src/extension.ts` 的 `handlers`。`handlers` 是 `Record<CommandId, …>`，漏写会编译失败；注册时统一 push 进 `context.subscriptions`。
- 用户配置统一通过 `src/configuration.ts` 的 `ConfigKey` 读取，不要直接调用 `workspace.getConfiguration`。
- 宿主引用 `resources/` 下的图片必须走 `getResourceFile(webview, name)`（内部调用 `webview.asWebviewUri`），不要再用已废弃的 `vscode-resource` scheme。
- Vitest 只收集 `src/test/unit/**/*.test.ts` 与 `webview/src/**/*.test.tsx`。放在别处的测试文件不会被执行，新增目录时记得同步 `vitest.config.mts` 的 `include`。
