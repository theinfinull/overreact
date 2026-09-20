import Icon from "./Icon";

const tones = {
    yellow: "bg-yellow-50 text-yellow-500 shadow-[6px_6px_var(--color-yellow-500)]",
    red: "bg-red-50 text-red-500 shadow-[6px_6px_var(--color-red-500)]",
    orange: "bg-orange-50 text-orange-500 shadow-[6px_6px_var(--color-orange-500)]",
    green: "bg-green-50 text-green-500 shadow-[6px_6px_var(--color-green-500)]",
    blue: "bg-blue-50 text-blue-500 shadow-[6px_6px_var(--color-blue-500)]",
    accent: "bg-purple-50 text-accent shadow-[6px_6px_var(--color-accent)]",
};

export default function Callout({ children, color = "accent", icon }) {
    return (
        <div className={`mb-12 flex items-start gap-2 px-3 py-2 ${tones[color] ?? tones.yellow}`}>
            <Icon icon={icon} size={24} className="mt-0.5 block flex-none" />
            <div className="text-dark leading-relaxed text-justify">{children}</div>
        </div>
    );
}
