export default function App({ appName }) {
    let [count, setCount] = overreact.useState(0);

    return (
        <div id="maindiv">
            <h1>{appName}</h1>
            <p>This is {appName}.</p>

            <button onclick={() => setCount((c) => c + 1)}>counter</button>
            <p>count: {count}</p>
        </div>
    );
}
