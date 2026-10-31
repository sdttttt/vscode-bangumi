# 项目开发指引

这是一个 VS Code 扩展（`bangumiopen`），在 Webview 面板中展示 B 站番剧信息。

## 构建与测试

包管理器固定为 pnpm 10（见 `package.json` 的 `packageManager` 字段），**不要**使用 npm 或 yarn。Node.js 需要 22 及以上（Vite 8、Vitest 5 与 oxlint 的要求）。

| 用途      | 命令                                                                   |
| --------- | ---------------------------------------------------------------------- |
| 构建      | `pnpm build`（`vite build`）                                           |
| 监听构建  | `pnpm watch`（`vite build --sourcemap inline --watch`）                |
| 类型检查  | `pnpm test-compile`（`tsc -p ./ --noEmit`，strict 模式，TypeScript 7） |
| 单元测试  | `pnpm test`（Vitest 单次运行，监听模式用 `pnpm test:watch`）           |
| 代码检查  | `pnpm lint`（oxlint），自动修复用 `pnpm lint:fix`                      |
| 格式化    | `pnpm format`（oxfmt 原地写入），只检查用 `pnpm format:check`          |
| 生产打包  | `pnpm vscode:prepublish`（`vite build --minify`）                      |
| 生成 VSIX | `pnpm dlx @vscode/vsce@4.1.0 package --no-dependencies`                |

提交改动前至少跑通 `pnpm test-compile`、`pnpm lint`、`pnpm format:check`、`pnpm test`。CI（`.github/workflows/build.yml`）会执行 `pnpm format` → `pnpm format:check` → `pnpm lint` → `pnpm test` → 打包，所以请在本地先跑一次，避免提交的代码与格式化结果不一致。

## 目录结构与职责

- `src/extension.ts` —— 激活入口，注册 `package.json` 中声明的所有命令。
- `src/views/` —— `AbstractView` 封装 Webview 面板生命周期，另有番剧列表视图、周番视图及翻页状态。
- `src/html/` —— 各 Webview 页面的 HTML 生成器（番剧列表、周番列表、加载中、404）。
- `src/request/` —— axios 实例、URL 构造器、响应类型定义以及内存缓存（`cache.ts`）。
- `src/match/` —— 索引视图（年份 / 季度 / 标签 / 地区筛选），由若干静态列表模块组合而成。
- `src/reminder.ts` —— 状态栏条目，以及基于周番数据的更新提醒。
- `src/utils/` —— 纯函数工具（`strings`、`type`、`file`、`display`）。
- `src/test/suite/` —— Vitest 用例，目前只覆盖纯函数与请求模块。
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

- `npx tsc` / `pnpm test-compile` 正常工作
- 任何依赖 TypeScript 旧版 API 的工具（如 typescript-eslint）都无法使用，因此本项目不再引入这类工具

如果将来需要 oxlint 的类型感知规则（`--type-aware`），要额外安装 `oxlint-tsgolint` 包。

## 编码约定

- 4 空格缩进、双引号、行尾分号、K&R 花括号（`{` 与控制语句同行）。这些由 [.oxfmtrc.json](.oxfmtrc.json) 与 oxfmt 保证，不要手动写成相反风格。
- 跨目录引用使用 `@/*` 别名指向 `src/*`，该别名在 `vite.config.mts` 与 `vitest.config.mts` 中均已配置。
- 视图类与提醒模块沿用 `export default new (class ...)` 的模块级单例写法，状态放在实例上，不要新增游离的模块级变量。
- 新增命令需同时修改 `contributes.commands`、`src/extension.ts` 中的注册，并 push 进 `context.subscriptions`。
- 用户配置统一通过 `src/configuration.ts` 的 `ConfigKey` 读取，不要直接调用 `workspace.getConfiguration`。
- Webview 引用 `resources/` 下的文件必须走 `getResourceFile(webview, name)`（内部调用 `webview.asWebviewUri`），不要再用已废弃的 `vscode-resource` scheme。
- `src/test/suite/request.ts` 不是测试用例（文件名缺少 `.test.ts` 后缀），Vitest 只收集 `src/**/*.{test,spec}.ts`。
