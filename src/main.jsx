import { useOverReact } from "./overreact/index.js";
import App from "./components/App.js";

useOverReact();

const container = document.getElementById("root");

overreact.render(<App appName="Overreact" />, container);
