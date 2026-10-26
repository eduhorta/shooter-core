import { Game } from "./game.js";
import { InputHandler } from "./input.js";
import { Renderer } from "./renderer.js";
import { UIManager } from "./ui.js";

const canvas = document.querySelector("#game");
const game = new Game();
const renderer = new Renderer(canvas);
const ui = new UIManager(game);
const input = new InputHandler(canvas, game, () => ui.dismissHint());

let previousTime = 0;

function frame(timestamp) {
  const delta = previousTime === 0 ? 0 : (timestamp - previousTime) / 1000;
  previousTime = timestamp;
  game.update(delta);
  renderer.render(game);
  ui.render();
  window.requestAnimationFrame(frame);
}

window.requestAnimationFrame(frame);
window.addEventListener("pagehide", () => {
  input.destroy();
  renderer.destroy();
}, { once: true });