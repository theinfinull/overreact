import { useEffect, useState } from "../overreact";

const OUCH = ["OUCH!", "HEY!!", "RUDE.", "STOP IT", "WHY THO", "OW OW OW", "I FELT THAT", "AGAIN?!", "MY FACE!"];
const MILESTONES = {
    10: "10?! YOU OK?",
    25: "CALLING HR",
    50: "50 RE-RENDERS",
    100: "LEGEND.",
};
const GLANCES = ["WHAT'S THAT?", "NOTHING THERE", "TRY CLICK", "EYES ONLY", "I ONLY COUNT CLICKS"];
const messageFor = (count) => (count === 0 ? "PRESS CLICK" : (MILESTONES[count] ?? OUCH[(count - 1) % OUCH.length]));

// 16px wide sprites: "X" is a lit pixel, "." lets the screen show through
const BODY = [
    "......X..X......",
    "....XXXXXXXX....",
    "...XXXXXXXXXX...",
    "..XXXXXXXXXXXX..",
    "..XXXXXXXXXXXX..",
    "..XXXXXXXXXXXX..",
    "..XXXXXXXXXXXX..",
    "..XXXXX..XXXXX..",
    "..XXXXXXXXXXXX..",
    "...XXXXXXXXXX...",
    "....XXXXXXXX....",
];
const HIT = [
    "......X..X......",
    ".X..XXXXXXXX..X.",
    "X..XXXXXXXXXX..X",
    "..XXX.XXXX.XXX..",
    "..XXXX.XX.XXXX..",
    "..XXX.XXXX.XXX..",
    "..XXXXXXXXXXXX..",
    "..XXXX....XXXX..",
    "..XXXX....XXXX..",
    "...XXXXXXXXXX...",
    "....XXXXXXXX....",
];
// eyes are cut out of BODY in screen colour, so they can slide around without redrawing it
const EYES = ["", "", "", "", ".....XX..XX.....", ".....XX..XX....."];
const EYELIDS = ["", "", "", "", ".....XX..XX....."];
const FEET = ["....XX....XX....", "...XXX....XXX..."];
const CENTER = [0, 0];

function Pixels({ rows, top = 0 }) {
    // one rect per run of lit pixels
    return rows.flatMap((row, y) =>
        [...row.matchAll(/X+/g)].map((run) => (
            <rect key={`${y}-${run.index}`} x={run.index} y={y + top} width={run[0].length} height={1} />
        )),
    );
}

function Sprite({ hit, look }) {
    return (
        <svg viewBox="0 0 16 13" shapeRendering="crispEdges" fill="currentColor" className="w-28" aria-hidden="true">
            <g className={hit ? "animate-shake" : ""}>
                <g className={hit ? "" : "animate-breathe"}>
                    <Pixels rows={hit ? HIT : BODY} />
                    {!hit && (
                        <g transform={`translate(${look[0]} ${look[1]})`}>
                            <g className="fill-lcd">
                                <Pixels rows={EYES} />
                            </g>
                            <g className="animate-blink">
                                <Pixels rows={EYELIDS} />
                            </g>
                        </g>
                    )}
                </g>
                <Pixels rows={FEET} top={11} />
            </g>
        </svg>
    );
}

const score = (n) => String(n).padStart(6, "0");

function Screen({
    off = false,
    count = 0,
    best = 0,
    message = "",
    beat = 0,
    hit = false,
    look = CENTER,
    delta = null,
}) {
    return (
        <div
            className={`rounded-lg border-10 border-dark2 px-3 pb-4 pt-2 font-mono text-lcd-ink transition-colors duration-300 ${off ? "bg-lcd-off" : "bg-lcd"}`}
        >
            <div className={off ? "invisible" : ""}>
                <div className="flex items-start justify-between font-bold tabular-nums">
                    <div>
                        <div className="text-[0.55rem] tracking-[0.2em]">SCORE</div>
                        <div className="text-3xl font-black leading-none tracking-tight">{score(count)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[0.55rem] tracking-[0.2em]">HIGH SCORE</div>
                        <div className="mt-0.5 text-sm leading-none">{score(Math.max(best, count))}</div>
                    </div>
                </div>
                <div className="flex h-9 items-end justify-center">
                    <span
                        aria-live="polite"
                        className={`relative bg-lcd-ink px-2.5 py-1.5 text-[0.65rem] font-black leading-none tracking-wider text-lcd shadow-[2px_2px_0_rgb(47_74_26/0.3)] after:absolute after:left-1/2 after:top-full after:size-2 after:-translate-x-1/2 after:bg-lcd-ink after:content-[""] after:[clip-path:polygon(0_0,100%_0,50%_100%)] ${message ? "" : "invisible"} ${beat % 2 ? "animate-pop" : "animate-pop-again"}`}
                    >
                        {message}
                    </span>
                </div>
                <div className="relative mt-3 flex justify-center">
                    <Sprite hit={hit} look={look} />
                    <span
                        aria-hidden="true"
                        className={`absolute right-4 top-0 text-lg font-black ${beat % 2 ? "animate-rise" : "animate-rise-again"}`}
                    >
                        {delta ? `+${delta}` : ""}
                    </span>
                </div>
            </div>
        </div>
    );
}

// printed lettering on the console shell
const label = "font-sans text-[0.7rem] font-bold tracking-[0.12em] text-gb-ink select-none";
// shallow groove moulded into the shell around a button
const well = "rounded-full bg-dark/[0.06] shadow-[inset_0_1px_3px_rgb(0_0_0/0.16),0_1px_0_rgb(255_255_255/0.8)]";

const round =
    "block size-12 shrink-0 cursor-pointer rounded-full bg-gb-button ring-1 ring-gb-button-dark/60 " +
    "shadow-[inset_0_2px_1px_rgb(255_255_255/0.18),inset_0_-2px_2px_rgb(0_0_0/0.22),0_2px_3px_rgb(0_0_0/0.35)] " +
    "transition-[translate,box-shadow] duration-75 enabled:active:translate-y-px " +
    "enabled:active:shadow-[inset_0_2px_3px_rgb(0_0_0/0.3),0_1px_1px_rgb(0_0_0/0.3)] disabled:cursor-default";
const pill =
    "block h-3 w-12 cursor-pointer rounded-full bg-[linear-gradient(to_bottom,#555552,#2a2a28)] ring-1 ring-black/50 " +
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(0_0_0/0.3)] transition-[translate,box-shadow] duration-75 " +
    "enabled:active:translate-y-px enabled:active:shadow-[inset_0_1px_2px_rgb(0_0_0/0.35)] disabled:cursor-default";

