import { render } from "preact";
import { Root } from "./Root";
import "./styles/main.css";

/*
 * Bootstrap. Kept separate from `Root` so the component can be tested without
 * a mounted document.
 */
const root = document.getElementById("app");

if (root) {
    render(<Root />, root);
}
