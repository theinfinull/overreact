import { Download, ExternalLink, Zap } from "lucide";
import Icon from "./Icon";

const button =
    "inline-flex items-center justify-center gap-2 rounded border-[1.5px] border-dark px-4 py-2.5 " +
    "text-sm font-semibold no-underline transition duration-150 " +
    "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-dark)] " +
    "active:translate-x-0 active:translate-y-0 active:shadow-none " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark";

const notch = "absolute -left-3 hidden size-5.5 rounded-full border-[1.5px] border-dark bg-light sm:block";

export default function ChapterSource({ eyebrow, title, children, zipHref, demoHref, stackblitzHref }) {
    return (
        <aside className="mb-12 flex w-full flex-col border-[1.5px] border-dark bg-light text-dark sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5 px-7 py-6">
                <div className="m-0 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-accent">
                    {eyebrow}
                </div>
                <div className="m-0 text-[1.35rem] font-bold leading-tight tracking-tight">{title}</div>
                <div className="text-[0.95rem] leading-relaxed text-dark3 [&_code]:rounded-md [&_code]:bg-light2 [&_code]:px-[0.35em] [&_code]:py-[0.1em] [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:whitespace-nowrap [&_p]:m-0">
                    {children}
                </div>
            </div>

            <div className="relative flex flex-col justify-center gap-2.5 border-t-2 border-dashed border-dark bg-accent p-6 sm:border-l-2 sm:border-t-0">
                <span aria-hidden="true" className={`${notch} top-[-12.5px] [clip-path:inset(50%_0_0_0)]`} />
                <span aria-hidden="true" className={`${notch} bottom-[-12.5px] [clip-path:inset(0_0_50%_0)]`} />

                <a
                    href={zipHref}
                    download={zipHref.split("/").pop()}
                    className={`${button} bg-dark text-light hover:bg-light hover:text-dark`}
                >
                    <Icon icon={Download} size={16} />
                    Download .zip
                </a>
                {demoHref && (
                    <a
                        href={demoHref}
                        target="_blank"
                        rel="noreferrer"
                        className={`${button} bg-light text-dark hover:bg-light2`}
                    >
                        <Icon icon={ExternalLink} size={16} />
                        Visit Demo
                    </a>
                )}
                {stackblitzHref && (
                    <a
                        href={stackblitzHref}
                        target="_blank"
                        rel="noreferrer"
                        className={`${button} bg-light text-dark hover:bg-light2`}
                    >
                        <Icon icon={Zap} size={16} />
                        Open in StackBlitz
                    </a>
                )}
            </div>
        </aside>
    );
}