const arrow =
    "flex cursor-pointer items-center justify-center bg-[#1e1e1d] enabled:active:bg-black disabled:cursor-default";
const ridge = "rounded-full bg-black/70 shadow-[0_1px_0_rgb(255_255_255/0.1)]";
const ARROWS = [
    { label: "Up", look: [0, -1], across: true, className: "col-start-2 rounded-t-[4px]" },
    { label: "Left", look: [-1, 0], across: false, className: "col-start-1 row-start-2 rounded-l-[4px]" },
    { label: "Right", look: [1, 0], across: false, className: "col-start-3 row-start-2 rounded-r-[4px]" },
    { label: "Down", look: [0, 1], across: true, className: "col-start-2 row-start-3 rounded-b-[4px]" },
];

function DPad({ onPress, off }) {
    return (
        <div className="grid size-24 grid-cols-3 grid-rows-3 drop-shadow-[0_3px_0_var(--color-light3)]">
            {ARROWS.map(({ label, look, across, className }) => (
                <button
                    key={label}
                    type="button"
                    onClick={() => onPress(look)}
                    disabled={off}
                    aria-label={`Look ${label.toLowerCase()}`}
                    className={`${arrow} ${className}`}
                >
                    <span className={`flex gap-[3px] ${across ? "flex-col" : ""}`} aria-hidden="true">
                        {[0, 1, 2].map((n) => (
                            <span key={n} className={`${ridge} ${across ? "h-0.5 w-3.5" : "h-3.5 w-0.5"}`} />
                        ))}
                    </span>
                </button>
            ))}
            <span className="col-start-2 row-start-2 flex items-center justify-center bg-[#1e1e1d]">
                <span className="size-4 rounded-full shadow-[inset_0_1px_2px_rgb(0_0_0/0.7),0_1px_0_rgb(255_255_255/0.08)]" />
            </span>
        </div>
    );
}

const noop = () => {};

function Controls({
    off = false,
    count = 0,
    onLook = noop,
    onPoke = noop,
    onReset = noop,
    onStale = noop,
    onQueued = noop,
}) {
    return (
        <div className="flex flex-col gap-7">
            <div className="flex items-center justify-between">
                <DPad onPress={onLook} off={off} />
                {/* only the groove and lettering tilt; the buttons stay upright so they read as circles */}
                <div className="relative flex shrink-0 items-center gap-3 pb-5 pr-1">
                    <span
                        aria-hidden="true"
                        className={`${well} absolute left-[-0.375rem] top-[-0.375rem] h-15 w-[7.875rem] origin-[1.875rem_1.875rem] translate-y-3.5 -rotate-[25deg]`}
                    />
                    <div className="relative translate-y-3.5">
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={off}
                            aria-label="Clear score"
                            className={round}
                        />
                        <span className="absolute left-1/2 top-1/2 -rotate-[25deg]">
                            <span className={`${label} absolute -translate-x-1/2 translate-y-7 whitespace-nowrap`}>
                                CLEAR
                            </span>
                        </span>
                    </div>
                    <div className="relative -translate-y-3.5">
                        <button
                            type="button"
                            onClick={onPoke}
                            disabled={off}
                            aria-label={`Click Byte. Score ${count}`}
                            className={round}
                        />
                        <span className="absolute left-1/2 top-1/2 -rotate-[25deg]">
                            <span className={`${label} absolute -translate-x-1/2 translate-y-7 whitespace-nowrap`}>
                                CLICK
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-4 pr-20">
                <div className="flex -rotate-[25deg] flex-col items-center gap-1.5">
                    <span className={`${well} p-1`}>
                        <button
                            type="button"
                            onClick={onStale}
                            disabled={off}
                            aria-label="Plus 3, stale: setCount(count + 1) three times"
                            className={pill}
                        />
                    </span>
                    <span className={`${label} whitespace-nowrap`}>+3 STALE</span>
                </div>
                <div className="flex -rotate-[25deg] flex-col items-center gap-1.5">
                    <span className={`${well} p-1`}>
                        <button
                            type="button"
                            onClick={onQueued}
                            disabled={off}
                            aria-label="Plus 3, queued: setCount(n => n + 1) three times"
                            className={pill}
                        />
                    </span>
                    <span className={`${label} whitespace-nowrap`}>+3 QUEUED</span>
                </div>
            </div>
        </div>
    );
}

