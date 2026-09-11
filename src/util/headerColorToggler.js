const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
probe.canvas.width = 1;
probe.canvas.height = 1;

function luminance(color) {
    if (!color || color === "transparent") return null;

    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
    if (a < 50) return null;

    const toLinear = (value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    };

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function syncNavTitleColor(header, title) {
    const rect = title.getBoundingClientRect();
    const x = Math.min(window.innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
    const y = Math.min(window.innerHeight - 1, Math.max(0, rect.top + rect.height / 2));

    header.style.visibility = "hidden";
    const stack = document.elementsFromPoint(x, y);
    header.style.visibility = "";

    let onLight = false;
    for (const node of stack) {
        if (!(node instanceof Element)) continue;
        const lum = luminance(getComputedStyle(node).backgroundColor);
        if (lum == null) continue;
        onLight = lum > 0.55;
        break;
    }

    title.classList.toggle("text-dark", onLight);
    title.classList.toggle("text-light", !onLight);
}

export function watchNavTitleColor(header, title) {
    let frame = 0;
    const sample = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => syncNavTitleColor(header, title));
    };

    sample();
    window.addEventListener("scroll", sample, { passive: true });
    window.addEventListener("resize", sample);

    return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", sample);
        window.removeEventListener("resize", sample);
    };
}
