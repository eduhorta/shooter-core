const WIDTH = 360;
const HEIGHT = 640;
const MIN_ANGLE = (18 * Math.PI) / 180;
const MAX_ANGLE = (162 * Math.PI) / 180;

export class InputHandler {
  constructor(canvas, game, onFirstInput = () => {}) {
    this.canvas = canvas;
    this.game = game;
    this.onFirstInput = onFirstInput;
    this.pointerId = null;
    this.dragMode = null;
    this.aim = null;
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);
    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointermove", this.handlePointerMove);
    canvas.addEventListener("pointerup", this.handlePointerUp);
    canvas.addEventListener("pointercancel", this.handlePointerCancel);
    canvas.addEventListener("lostpointercapture", this.handlePointerCancel);
  }

  toWorld(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / WIDTH, rect.height / HEIGHT);
    const offsetX = (rect.width - WIDTH * scale) / 2;
    const offsetY = (rect.height - HEIGHT * scale) / 2;
    return { x: (event.clientX - rect.left - offsetX) / scale, y: (event.clientY - rect.top - offsetY) / scale };
  }

  handlePointerDown(event) {
    if (this.pointerId !== null || this.game.mode !== "playing") return;
    event.preventDefault();
    this.onFirstInput();
    this.pointerId = event.pointerId;
    this.canvas.setPointerCapture(event.pointerId);
    const point = this.toWorld(event);
    if (point.y > 535) {
      this.dragMode = "move";
      this.game.movePlayer(point.x);
    } else {
      this.dragMode = "aim";
      this.updateAim(point);
    }
  }

  handlePointerMove(event) {
    if (event.pointerId !== this.pointerId || this.game.mode !== "playing") return;
    event.preventDefault();
    const point = this.toWorld(event);
    if (this.dragMode === "move") this.game.movePlayer(point.x);
    else if (this.dragMode === "aim") this.updateAim(point);
  }

  handlePointerUp(event) {
    if (event.pointerId !== this.pointerId) return;
    if (this.dragMode === "aim" && this.aim && this.game.mode === "playing") {
      this.game.fire(this.aim.angle, this.aim.power);
    }
    this.finishPointer();
  }

  handlePointerCancel(event) {
    if (event.pointerId === this.pointerId) this.finishPointer();
  }

  finishPointer() {
    this.pointerId = null;
    this.dragMode = null;
    this.aim = null;
  }

  updateAim(point) {
    const player = this.game.player;
    const dx = point.x - player.x;
    const dy = player.y - point.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 8) {
      this.aim = null;
      return;
    }
    const angle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, Math.atan2(dy, dx)));
    this.aim = { angle, power: Math.max(0.35, Math.min(1, distance / 235)) };
  }

  getAim() { return this.aim; }
  getDragMode() { return this.dragMode; }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerCancel);
    this.canvas.removeEventListener("lostpointercapture", this.handlePointerCancel);
  }
}