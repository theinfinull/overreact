import { render } from "./overreact";
import * as Overreact from "./overreact";
import App from "./App.jsx";

window.Overreact = Overreact;
console.log(
    "%c[Overreact] window.Overreact is ready. Try Overreact.createElement(\"div\", null, \"hello\").",
    "color: #a86ff7; font-weight: bold"
);

document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "yielding..." : "Overreact | Build Your Own React";
});

render(<App />, document.getElementById("root"));
