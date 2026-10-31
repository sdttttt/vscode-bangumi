# 项目开发指引

这是一个 VS Code 扩展（`bangumiopen`），在 Webview 面板中展示 B 站番剧信息。

## 构建与测试

包管理器固定为 pnpm 10（见 `package.json` 的 `packageManager` 字段），**不要**使用 npm 或 yarn。Node.js 需要 22 及以上（Vite 8、Vitest 5 与 oxlint 的要求）。

| 用途      | 命令                                                                |
| --------- | ------------------------------------------------------------------- |
| 构建      | `pnpm build`（`vite build`）                                        |
| 监听构建  | `pnpm watch`（`vite build --sourcemap inline --watch`）             |
| 类型检查  | `pnpm typecheck`（`tsc -p ./ --noEmit`，strict 模式，TypeScript 7） |
| 单元测试  | `pnpm test`（Vitest 单次运行，监听模式用 `pnpm test:watch`）        |
| 覆盖率    | `pnpm test:coverage`（v8，阈值 90% 行/函数、85% 分支）              |
| 代码检查  | `pnpm lint`（oxlint），自动修复用 `pnpm lint:fix`                   |
| 格式化    | `pnpm format`（oxfmt 原地写入），只检查用 `pnpm format:check`       |
| 生产打包  | `pnpm vscode:prepublish`（`vite build --minify`）                   |
| 生成 VSIX | `pnpm dlx @vscode/vsce@4.1.0 package --no-dependencies`             |

提交改动前至少跑通 `pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm test`。CI（`.github/workflows/build.yml`）会执行 `pnpm format:check` → `pnpm lint` → `pnpm test`（内含 `pretest` 的类型检查）→ `pnpm test:coverage` → 打包，所以请在本地先跑一次，避免提交的代码与格式化结果不一致。

## 目录结构与职责

- `src/extension.ts` —— 激活入口，注册 `package.json` 中声明的所有命令。
- `src/views/` —— `AbstractView` 封装 Webview 面板生命周期，另有番剧列表视图、周番视图及翻页状态。
- `src/html/` —— 各 Webview 页面的 HTML 生成器（番剧列表、周番列表、加载中、404）。
- `src/request/` —— axios 实例、URL 构造器、响应类型定义以及内存缓存（`cache.ts`）。
- `src/match/` —— 索引视图（年份 / 季度 / 标签 / 地区筛选），由若干静态列表模块组合而成。
- `src/reminder.ts` —— 状态栏条目，以及基于周番数据的更新提醒。
- `src/utils/` —— 纯函数工具（`strings`、`type`、`file`、`display`）。
- `src/test/` —— 单元测试目录，布局见下方「测试约定」。
- `resources/` —— CSS 与图片，通过 `context.extensionPath` 引用，不参与打包。

## 打包约束

打包由 Vite 的 library 模式完成，[vite.config.mts](vite.config.mts) 中有几处配置不能随意改动：

- 产物必须是 CommonJS 且位于 `dist/extension.js`（`build.lib` + `formats: ["cjs"]`），因为 `package.json#main` 指向该文件。
- `vscode` 与全部 Node 内置模块保持 external（`build.rolldownOptions.external`）。绝不要把 `vscode` 打进产物，也不要引入扩展宿主环境中不存在的运行时依赖。
- `resolve.mainFields: ["module", "main"]` 与 `resolve.conditions: ["node"]` 是必需的。缺少它们时 Vite 会解析到 axios 的浏览器版本，把 http 适配器替换成空实现，导致所有网络请求失效。验证方法是检查产物中仍存在 `isHttpAdapterSupported` 且不含 `browser-external` 桩。
- `build.target` 为 `node20`，对应 VS Code 1.100 自带的 Electron 34（内含 Node.js 20）。升级 `engines.vscode` 时记得同步调整这里的 target。
- `@types/vscode` 的 major.minor **不能高于** `engines.vscode`，这是 `vsce package` 的强制校验（`validateVSCodeTypesCompatibility`），不满足会直接打包失败。两者必须同步升级。
- `@types/vscode` 只用于类型检查，扩展运行时不受它影响；但不要依赖比 `engines.vscode` 更新的 API，否则老版本 VS Code 上会调用不存在的接口。
- `engines.vscode` 取 **最低可用版本**而非最新版，这是市场惯例（cpptools `^1.77`、python `^1.95`、eslint `^1.90`、gitlens `^1.101`）。VS Code 约每两周一版，锁死最新版会让老用户直接装不上。

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

- `src/test/unit/` —— Vitest 用例，按被测目录镜像分层（`utils/`、`request/`、`html/`、`match/`、`views/`）。
- `src/test/setup.ts` —— 全局 `setupFiles`，负责把 `vscode` 模块替换成桩，测试文件里不要再写 `vi.mock("vscode")`。
- `src/test/mocks/vscode.ts` —— `vscode` 桩工厂。新增用到的 API 时在这里补，不要在各用例里就地 mock。
- `src/test/mocks/fixtures/` —— 响应夹具（`bangumi.ts`、`weekBangumi.ts`），用带 `overrides` 的工厂函数构造，不要在用例里手写完整对象。
- 模块级单例（视图、`Reminder`、`Tagger`）状态会跨用例泄漏，用例里用 `vi.resetModules()` 后重新 `import()`；重新导入后需要重新 `setContext()`，因为 `@/constants` 也是新实例。
- 断言统一用 Vitest 原生 matcher（`toBe`/`toEqual`/`toBeUndefined`/`toBeGreaterThanOrEqual`），**不要**用 chai 风格（`to.be.equal`、`to.be.exist`）——后者是裸表达式，会迫使 oxlint 关掉 `no-unused-expressions`。
- 涉及时间、定时器、随机数的用例必须用假时钟（`vi.useFakeTimers()` + `vi.setSystemTime`）或 `vi.spyOn(Math, "random")`，不要依赖真实时钟。
- 请求层测试 `vi.mock("@/request/instance")`，用夹具构造响应；`Cache` 每例前调用 `clear()` 重置。
- `src/test/unit/manifest.test.ts` 校验 `package.json` 的 commands 与 `src/commands.ts` 的 `COMMAND_IDS` 一致、`@types/vscode` 不高于 `engines.vscode`。新增命令时先改 `src/commands.ts`，TypeScript 会强制 `extension.ts` 补上处理函数。

## 编码约定

- 4 空格缩进、双引号、行尾分号、K&R 花括号（`{` 与控制语句同行）。这些由 [.oxfmtrc.json](.oxfmtrc.json) 与 oxfmt 保证，不要手动写成相反风格。
- 跨目录引用使用 `@/*` 别名指向 `src/*`，该别名在 `vite.config.mts` 与 `vitest.config.mts` 中均已配置。
- 视图类与提醒模块沿用 `export default new (class ...)` 的模块级单例写法，状态放在实例上，不要新增游离的模块级变量。
- 新增命令需同时修改 `contributes.commands`、`src/commands.ts` 的 `COMMAND_IDS` 与 `src/extension.ts` 的 `handlers`。`handlers` 是 `Record<CommandId, …>`，漏写会编译失败；注册时统一 push 进 `context.subscriptions`。
- 用户配置统一通过 `src/configuration.ts` 的 `ConfigKey` 读取，不要直接调用 `workspace.getConfiguration`。
- Webview 引用 `resources/` 下的文件必须走 `getResourceFile(webview, name)`（内部调用 `webview.asWebviewUri`），不要再用已废弃的 `vscode-resource` scheme。
- Vitest 只收集 `src/test/unit/**/*.test.ts`。放在别处的 `.test.ts` 不会被执行。
