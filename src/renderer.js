const WIDTH = 360;
const HEIGHT = 640;
const GROUND_Y = 600;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d", { alpha: false });
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

  render(game) {
    const ctx = this.beginFrame();
    this.drawWorld(ctx, game.time);
    this.drawTargets(ctx, game.targets);
    this.drawOrbs(ctx, game.orbs);
    this.drawEnemyShots(ctx, game.enemyShots);
    this.drawParticles(ctx, game.particles);
    this.drawArrows(ctx, game.arrows);
    this.drawPlayer(ctx, game.player);
    if (game.hitFlash > 0) {
      ctx.fillStyle = "rgba(255, 64, 87, " + (game.hitFlash * 0.28) + ")";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  drawWorld(ctx, time) {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#15243b");
    sky.addColorStop(0.68, "#1d3150");
    sky.addColorStop(1, "#263a50");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (let i = 0; i < 38; i += 1) {
      const x = (i * 97 + 21) % WIDTH;
      const y = (i * 67 + 26) % 440;
      ctx.globalAlpha = 0.27 + Math.sin(time * 1.7 + i) * 0.1;
      ctx.fillStyle = "#d5e6ff";
      ctx.beginPath();
      ctx.arc(x, y, i % 5 === 0 ? 1.5 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
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
      if (target.type === "balloon") this.drawBalloon(ctx, target);
      else if (target.type === "bat") this.drawBat(ctx, target);
      else if (target.type === "boss") this.drawBoss(ctx, target);
      else this.drawBrute(ctx, target);
      if (target.maxHealth > 1) this.drawHealthBar(ctx, target);
      ctx.restore();
    }
  }

  drawBalloon(ctx, target) {
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
  }

  drawBat(ctx, target) {
    ctx.fillStyle = "rgba(9, 12, 28, .88)";
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.quadraticCurveTo(-target.radius - 14, -target.radius - 10, -target.radius - 8, 7);
    ctx.quadraticCurveTo(-target.radius, 3, -4, 8);
    ctx.quadraticCurveTo(target.radius, 3, target.radius + 8, 7);
    ctx.quadraticCurveTo(target.radius + 14, -target.radius - 10, 4, -2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.ellipse(0, 1, target.radius * 0.48, target.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffebaa";
    ctx.beginPath();
    ctx.arc(-5, 0, 2.2, 0, Math.PI * 2);
    ctx.arc(5, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBrute(ctx, target) {
    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe2bd";
    ctx.beginPath();
    ctx.moveTo(-13, -target.radius + 5);
    ctx.lineTo(-18, -target.radius - 7);
    ctx.lineTo(-5, -target.radius + 1);
    ctx.moveTo(13, -target.radius + 5);
    ctx.lineTo(18, -target.radius - 7);
    ctx.lineTo(5, -target.radius + 1);
    ctx.fill();
    ctx.fillStyle = "#382b39";
    ctx.beginPath();
    ctx.arc(-8, -2, 3, 0, Math.PI * 2);
    ctx.arc(8, -2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#693744";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 7, 7, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

  drawBoss(ctx, target) {
    ctx.fillStyle = "#762f58";
    ctx.beginPath();
    for (let i = 0; i < 12; i += 1) {
      const angle = -Math.PI / 2 + i * Math.PI / 6;
      const radius = i % 2 === 0 ? target.radius + 8 : target.radius - 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    const glow = ctx.createRadialGradient(-8, -10, 2, 0, 0, target.radius);
    glow.addColorStop(0, "#ffd2b2");
    glow.addColorStop(0.24, "#ff6a7d");
    glow.addColorStop(1, "#a83262");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, target.radius - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff0a8";
    ctx.beginPath();
    ctx.arc(-10, -3, 4, 0, Math.PI * 2);
    ctx.arc(10, -3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#492344";
    ctx.beginPath();
    ctx.ellipse(0, 12, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHealthBar(ctx, target) {
    const width = target.radius * 2;
    const y = -target.radius - 13;
    ctx.fillStyle = "rgba(7, 12, 22, .72)";
    ctx.fillRect(-width / 2, y, width, 4);
    ctx.fillStyle = target.type === "boss" ? "#ff5f79" : "#ffbc69";
    ctx.fillRect(-width / 2, y, width * Math.max(0, target.health / target.maxHealth), 4);
  }

  drawOrbs(ctx, orbs) {
    for (const orb of orbs) {
      const pulse = 1 + Math.sin(orb.phase) * 0.13;
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#66e0d1";
      ctx.fillStyle = "#8be7d0";
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,.75)";
      ctx.beginPath();
      ctx.arc(orb.x - 1.5, orb.y - 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawEnemyShots(ctx, shots) {
    for (const shot of shots) {
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ff4f70";
      ctx.fillStyle = "#ff7187";
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
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
    const colors = { fire: "#ff9c5b", phoenix: "#ffe37d", ice: "#9be8ff", lightning: "#d2b1ff" };
    for (const arrow of arrows) {
      const angle = Math.atan2(arrow.vy, arrow.vx);
      ctx.save();
      ctx.translate(arrow.x, arrow.y);
      ctx.rotate(angle);
      ctx.strokeStyle = colors[arrow.element] || "#f7e2ba";
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

  drawPlayer(ctx, player) {
    ctx.save();
    if (player.invulnerable > 0 && Math.floor(player.invulnerable * 10) % 2 === 0) ctx.globalAlpha = 0.5;
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

    ctx.save();
    ctx.translate(5, -12);
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

  destroy() { this.resizeObserver.disconnect(); }
}