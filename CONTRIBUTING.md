# Contributing & Maintaining

如果你尝试为**BangumiOpen**做出贡献, 非常感谢!

请阅读这份文件, 或许能更好的帮助你了解**BangumiOpen**的工作方式.

### A brief explanation on the source code structure

**目录说明:**

- match: 存放索引功能模块的源代码.
- request: 网络请求模块, 以及请求缓存功能的源代码都在这里.
- test: 存放宿主侧单元测试. `unit/` 下按被测模块镜像分层, `mocks/` 存放 `vscode` 桩、`WebviewPanel` 桩与响应夹具. 全部用例在纯 Node.js 中运行, 不打真实网络.
- utils: 一些方便于开发的工具函数.
- views: 视图模块, 控制 Webview 面板生命周期与消息通道的入口.
- webview: 宿主侧的 Webview 基础设施 (`protocol.ts` / `host.ts` / `viewModel.ts`), 双向消息类型都定义在 `protocol.ts`.
- ../webview: 独立的前端工程 (Preact + TypeScript), 组件与组件测试都在 `webview/src/`, 产物由 `vite.webview.mts` 输出到 `webview-dist/`.

### Thanks

Good luck!!
![](https://imgkr2.cn-bj.ufileos.com/09d60862-2758-4fdc-b13b-ad74d448ad40.jpg?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=6Vs%252BA4g3BTzZEqh1WvBoodL5Jv8%253D&Expires=1598088303)
