let count = 0;

export default function App({ appName }) {
    const incrementCounter = () => {
        count++;
        console.log("counter incremented to: " + count);
        overreact.render(<App appName={appName} />, document.getElementById("root"));
    };

    return (
        <div id="maindiv">
            <h1>{appName}</h1>
            <p>This is {appName}.</p>

            <button onclick={incrementCounter}>counter</button>
            <p>count: {count}</p>
        </div>
    );
}
