const CRITICAL_IMAGES = ["/hero-background.jpg", "/hero-mascot.svg", "/overreact.svg"];

function loadImage(src) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = resolve;
        image.src = src;
    });
}

function whenPainted(root) {
    return new Promise((resolve) => {
        const check = () => (root.firstChild ? resolve() : requestAnimationFrame(check));
        check();
    });
}

export function revealWhenReady(root) {
    const screen = document.getElementById("boot-screen");
    if (!screen) return;

    if (import.meta.hot && root.firstChild) {
        screen.remove();
        document.documentElement.classList.remove("booting");
        return;
    }

    Promise.all([whenPainted(root), document.fonts.ready.catch(() => undefined), ...CRITICAL_IMAGES.map(loadImage)]).then(
        () => {
            screen.classList.add("is-done");
            document.documentElement.classList.remove("booting");
            const done = () => screen.remove();
            screen.addEventListener("transitionend", done, { once: true });
            setTimeout(done, 700);
        },
    );
}
