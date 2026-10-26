const WIDTH = 360;
const HEIGHT = 640;
const GROUND_Y = 600;
const GRAVITY = 310;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d", { alpha: false });
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.dpr = dpr;
    this.scale = Math.min(rect.width / WIDTH, rect.height / HEIGHT);
    this.offsetX = (rect.width - WIDTH * this.scale) / 2;
    this.offsetY = (rect.height - HEIGHT * this.scale) / 2;
  }

  beginFrame() {
    const ctx = this.context;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = "#101a2a";
    ctx.fillRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);
    return ctx;
  }

  render(game, aim, dragMode) {
    const ctx = this.beginFrame();
    this.drawWorld(ctx, game.time);
    this.drawTargets(ctx, game.targets);
    this.drawParticles(ctx, game.particles);
    this.drawArrows(ctx, game.arrows);
    this.drawPlayer(ctx, game.player, aim);
    if (aim && dragMode === "aim") this.drawTrajectory(ctx, game.player, aim);
    this.drawHud(ctx, game);
  }

  drawWorld(ctx, time) {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#15243b");
    sky.addColorStop(0.7, "#1d3150");
    sky.addColorStop(1, "#263a50");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 34; i += 1) {
      const x = (i * 97 + 21) % WIDTH;
      const y = (i * 67 + 26) % 430;
      const twinkle = 0.45 + Math.sin(time * 1.7 + i) * 0.2;
      ctx.fillStyle = "#d5e6ff";
      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(x, y, i % 5 === 0 ? 1.5 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = "rgba(8, 15, 26, .28)";
    ctx.beginPath();
    ctx.moveTo(0, 490);
    ctx.quadraticCurveTo(80, 430, 166, 493);
    ctx.quadraticCurveTo(270, 425, WIDTH, 485);
    ctx.lineTo(WIDTH, GROUND_Y);
    ctx.lineTo(0, GROUND_Y);
    ctx.fill();

    const ground = ctx.createLinearGradient(0, GROUND_Y, 0, HEIGHT);
    ground.addColorStop(0, "#3c725d");
    ground.addColorStop(1, "#1d3f3d");
    ctx.fillStyle = ground;
    ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
    ctx.fillStyle = "rgba(184, 222, 164, .28)";
    ctx.fillRect(0, GROUND_Y, WIDTH, 2);
    ctx.fillStyle = "rgba(8, 15, 26, .18)";
    ctx.fillRect(0, GROUND_Y + 8, WIDTH, 2);
  }

  drawTargets(ctx, targets) {
    for (const target of targets) {
      ctx.save();
      ctx.translate(target.x, target.y);
      ctx.strokeStyle = "rgba(235, 241, 251, .72)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, target.radius - 1);
      ctx.quadraticCurveTo(3, target.radius + 7, 0, target.radius + 13);
      ctx.stroke();

      const glow = ctx.createRadialGradient(-5, -7, 2, 0, 0, target.radius + 3);
      glow.addColorStop(0, "#fff3da");
      glow.addColorStop(0.32, target.color);
      glow.addColorStop(1, "#c84266");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(0, 0, target.radius * 0.82, target.radius, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.beginPath();
      ctx.ellipse(-target.radius * 0.27, -target.radius * 0.36, 3, 5, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawParticles(ctx, particles) {
    for (const particle of particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color || "#ffd279";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawArrows(ctx, arrows) {
    for (const arrow of arrows) {
      const angle = Math.atan2(arrow.vy, arrow.vx);
      ctx.save();
      ctx.translate(arrow.x, arrow.y);
      ctx.rotate(angle);
      ctx.strokeStyle = "#f7e2ba";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.lineTo(13, 0);
      ctx.stroke();
      ctx.fillStyle = "#ffbd63";
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(7, -3.5);
      ctx.lineTo(7, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#a9d5df";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-17, -4);
      ctx.moveTo(-12, 0);
      ctx.lineTo(-17, 4);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawPlayer(ctx, player, aim) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = "rgba(7, 15, 23, .32)";
    ctx.beginPath();
    ctx.ellipse(0, 26, 27, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#d5a86e";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7, 5);
    ctx.lineTo(-11, 22);
    ctx.moveTo(7, 5);
    ctx.lineTo(11, 22);
    ctx.stroke();

    ctx.fillStyle = "#426f83";
    ctx.beginPath();
    ctx.moveTo(-15, -4);
    ctx.quadraticCurveTo(0, -15, 15, -4);
    ctx.lineTo(12, 10);
    ctx.quadraticCurveTo(0, 17, -12, 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#e6bd91";
    ctx.beginPath();
    ctx.arc(0, -16, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#25394b";
    ctx.beginPath();
    ctx.arc(0, -19, 10, Math.PI, Math.PI * 2);
    ctx.lineTo(9, -15);
    ctx.lineTo(-9, -15);
    ctx.fill();

    const angle = aim ? aim.angle : Math.PI / 2;
    ctx.save();
    ctx.translate(5, -12);
    ctx.rotate(-angle);
    ctx.strokeStyle = "#b67b44";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -24);
    ctx.stroke();

    ctx.strokeStyle = "#f4d8a2";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(0, -13, 17, -1.13, 1.13);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  drawTrajectory(ctx, player, aim) {
    const speed = 470 + 330 * aim.power;
    const vx = Math.cos(aim.angle) * speed;
    let x = player.x;
    let y = player.y - 22;
    let vy = -Math.sin(aim.angle) * speed;
    ctx.save();
    ctx.fillStyle = "#ffe19a";
    for (let i = 0; i < 28; i += 1) {
      const dt = 0.075;
      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;
      if (x < 0 || x > WIDTH || y < 0 || y > HEIGHT) break;
      ctx.globalAlpha = (1 - i / 30) * 0.72;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.2, 3 - i * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawHud(ctx, game) {
    ctx.save();
    ctx.fillStyle = "rgba(7, 14, 25, .48)";
    this.roundRect(ctx, 14, 14, 97, 37, 11);
    ctx.fill();
    ctx.fillStyle = "#9cacc2";
    ctx.font = "700 8px system-ui, sans-serif";
    ctx.letterSpacing = "1.2px";
    ctx.fillText("PONTUAÇÃO", 25, 28);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 16px system-ui, sans-serif";
    ctx.letterSpacing = "0";
    ctx.fillText(String(game.score).padStart(2, "0"), 25, 45);
    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  destroy() {
    this.resizeObserver.disconnect();
  }
}