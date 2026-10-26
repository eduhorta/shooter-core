import { ObjectPool } from "./pool.js";

const WIDTH = 360;
const HEIGHT = 640;
const GRAVITY = 310;

export class Game {
  constructor() {
    this.player = { x: WIDTH / 2, y: 570 };
    this.arrows = [];
    this.targets = [];
    this.particles = [];
    this.score = 0;
    this.spawnTimer = 0.5;
    this.time = 0;
    this.arrowPool = new ObjectPool(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false }),
      (arrow, x, y, vx, vy) => Object.assign(arrow, { x, y, vx, vy, life: 3, active: true }),
      12,
    );
    this.particlePool = new ObjectPool(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, radius: 0 }),
      (particle, x, y, vx, vy, life, radius) =>
        Object.assign(particle, { x, y, vx, vy, life, maxLife: life, radius }),
      24,
    );
  }

  movePlayer(x) {
    this.player.x = Math.max(38, Math.min(WIDTH - 38, x));
  }

  fire(angle, power) {
    const speed = 470 + 330 * power;
    const arrow = this.arrowPool.acquire(
      this.player.x,
      this.player.y - 22,
      Math.cos(angle) * speed,
      -Math.sin(angle) * speed,
    );
    this.arrows.push(arrow);
  }

  update(delta) {
    const dt = Math.min(delta, 1 / 30);
    this.time += dt;
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.spawnTarget();
      this.spawnTimer = Math.max(0.55, 1.55 - this.time * 0.006) + Math.random() * 0.45;
    }

    for (let i = this.arrows.length - 1; i >= 0; i -= 1) {
      const arrow = this.arrows[i];
      arrow.vy += GRAVITY * dt;
      arrow.x += arrow.vx * dt;
      arrow.y += arrow.vy * dt;
      arrow.life -= dt;

      let hitIndex = -1;
      for (let j = this.targets.length - 1; j >= 0; j -= 1) {
        const target = this.targets[j];
        if (Math.hypot(arrow.x - target.x, arrow.y - target.y) < target.radius + 5) {
          hitIndex = j;
          break;
        }
      }

      if (hitIndex >= 0) {
        const [target] = this.targets.splice(hitIndex, 1);
        this.score += 1;
        this.burst(target.x, target.y, target.color);
        this.releaseArrow(i);
      } else if (arrow.x < -24 || arrow.x > WIDTH + 24 || arrow.y < -35 || arrow.y > HEIGHT + 20 || arrow.life <= 0) {
        this.releaseArrow(i);
      }
    }

    for (const target of this.targets) {
      target.x += target.vx * dt;
      target.y += Math.sin(this.time * 2.4 + target.phase) * 4 * dt;
      if (target.x < target.radius || target.x > WIDTH - target.radius) target.vx *= -1;
      target.x = Math.max(target.radius, Math.min(WIDTH - target.radius, target.x));
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.985;
      particle.vy += 100 * dt;
      if (particle.life <= 0) {
        this.particlePool.release(this.particles.splice(i, 1)[0]);
      }
    }
  }

  releaseArrow(index) {
    this.arrowPool.release(this.arrows.splice(index, 1)[0]);
  }

  spawnTarget() {
    const radius = 15 + Math.random() * 6;
    const fromLeft = Math.random() < 0.5;
    const colors = ["#ff6e85", "#ffc45f", "#72d8c0", "#a68bff"];
    this.targets.push({
      x: fromLeft ? -radius : WIDTH + radius,
      y: 82 + Math.random() * 300,
      vx: (fromLeft ? 1 : -1) * (35 + Math.random() * 44 + this.time * 0.12),
      radius,
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  burst(x, y, color) {
    for (let i = 0; i < 10; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 125;
      this.particles.push(this.particlePool.acquire(
        x, y, Math.cos(angle) * speed, Math.sin(angle) * speed,
        0.3 + Math.random() * 0.35, 2 + Math.random() * 2,
      ));
      this.particles[this.particles.length - 1].color = color;
    }
  }
}