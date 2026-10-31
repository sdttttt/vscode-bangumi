# Change Log

All notable changes to the **Bangumi Open** extension will be documented in this file.

## [1.0.0] - 2020-2-10

### Add

- 完成获取番剧页面。

## [1.0.1] - 2020-2-10

### Fix

- 修复窗口关闭后无法重新打开的 Bug
- 重构部分代码, 优化性能

### Add

- 增加`页面跳转`功能
- 增加`下一页`和`上一页`的快捷键

## [1.1.0] - 2020-2-13

### Add

- 增加了`周推`的获取接口
- 完成了`周推`的页面

## [1.1.1] - 2020-2-18

### Fix

- 这次的几乎重构了超过 **85%** 的代码. 对大量逻辑进行了抽象拆分. 对性能上的影响未知.
- 修改`KeyBind`,解决`快捷键`冲突问题.

## [1.2.0] - 2020-2-22

### Add

- 增加了`番剧更新提醒`.
- 增加加载页面.
- 使用选项配置是否开启番剧提醒.

## [1.2.1] - 2020-3-5

### Fix

- 在每周新番中会,如果是`今天`会标注一个败犬的 badge.
- 追番提醒中多一个打开`WeekBangumi`的选项.

## [1.3.0] - 2020-3-8

### Add

- 在提醒功能中, 可以自定义提醒的提前时间.

### Fix

- 优化了周番界面的显示.

## [1.3.1] - 2020-3-10

### Fix

- 重构页面的资源加载
- 优化性能，增加了请求缓存

## [1.3.2] - 2020-3-11

### Fix

- 减小插件体积.压缩了**90%**以上.

## [2.0.0] - 2020-3-13

### Add

- 增加了番剧索引功能.
- 完善番剧索引列表 (除了 "风格" Tag 还没有完成)
- 优化索引使用体验, 增加`Tag`提示,可在配置文件中关闭.

### Fix

- 遵循 ESLint 代码规范.

## [2.0.1] - 2020-3-14

### Fix

- 修复页数过大时一直在加载页面的问题.
- 优化使用体验.

## [2.1.0] - 2020-3-16

### Add

- 完成了 "Style" Tag.

### Fix

- 重构部分代码.

## [2.1.1] - 2020-3-17

### Fix

- 重构 Index List 大部分代码.

## [2.1.2] - 2020-3-19

### Fix

- 减小插件体积

## [2.1.3] - 2020-3-23

### Fix

- 修改 README.

### Add

- **README** 中加入聊天室地址

## [2.1.4] - 2020-4-14

### Fix

- 修改 README.

## [2.1.5] - 2020-7-25

### Fix

- 修改 README.
- 转移 CI.

## [2.1.6] - 2020-10-26

### Add

- 修改 README.
- 加入`Open VSX`市场.

## [2.1.7] - 2020-10-27

### Fix

- 修复发布问题.

## [2.2.0] - 2020-12-3

### Add

- 增加在状态栏的更新提示, 可关闭.

### Fix

- 重新编写 README.
- 优化插件体积.
- 重构部分代码.

## [2.2.1] - 2020-12-8

### Fix

- 修复状态栏提示显示不正确的问题.

## [2.2.2] - 2020-12-8

### Fix

- 锕, 我错了,2.2.1 版本发布的压缩后的 CSS 没有打包到扩展里, 所以看起来很诡异.

## [2.2.3] - 2020-12-14

### Fix

- 更新依赖.

## [2.2.4] - 2021-2-10

### Feat

- 加强状态栏显示.
- 更新依赖.

## [2.2.5] - 2021-4-1

### Feat

- 更新依赖.

### Fix

- vscode 启动时出现扩展主机去世.

## [2.2.6] - 2021-4-2

### Feat

- 更新依赖.

### Fix

