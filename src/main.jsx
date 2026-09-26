import { render } from "./overreact";
import App from "./App.jsx";
import { keepScrollOnHotReload } from "./util/hmrScroll";

const root = document.getElementById("root");
keepScrollOnHotReload(root);
render(<App />, root);
