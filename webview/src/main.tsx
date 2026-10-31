import { render } from "preact";
import { Root } from "./Root";
// 由 UnoCSS 生成；先导入，后面的基础规则在权重相同时才能生效。
import "uno.css";
import "./styles/main.css";

/*
 * 启动逻辑。与 `Root` 分开，组件测试因此不需要挂载文档。
 */
const root = document.getElementById("app");

if (root) {
    render(<Root />, root);
}
