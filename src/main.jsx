import { render } from "./overreact";
import App from "./App.jsx";
import { keepScrollOnHotReload } from "./util/hmrScroll";
import { revealWhenReady } from "./util/boot";

const root = document.getElementById("root");
keepScrollOnHotReload(root);
render(<App />, root);
revealWhenReady(root);
