const WIDTH = 360;
const HEIGHT = 640;
const MIN_ANGLE = (18 * Math.PI) / 180;
const MAX_ANGLE = (162 * Math.PI) / 180;

export class InputHandler {
  constructor(canvas, game, renderer, onFirstInput = () => {}) {
    this.canvas = canvas;
    this.game = game;
    this.renderer = renderer;
    this.onFirstInput = onFirstInput;
    this.pointerId = null;
    this.dragMode = null;
    this.aim = null;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);

    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointermove", this.handlePointerMove);
    canvas.addEventListener("pointerup", this.handlePointerUp);
    canvas.addEventListener("pointercancel", this.handlePointerUp);
    canvas.addEventListener("lostpointercapture", this.handlePointerUp);
  }

  toWorld(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / WIDTH, rect.height / HEIGHT);
    const offsetX = (rect.width - WIDTH * scale) / 2;
    const offsetY = (rect.height - HEIGHT * scale) / 2;
    return {
      x: (event.clientX - rect.left - offsetX) / scale,
      y: (event.clientY - rect.top - offsetY) / scale,
    };
  }

  handlePointerDown(event) {
    if (this.pointerId !== null) return;
    event.preventDefault();
    this.onFirstInput();
    this.pointerId = event.pointerId;
    this.canvas.setPointerCapture(event.pointerId);
    const point = this.toWorld(event);

    if (point.y > 545) {
      this.dragMode = "move";
      this.game.movePlayer(point.x);
      return;
    }

    this.dragMode = "aim";
    this.updateAim(point);
  }

  handlePointerMove(event) {
    if (event.pointerId !== this.pointerId) return;
    event.preventDefault();
    const point = this.toWorld(event);

    if (this.dragMode === "move") {
      this.game.movePlayer(point.x);
    } else if (this.dragMode === "aim") {
      this.updateAim(point);
    }
  }

  handlePointerUp(event) {
    if (event.pointerId !== this.pointerId) return;
    if (this.dragMode === "aim" && this.aim) {
      this.game.fire(this.aim.angle, this.aim.power);
    }
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

    let angle = Math.atan2(dy, dx);
    angle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));
    this.aim = {
      angle,
      power: Math.max(0.35, Math.min(1, distance / 235)),
    };
  }

  getAim() {
    return this.aim;
  }

  getDragMode() {
    return this.dragMode;
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerUp);
    this.canvas.removeEventListener("lostpointercapture", this.handlePointerUp);
  }
}