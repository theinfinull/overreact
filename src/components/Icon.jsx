// wrapper for lucide icons
export default function Icon({ icon, size = 20, strokeWidth = 1.8, className = "" }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icon.map(([tag, attrs], index) => createElement(tag, { ...attrs, key: String(index) }))}
        </svg>
    );
}
