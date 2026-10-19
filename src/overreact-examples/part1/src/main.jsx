import { createElement, render } from './overreact.js';

const container = document.getElementById('root');
const element = (
  <div id="hero">
    <img src="hero.png"></img>
    <h1>It's Working!</h1>
    <p>
      Seems our <code>createElement</code> and <code>render</code> are working
      great
    </p>
  </div>
);

render(element, container);
