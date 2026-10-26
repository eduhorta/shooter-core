import { Game } from "./game.js";
import { InputHandler } from "./input.js";
import { Renderer } from "./renderer.js";

const canvas = document.querySelector("#game");
const scoreLabel = document.querySelector("#score");
const hint = document.querySelector("#hint");
const game = new Game();
const renderer = new Renderer(canvas);
const input = new InputHandler(canvas, game, renderer, () => hint.classList.add("is-hidden"));

let previousTime = 0;
let lastScore = game.score;

function frame(timestamp) {
  const delta = previousTime === 0 ? 0 : (timestamp - previousTime) / 1000;
  previousTime = timestamp;

  game.update(delta);
  renderer.render(game, input.getAim(), input.getDragMode());

  if (game.score !== lastScore) {
    scoreLabel.textContent = String(game.score);
    lastScore = game.score;
  }

  window.requestAnimationFrame(frame);
}

window.requestAnimationFrame(frame);

window.addEventListener("pagehide", () => {
  input.destroy();
  renderer.destroy();
}, { once: true });