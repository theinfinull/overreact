import { useState } from "../overreact";
import Counter from "./Counter";

export default function App({ appName }) {
    const [counters, setCounters] = useState([]);

    const addCounter = () => {
        const id = Date.now();
        setCounters(counters.concat({ id, label: `counter-${id}` }));
    };

    const removeCounter = (id) => {
        setCounters(counters.filter((counter) => counter.id !== id));
    };

    return (
        <div id="maindiv">
            <h1>{appName}</h1>
            <p>This is {appName}.</p>

            {counters.map((counter) => (
                <Counter key={counter.id} id={counter.id} content={counter.label} onDelete={removeCounter} />
            ))}

            <button onClick={addCounter}>add Counter</button>
        </div>
    );
}
