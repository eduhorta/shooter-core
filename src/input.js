const WIDTH = 360;
const HEIGHT = 640;

export class InputHandler {
  constructor(canvas, game, onFirstInput = () => {}) {
    this.canvas = canvas;
    this.game = game;
    this.onFirstInput = onFirstInput;
    this.pointerId = null;
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointermove", this.handlePointerMove);
    canvas.addEventListener("pointerup", this.handlePointerUp);
    canvas.addEventListener("pointercancel", this.handlePointerUp);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  toWorldX(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / WIDTH, rect.height / HEIGHT);
    const offsetX = (rect.width - WIDTH * scale) / 2;
    return (event.clientX - rect.left - offsetX) / scale;
  }

  moveToPointer(event) {
    const x = this.toWorldX(event);
    if (x >= 0 && x <= WIDTH) this.game.movePlayer(x);
  }

  handlePointerDown(event) {
    if (this.pointerId !== null || this.game.mode !== "playing") return;
    event.preventDefault();
    this.onFirstInput();
    this.pointerId = event.pointerId;
    this.canvas.setPointerCapture(event.pointerId);
    this.moveToPointer(event);
  }

  handlePointerMove(event) {
    if (event.pointerId !== this.pointerId || this.game.mode !== "playing") return;
    event.preventDefault();
    this.moveToPointer(event);
  }

  handlePointerUp(event) {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = null;
  }

  handleKeyDown(event) {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") this.game.setMovement(-1);
      else this.game.setMovement(1);
    }
  }

  handleKeyUp(event) {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(event.key)) this.game.setMovement(0);
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerUp);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}