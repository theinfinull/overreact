export default function Illustration({ src, description, className }) {
    return (
        <div className="max-w-90 mx-auto mb-8">
            <img src={src} className={`${className} w-full h-auto border border-light2 rounded-2xl block bg-light`} />
            <div className="text-xs text-gray-500 text-center mt-2">{description}</div>
        </div>
    );
}
