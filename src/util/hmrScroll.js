const KEY = "overreact:scroll";

export function keepScrollOnHotReload(root) {
    if (!import.meta.hot) return;

    const html = document.documentElement;
    let last = null;

    const pin = (pos) => {
        last = pos;
        html.style.scrollBehavior = "auto";
        html.style.minHeight = `${pos.y + innerHeight}px`;
        window.scrollTo({ left: pos.x, top: pos.y, behavior: "auto" });
    };

    const unpin = () => {
        html.style.minHeight = "";
        html.style.scrollBehavior = "";
        sessionStorage.removeItem(KEY);
    };

    import.meta.hot.on("vite:beforeUpdate", () => pin({ x: scrollX, y: scrollY }));
    import.meta.hot.on("vite:afterUpdate", unpin);
    import.meta.hot.on("vite:beforeFullReload", () => {
        const pos = last ?? { x: scrollX, y: scrollY };
        sessionStorage.setItem(KEY, JSON.stringify(pos));
    });

    let pending = null;
    try {
        pending = JSON.parse(sessionStorage.getItem(KEY));
    } catch {
        pending = null;
    }
    if (!pending) return;

    history.scrollRestoration = "manual";
    pin(pending);

    const wait = () => {
        root.firstChild ? unpin() : requestAnimationFrame(wait);
    };
    wait();
}
