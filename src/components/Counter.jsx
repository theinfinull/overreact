import { useState } from "../overreact";

export default function Counter({ id, content, onDelete }) {
    const [count, setCount] = useState(0);

    return (
        <div className="counter">
            <p>
                {content} : {count}
            </p>
            <button onClick={() => setCount((current) => current + 1)}>increment</button>
            <button onClick={() => onDelete(id)}>remove me</button>
        </div>
    );
}
