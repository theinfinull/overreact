import { ChevronLeft, ChevronRight, Pause, Play } from "lucide";
import Icon from "./Icon";

const BUTTON_CLASS =
    "grid size-10 cursor-pointer touch-manipulation place-items-center rounded-full text-dark/55 transition-colors duration-150 [-webkit-tap-highlight-color:transparent] hover:bg-dark/5 hover:text-dark focus-visible:bg-dark/5 focus-visible:text-dark focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent active:bg-dark/9";

/** caption, progress ticks and prev/play/next buttons for a demo. `playSteps` finds them by `${prefix}-…` ids. */
export default function StepControls({ prefix, count }) {
    return (
        <div className="border-t border-light2 px-5 pt-4 pb-3">
            <div id={`${prefix}-caption`} className="mb-2 min-h-13 text-base leading-relaxed text-dark/75" />

            <div className="flex items-center gap-4">
                <div className="flex flex-1 items-center gap-1" aria-hidden="true">
                    {Array.from({ length: count }, (_, index) => (
                        <span
                            key={String(index)}
                            id={`${prefix}-tick-${index}`}
                            className="h-0.5 max-w-6 flex-1 rounded-full bg-light2 transition-colors duration-300 data-[state=done]:bg-light3 data-[state=current]:bg-accent"
                        />
                    ))}
                </div>
                <div className="-me-2 flex items-center">
                    <button type="button" id={`${prefix}-prev`} className={BUTTON_CLASS} aria-label="Previous step">
                        <Icon icon={ChevronLeft} size={18} />
                    </button>
                    <button type="button" id={`${prefix}-play`} className={BUTTON_CLASS} aria-label="Play or pause">
                        <Icon icon={Pause} size={16} className="hidden group-data-playing/walk:block" />
                        <Icon icon={Play} size={16} className="block group-data-playing/walk:hidden" />
                    </button>
                    <button type="button" id={`${prefix}-next`} className={BUTTON_CLASS} aria-label="Next step">
                        <Icon icon={ChevronRight} size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