- 修复遇到空时间段番剧不显示提醒状态栏的问题. (Fix #187)

## [2.2.7] - 2021-4-7

### Feat

- 更新依赖.
- 增加了一个计数通知请求, 现在 BangumiOpen 会统计大 🔥 的使用每个功能的次数. 这个数据是公开的我会定时发布.

## [2.2.8] - 2022-3-11

### Feat

- 优化插件激活触发事件, 从任意事件激活改为空闲激活. 对 VSCode 启动速度优化.
- 构建工具从 Webpack 迁移到 Rollup.

### Fix

- 修复 Match 模块循环依赖问题.

## [2.3.0] - 2026-10-31

### Feat

- 构建工具链迁移到 Vite 8（Rolldown），移除 tsup 与 Babel 配置.
- 依赖全面升级: TypeScript 7, Vitest 5, axios 1.21.
- 类型检查切换到 TypeScript 7 原生编译器, 本项目类型检查耗时下降约 2.7 倍.
- 代码检查与格式化从 ESLint + Prettier 迁移到 oxlint + oxfmt, 两者均为 Rust 原生实现, 运行速度大幅提升.
- 移除 typescript-eslint 后不再需要兼容 TypeScript 6 的 API, 依赖树中 TypeScript 只保留 7.0.2 一个版本.
- 依赖升级到最新版: `@types/node` 26.6.6, axios 1.21.0, oxlint 1.90.0, oxfmt 0.75.0, TypeScript 7.0.2, Vite 8.3.5, Vitest 5.0.5. `@types/vscode` 保持 `~1.100.0` 以匹配 `engines.vscode`（vsce 要求类型包版本不得高于引擎版本）.
- CI 中 `vsce` 与 `ovsx` 锁定到明确版本, 避免发布流程随时间漂移.
- 包管理器升级到 pnpm 10, CI 使用 Node.js 22.
- 最低 VS Code 版本提升到 1.100, 构建目标对齐扩展宿主自带的 Node.js 20（Electron 34）.
- Webview 资源改用 `webview.asWebviewUri`, 移除已废弃的 `vscode-resource` scheme.
- 新增 `pnpm test:watch` 监听模式, `pnpm test` 改为单次运行.

### Style

- 代码风格从 Allman 花括号改为 K&R, 与 oxfmt 的输出保持一致.

### Fix

- 修复加载页面与未找到页面的 HTML 缓存导致跨面板复用旧资源 URI 的问题.
- 移除 `isValidBangumisRequest as isValidBangumisRequest` 这类无意义的重命名导入.

## [Unreleased]

### CI

- `.github/workflows/build.yml` 拆成 `quality` / `test` / `package` 三个 job，不再重复跑 `pnpm test` 与 `pnpm test:coverage`。
- 合并 `upload_release.yml` 与 `vsce_publish.yml` 为 `release.yml`：标签触发时先复用 `build.yml` 做完整校验并产出 VSIX，再下载同一份产物发布到 VS Code Marketplace、Open VSX 与 GitHub Release，三处不再各自打包。
- 新增 `.github/actions/setup` 复合 action 与 `.nvmrc`，`pnpm` 版本取自 `packageManager`，Node 版本取自 `.nvmrc`。
- 新增标签与 `package.json` 版本的一致性校验，以及 `--pre-release` 的自动判定。
- 工作流升级到 `actions/checkout@v7`、`actions/setup-node@v7`、`pnpm/action-setup@v6`、`actions/upload-artifact@v7`、`actions/download-artifact@v8`、`softprops/action-gh-release@v3`，并补上 `permissions`、`concurrency`、`timeout-minutes`。
- `vsce` 与 `ovsx` 改为 devDependency，新增 `pnpm package` / `pnpm publish:vsce` / `pnpm publish:ovsx`。
- 覆盖率报告（`coverage/lcov.info`）作为 artifact 上传；Dependabot 增加 `github-actions` 生态并按周分组。

### Changed

- Webview 渲染从宿主侧字符串拼接迁移到独立的前端工程（Preact + TypeScript，`webview/` 目录），由 `vite.webview.mts` 单独构建到 `webview-dist/`。
- 宿主与 Webview 改为 `postMessage` 通信：宿主推送 `ViewState`，Webview 回传翻页/刷新命令，业务状态（页码、缓存）仍留在扩展侧。
- 视图文档统一由 `createWebviewHtml()` 生成，补齐 `<!DOCTYPE html>`、`charset`、`viewport`，并加入 CSP 与 nonce；面板现在设置 `enableScripts: true`。
- 分类/周番视图的 `viewType` 由共用的 `html` 拆分为 `bangumiOpen.list` 与 `bangumiOpen.week`，避免面板类型冲突。
- 样式改用 `--vscode-*` CSS 变量，跟随编辑器明暗主题；删除 `resources/css/` 下的三份静态样式表。
- Webview 样式迁移到 UnoCSS（`webview/uno.config.ts`）：颜色映射到 VS Code 主题变量，复用规则写成 shortcut，`webview/src/styles/main.css` 只保留 reset、`:where(a)`、共享表面 token 与主题覆盖。
- 索引列表页与加载/空态页按周番页的设计语言重写：三页共用 `board` / `surface` / `chip` 表面与卡片样式，索引卡片改为自适应网格、整卡可点击，封面比例与周番条目一致。
- `pnpm build` 改为依次构建扩展与 Webview；`pnpm typecheck` 同时检查 `webview/tsconfig.json`。

### Test

- 测试目录重组为 `src/test/unit/`，按被测模块镜像分层（`utils`、`request`、`html`、`match`、`views`），替代原先含义模糊的 `test/suite/`。
- 新增 `src/test/setup.ts` 与 `src/test/mocks/vscode.ts`，把 `vscode` 模块桩集中到一处并由 `setupFiles` 全局注入，测试文件不再逐个 `vi.mock`。
- 新增 `src/test/mocks/fixtures/` 响应夹具，替换原先直接请求 B 站线上 API 的测试。
- 断言统一为 Vitest 原生 matcher，移除 chai 风格（`to.be.equal`、`to.be.exist`）与随之而来的 `no-unused-expressions` 全局豁免。
- 时间、定时器与随机数相关用例改用假时钟与 `Math.random` 桩，消除跨零点、跨时区的偶发失败。
- 新增 `pnpm test:coverage` 与 v8 覆盖率阈值（行/函数 90%、分支 85%），覆盖率从 0 提升到约 98%。
- 新增 `src/commands.ts` 与 `src/test/unit/manifest.test.ts`，校验 `package.json` 的命令声明、`activationEvents`、`@types/vscode` 与 `engines.vscode` 的一致性。
- 删除从未被 Vitest 收集的 `src/test/suite/request.ts`（线上 API 测试），请求层改为 mock axios 的确定性用例。

- Vitest 改为双 project：`extension`（node 环境，`src/test/unit`）与 `webview`（happy-dom 环境，`webview/src/**/*.test.tsx`）。
- 新增 `src/test/mocks/panel.ts` 与 `src/test/unit/webview/`，覆盖消息通道、CSP/nonce 与数据映射。

### Fix

- 修复 `Cache.set` 覆盖同一 key 时旧计时器未取消，导致新值被提前清除的问题；新增 `Cache.clear()`。
- 修复标签页与周番页共用 `viewType` 为 `html` 导致的 Webview 面板类型冲突。
- 修复 `Reminder` 在今日索引为 0 时误判为"没有找到今日的索引"而跳过提醒的问题。
