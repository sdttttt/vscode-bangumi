# 项目开发指引

这是一个 VS Code 扩展（`bangumiopen`），在 Webview 面板中展示 B 站番剧信息。

## 构建与测试

包管理器固定为 pnpm 10（见 `package.json` 的 `packageManager` 字段），**不要**使用 npm 或 yarn。Node.js 需要 22 及以上（Vite 8、Vitest 5 与 ESLint 10 的要求）。

| 用途 | 命令 |
| --- | --- |
| 构建 | `pnpm build`（`vite build`） |
| 监听构建 | `pnpm watch`（`vite build --sourcemap inline --watch`） |
| 类型检查 | `pnpm test-compile`（`tsc -p ./ --noEmit`，strict 模式） |
| 单元测试 | `pnpm test`（Vitest 单次运行，监听模式用 `pnpm test:watch`） |
| 代码检查 | `pnpm eslint` |
| 格式化 + 自动修复 | `pnpm format`（先 prettier 再 `eslint --fix`） |
| 生产打包 | `pnpm vscode:prepublish`（`vite build --minify`） |
| 生成 VSIX | `pnpm dlx @vscode/vsce package --no-dependencies` |

提交改动前至少跑通 `pnpm test-compile`、`pnpm eslint`、`pnpm test`。CI（`.github/workflows/build.yml`）会先执行 `pnpm format` 再测试打包，所以请在本地先跑一次，避免提交的代码与格式化结果不一致。

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
- `build.target` 为 `node20`，对应 VS Code 1.100 起自带的 Node.js 运行时。

## 编码约定

- 4 空格缩进、双引号、行尾分号、Allman 花括号（左花括号独占一行）。这些由 [eslint.config.mjs](eslint.config.mjs) 强制，不要手动写成相反风格。
- 对象字面量要求 `key-spacing` 对齐（`name   : value`）。新增对象后请执行 `pnpm eslint:fix`。
- 不要单独执行 `pnpm prettie`：prettier 会把左花括号移到行尾，与 Allman 规则冲突。始终使用 `pnpm format`（先 prettier、再 eslint 修复），它输出的才是最终风格。
- 跨目录引用使用 `@/*` 别名指向 `src/*`，该别名在 `vite.config.mts` 与 `vitest.config.mts` 中均已配置。
- 视图类与提醒模块沿用 `export default new (class ...)` 的模块级单例写法，状态放在实例上，不要新增游离的模块级变量。
- 新增命令需同时修改 `contributes.commands`、`src/extension.ts` 中的注册，并 push 进 `context.subscriptions`。
- 用户配置统一通过 `src/configuration.ts` 的 `ConfigKey` 读取，不要直接调用 `workspace.getConfiguration`。
- Webview 引用 `resources/` 下的文件必须走 `getResourceFile(webview, name)`（内部调用 `webview.asWebviewUri`），不要再用已废弃的 `vscode-resource` scheme。
- `src/test/suite/request.ts` 不是测试用例（文件名缺少 `.test.ts` 后缀），Vitest 只收集 `src/**/*.{test,spec}.ts`。
