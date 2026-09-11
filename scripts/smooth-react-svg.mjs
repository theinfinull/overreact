import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../public/1mNUjUK01.svg", import.meta.url), "utf8");
const raw = [...src.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1].replace(/\s+/g, " ").trim());

function tokenize(d) {
    const tokens = [];
    const re = /([MmZzLlHhVvCcSsQqTtAa])|([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;
    let match;
    while ((match = re.exec(d))) {
        tokens.push(match[1] ?? Number(match[2]));
    }
    return tokens;
}

function parseSubpaths(d) {
    const tokens = tokenize(d);
    const subpaths = [];
    let i = 0;
    let x = 0;
    let y = 0;
    let sx = 0;
    let sy = 0;
    let cmd = null;
    let current = null;

    const take = (n) => tokens.slice(i, (i += n)).map(Number);

    while (i < tokens.length) {
        const t = tokens[i];
        if (typeof t === "string") {
            cmd = t;
            i += 1;
        } else if (!cmd) {
            throw new Error("path started without a command");
        }

        if (cmd === "M" || cmd === "m") {
            const [a, b] = take(2);
            if (cmd === "m") {
                x += a;
                y += b;
            } else {
                x = a;
                y = b;
            }
            sx = x;
            sy = y;
            current = {
                start: { x, y },
                cubics: [],
            };
            subpaths.push(current);
            cmd = cmd === "m" ? "l" : "L";
            continue;
        }

        if (cmd === "Z" || cmd === "z") {
            if (current) current.closed = true;
            x = sx;
            y = sy;
            cmd = null;
            continue;
        }

        if (cmd === "C" || cmd === "c") {
            const [x1, y1, x2, y2, x3, y3] = take(6);
            const p1 = cmd === "c" ? { x: x + x1, y: y + y1 } : { x: x1, y: y1 };
            const p2 = cmd === "c" ? { x: x + x2, y: y + y2 } : { x: x2, y: y2 };
            const p3 = cmd === "c" ? { x: x + x3, y: y + y3 } : { x: x3, y: y3 };
            current.cubics.push({ p0: { x, y }, p1, p2, p3 });
            x = p3.x;
            y = p3.y;
            continue;
        }

        if (cmd === "L" || cmd === "l") {
            const [a, b] = take(2);
            const nx = cmd === "l" ? x + a : a;
            const ny = cmd === "l" ? y + b : b;
            current.cubics.push({
                p0: { x, y },
                p1: { x: x + (nx - x) / 3, y: y + (ny - y) / 3 },
                p2: { x: x + (2 * (nx - x)) / 3, y: y + (2 * (ny - y)) / 3 },
                p3: { x: nx, y: ny },
            });
            x = nx;
            y = ny;
            continue;
        }

        throw new Error(`unsupported command ${cmd}`);
    }

    return subpaths;
}

function toView({ x, y }) {
    return { x: x * 0.1, y: 600 - y * 0.1 };
}

function cubicPoint(c, t) {
    const mt = 1 - t;
    const a = mt * mt * mt;
    const b = 3 * mt * mt * t;
    const d = 3 * mt * t * t;
    const e = t * t * t;
    return {
        x: a * c.p0.x + b * c.p1.x + d * c.p2.x + e * c.p3.x,
        y: a * c.p0.y + b * c.p1.y + d * c.p2.y + e * c.p3.y,
    };
}

function sampleSubpath(sub, steps = 6) {
    const pts = [toView(sub.start)];
    for (const cubic of sub.cubics) {
        const c = {
            p0: toView(cubic.p0),
            p1: toView(cubic.p1),
            p2: toView(cubic.p2),
            p3: toView(cubic.p3),
        };
        for (let s = 1; s <= steps; s += 1) {
            pts.push(cubicPoint(c, s / steps));
        }
    }
    return pts;
}

function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointToSeg(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return dist(p, a);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function rdp(points, epsilon) {
    if (points.length < 3) return points;
    let maxD = 0;
    let idx = 0;
    const first = points[0];
    const last = points[points.length - 1];
    for (let i = 1; i < points.length - 1; i += 1) {
        const d = pointToSeg(points[i], first, last);
        if (d > maxD) {
            maxD = d;
            idx = i;
        }
    }
    if (maxD > epsilon) {
        const left = rdp(points.slice(0, idx + 1), epsilon);
        const right = rdp(points.slice(idx), epsilon);
        return left.slice(0, -1).concat(right);
    }
    return [first, last];
}

function chaikin(points, iterations = 2) {
    let pts = points;
    for (let n = 0; n < iterations; n += 1) {
        const next = [];
        const len = pts.length;
        for (let i = 0; i < len; i += 1) {
            const a = pts[i];
            const b = pts[(i + 1) % len];
            next.push({
                x: 0.75 * a.x + 0.25 * b.x,
                y: 0.75 * a.y + 0.25 * b.y,
            });
            next.push({
                x: 0.25 * a.x + 0.75 * b.x,
                y: 0.25 * a.y + 0.75 * b.y,
            });
        }
        pts = next;
    }
    return pts;
}

function catmullToBezier(points) {
    const n = points.length;
    if (n < 2) return "";
    const p = (i) => points[(i + n) % n];
    let d = `M${p(0).x.toFixed(2)} ${p(0).y.toFixed(2)}`;
    for (let i = 0; i < n; i += 1) {
        const p0 = p(i - 1);
        const p1 = p(i);
        const p2 = p(i + 1);
        const p3 = p(i + 2);
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return `${d}Z`;
}

function smoothClosed(points, epsilon) {
    const simplified = rdp(points, epsilon);
    const closed =
        dist(simplified[0], simplified[simplified.length - 1]) < 0.8
            ? simplified.slice(0, -1)
            : simplified;
    return catmullToBezier(chaikin(closed, 2));
}

const main = parseSubpaths(raw[0]).map((sub) => sampleSubpath(sub, 5));
const outer = main[0];
const hole = main[1];

const outerD = smoothClosed(outer, 1.15);
const holeD = smoothClosed(hole, 1.05);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 517 600" fill="none">
  <path d="${outerD}" fill="#dbeafe"/>
  <path d="${outerD}${holeD}" fill="#0284c7" fill-rule="evenodd"/>
</svg>
`;

writeFileSync(new URL("../public/1mNUjUK01.svg", import.meta.url), svg);
console.log("wrote smoothed svg", { outerPts: outer.length, holePts: hole.length });