const deck = "flex flex-col gap-5";

function Game({ rebooted }) {
    const [count, setCount] = useState(0);
    const [best, setBest] = useState(0);
    const [hit, setHit] = useState(false);
    const [look, setLook] = useState(CENTER);
    const [toast, setToast] = useState(rebooted ? "MEMORY WIPED" : null);
    const [delta, setDelta] = useState(null);
    // bumped on every button press so animations replay even when the text repeats
    const [beat, setBeat] = useState(0);

    // beat is a dep so every press restarts the timer
    useEffect(() => {
        if (!hit) return;
        const timer = setTimeout(() => setHit(false), 260);
        return () => clearTimeout(timer);
    }, [hit, beat]);

    useEffect(() => {
        if (look === CENTER) return;
        const timer = setTimeout(() => setLook(CENTER), 900);
        return () => clearTimeout(timer);
    }, [look, beat]);

    const respond = ({ hit = false, look = CENTER, delta = null, toast = null }) => {
        setHit(hit);
        setLook(look);
        setDelta(delta);
        setToast(toast);
        setBeat((b) => b + 1);
    };

    const poke = () => {
        setCount((c) => c + 1);
        respond({ hit: true, delta: 1 });
    };

    // all three read the same `count` from this render, so they queue the same value
    const stale = () => {
        setCount(count + 1);
        setCount(count + 1);
        setCount(count + 1);
        respond({ hit: true, delta: 1, toast: "+1?! SAME SNAPSHOT" });
    };

    const queued = () => {
        setCount((c) => c + 1);
        setCount((c) => c + 1);
        setCount((c) => c + 1);
        respond({ hit: true, delta: 3, toast: "+3 QUEUED UP" });
    };

    const glance = (direction) => respond({ look: direction, toast: GLANCES[beat % GLANCES.length] });

    const reset = () => {
        setBest(Math.max(best, count));
        setCount(0);
        respond({});
    };

    return (
        <div className={deck}>
            <Screen
                count={count}
                best={best}
                message={toast ?? messageFor(count)}
                beat={beat}
                hit={hit}
                look={look}
                delta={delta}
            />
            <Controls count={count} onLook={glance} onPoke={poke} onReset={reset} onStale={stale} onQueued={queued} />
        </div>
    );
}

function PoweredOff() {
    return (
        <div className={deck}>
            <Screen off />
            <Controls off />
        </div>
    );
}

export default function Counter() {
    const [on, setOn] = useState(true);
    const [boots, setBoots] = useState(0);

    const togglePower = () => {
        if (!on) setBoots((b) => b + 1);
        setOn(!on);
    };

    return (
        <figure className="relative mx-auto mb-12 flex w-full max-w-xs flex-col gap-5 rounded-[1rem_1rem_3rem_1rem] bg-light2 px-6 pb-8 pt-4 shadow-[inset_0_-4px_0_rgb(0_0_0/0.08),0_14px_30px_-14px_rgb(17_17_15/0.35)]">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center font-mono text-[0.5rem] font-bold tracking-[0.2em] text-dark3">
                <button
                    type="button"
                    onClick={togglePower}
                    aria-pressed={on}
                    aria-label="Power"
                    className="flex cursor-pointer items-center gap-1.5 justify-self-start"
                >
                    <span className="relative h-2.5 w-7 rounded-full bg-dark/15 shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]">
                        <span
                            className={`absolute left-0 top-0 h-2.5 w-3.5 rounded-full bg-dark3 transition-transform ${on ? "translate-x-3.5" : ""}`}
                        />
                    </span>
                    {on ? "ON" : "OFF"}
                </button>
                <div className="font-sans text-xs font-bold tracking-[0.08em] text-gb-ink">
                    GAMEBOY
                </div>
                <span
                    aria-hidden="true"
                    className={`size-2 justify-self-end rounded-full transition-colors ${on ? "bg-red-500 shadow-[0_0_6px_var(--color-red-500)]" : "bg-dark/20"}`}
                />
            </div>

            {on ? <Game rebooted={boots > 0} /> : <PoweredOff />}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-6 right-6 flex -rotate-[25deg] gap-2"
            >
                {[0, 1, 2, 3, 4].map((rib) => (
                    <span key={rib} className={`${well} h-11 w-1.5`} />
                ))}
            </div>
        </figure>
    );
}
