import { ObjectPool } from "./pool.js";
import { getBossRewardChoices, getUpgradeChoices } from "./upgrades.js";

const WIDTH = 360;
const HEIGHT = 640;
const randomBetween = (min, max) => min + Math.random() * (max - min);

export class Game {
  constructor() { this.reset(); }

  reset() {
    this.player = { x: WIDTH / 2, y: 568, radius: 17, health: 5, maxHealth: 5, invulnerable: 0 };
    this.arrows = [];
    this.targets = [];
    this.orbs = [];
    this.particles = [];
    this.score = 0;
    this.time = 0;
    this.wave = 1;
    this.spawnTimer = 0.08;
    this.lastBossWave = 0;
    this.nextEntityId = 1;
    this.mode = "playing";
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 6;
    this.upgrades = {};
    this.evolvedPhoenix = false;
    this.evolvedStorm = false;
    this.evolvedGlacial = false;
    this.evolvedBallista = false;
    this.bossItems = {};
    this.currentChoices = [];
    this.hitFlash = 0;
    this.reloadTimer = 0.55;
    this.arrowPool = new ObjectPool(
      () => ({}),
      (arrow, x, y, vx, vy, attributes) => Object.assign(arrow, {
        x, y, vx, vy, gravity: 0, life: 3, active: true, hitIds: new Set(), ...attributes,
      }),
      16,
    );
    this.particlePool = new ObjectPool(
      () => ({}),
      (particle, x, y, vx, vy, life, radius, color) =>
        Object.assign(particle, { x, y, vx, vy, life, maxLife: life, radius, color }),
      32,
    );
    this.orbPool = new ObjectPool(
      () => ({}),
      (orb, x, y, value) => Object.assign(orb, { x, y, value, radius: 6, phase: Math.random() * 6 }),
      12,
    );
  }

  levelOf(id) { return this.upgrades[id] || 0; }

  fire() {
    if (this.mode !== "playing") return false;
    const velocityLevel = this.levelOf("arrowVelocity");
    const speed = 570 * (1 + velocityLevel * 0.12 + this.levelOf("bracer") * 0.1);
    const multi = this.levelOf("multishot");
    const duplicator = this.levelOf("duplicator");
    const count = 1 + multi + duplicator + (this.bossItems.royalQuiver || 0) + (this.evolvedStorm ? 2 : 0);
    const spread = this.evolvedStorm ? 0.54 : (count > 1 ? 0.12 + count * 0.035 : 0);
    const elementChoices = [];
    if (this.levelOf("fireArrow") > 0) elementChoices.push("fire");
    if (this.levelOf("iceArrow") > 0) elementChoices.push("ice");
    if (this.levelOf("lightning") > 0) elementChoices.push("lightning");

    for (let i = 0; i < count; i += 1) {
      const offset = count > 1 ? ((i / (count - 1)) - 0.5) * spread : 0;
      const angle = Math.PI / 2 + offset;
      const element = this.evolvedPhoenix
        ? "phoenix"
        : (elementChoices.length ? elementChoices[Math.floor(Math.random() * elementChoices.length)] : "normal");
      const arrow = this.arrowPool.acquire(
        this.player.x, this.player.y - 23,
        Math.cos(angle) * speed, -Math.sin(angle) * speed,
        {
          damage: 1 + this.levelOf("attackPower") + this.levelOf("bracer") + (this.evolvedBallista ? 2 : 0) + (this.bossItems.colossusFang || 0),
          pierceLeft: this.evolvedBallista ? 99 : this.levelOf("piercing"),
          bouncesLeft: this.levelOf("ricochet"),
          gravity: 0,
          element,
        },
      );
      this.arrows.push(arrow);
    }

    const cooldown = Math.max(0.42, 1.12 - this.levelOf("drawSpeed") * 0.13 - (this.evolvedStorm ? 0.12 : 0) - (this.bossItems.starFragment || 0) * 0.06);
    this.reloadTimer = cooldown;
    return true;
  }

  update(delta) {
    const dt = Math.min(delta, 1 / 30);
    if (this.mode !== "playing") return;
    this.time += dt;
    this.wave = 1 + Math.floor(this.time / 38);
    this.player.invulnerable = Math.max(0, this.player.invulnerable - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.reloadTimer -= dt;
    if (this.reloadTimer <= 0) this.fire();

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnWaveEnemy();
      this.spawnTimer = Math.max(1.1, 2.65 - (this.wave - 1) * 0.065) + Math.random() * 0.55;
    }

    for (let i = this.arrows.length - 1; i >= 0; i -= 1) this.updateArrow(i, dt);
    for (let i = this.targets.length - 1; i >= 0; i -= 1) this.updateTarget(this.targets[i], dt);
    this.updateOrbs(dt);
    this.updateParticles(dt);
  }

  spawnWaveEnemy() {
    if (this.wave >= 3 && this.wave % 3 === 0 && this.lastBossWave !== this.wave) {
      this.lastBossWave = this.wave;
      this.spawnTarget("boss");
      return;
    }
    const roll = Math.random();
    let type = "balloon";
    if (this.wave >= 2 && roll < 0.5) type = "bat";
    if (this.wave >= 3 && roll > 0.88) type = "brute";
    this.spawnTarget(type);
  }

  spawnTarget(type) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const config = {
      balloon: { radius: 17, health: 1, speed: 25, drift: 3, xp: 1, color: "#ff7187" },
      bat: { radius: 19, health: 2 + Math.floor(this.wave / 5), speed: 39, drift: 6, xp: 2, color: "#9f8aff" },
      brute: { radius: 25, health: 4 + Math.floor(this.wave / 4), speed: 22, drift: 5, xp: 3, color: "#ff9c5c" },
      boss: { radius: 34, health: 18 + this.wave * 2, speed: 24, drift: 1, xp: 10, color: "#ff536f" },
    }[type];
    this.targets.push({
      id: this.nextEntityId++, type,
      x: type === "boss" ? WIDTH / 2 : randomBetween(42, WIDTH - 42),
      y: type === "boss" ? 105 : randomBetween(90, 330),
      vx: direction * (config.speed + this.wave * 0.7),
      vy: type === "balloon" ? 1.5 : (type === "boss" ? 0 : 4 + this.wave * 0.25),
      radius: config.radius, drift: config.drift, health: config.health, maxHealth: config.health,
      xp: config.xp, color: config.color, phase: Math.random() * 6,
      slowTimer: 0,
    });
  }

  updateTarget(target, dt) {
    target.slowTimer = Math.max(0, target.slowTimer - dt);
    const slow = target.slowTimer > 0 ? 0.35 : 1;
    target.x += target.vx * slow * dt;
    target.y += (target.vy + Math.sin(this.time * 1.7 + target.phase) * target.drift) * slow * dt;
    if (target.x < target.radius || target.x > WIDTH - target.radius) target.vx *= -1;
    target.x = Math.max(target.radius, Math.min(WIDTH - target.radius, target.x));

    const playerDistance = Math.hypot(target.x - this.player.x, target.y - this.player.y);
    if (playerDistance <= target.radius + this.player.radius) {
      this.damagePlayer(target.type === "boss" ? 2 : 1);
      this.removeTarget(target);
      return;
    }
    if (target.y > 548) this.removeTarget(target);
  }

  updateArrow(index, dt) {
    const arrow = this.arrows[index];
    arrow.vy += arrow.gravity * dt;
    arrow.x += arrow.vx * dt;
    arrow.y += arrow.vy * dt;
    arrow.life -= dt;

    if ((arrow.x < 5 || arrow.x > WIDTH - 5) && arrow.bouncesLeft > 0) {
      arrow.x = Math.max(5, Math.min(WIDTH - 5, arrow.x));
      arrow.vx *= -1;
      arrow.bouncesLeft -= 1;
    }

    for (let j = this.targets.length - 1; j >= 0; j -= 1) {
      const target = this.targets[j];
      if (arrow.hitIds.has(target.id)) continue;
      if (Math.hypot(arrow.x - target.x, arrow.y - target.y) >= target.radius + 5) continue;
      arrow.hitIds.add(target.id);
      this.damageTarget(target, arrow.damage);
      this.applyElement(arrow, target);
      if (arrow.pierceLeft > 0) arrow.pierceLeft -= 1;
      else {
        this.releaseArrow(index);
        return;
      }
    }

    if (arrow.x < -30 || arrow.x > WIDTH + 30 || arrow.y < -40 || arrow.y > HEIGHT + 24 || arrow.life <= 0) {
      this.releaseArrow(index);
    }
  }

  applyElement(arrow, target) {
    if (arrow.element === "ice") {
      target.slowTimer = (this.evolvedGlacial ? 5 : 3.2) + this.levelOf("spellbinder") * 0.5;
      if (this.evolvedGlacial) {
        for (const nearby of this.targets) {
          if (nearby !== target && Math.hypot(nearby.x - target.x, nearby.y - target.y) < 88) nearby.slowTimer = 4 + this.levelOf("spellbinder") * 0.5;
        }
        this.burst(target.x, target.y, "#9be8ff", 10);
      }
    }
    if (arrow.element === "fire" || arrow.element === "phoenix") {
      const radius = arrow.element === "phoenix" ? 105 : 58 + this.levelOf("fireArrow") * 9;
      const damage = arrow.element === "phoenix" ? 3 : 1;
      for (const nearby of [...this.targets]) {
        if (nearby !== target && Math.hypot(nearby.x - target.x, nearby.y - target.y) < radius) {
          this.damageTarget(nearby, damage);
        }
      }
      this.burst(target.x, target.y, arrow.element === "phoenix" ? "#ffe37d" : "#ff995b", 12);
    }
    if (arrow.element === "lightning") {
      const chainCount = Math.min(3, 1 + this.levelOf("lightning"));
      const nearby = this.targets
        .filter((enemy) => enemy !== target && Math.hypot(enemy.x - target.x, enemy.y - target.y) < 128)
        .sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y))
        .slice(0, chainCount);
      for (const enemy of nearby) this.damageTarget(enemy, 1);
      this.burst(target.x, target.y, "#91eaff", 5);
    }
  }

  damageTarget(target, amount) {
    if (!target || !this.targets.includes(target)) return;
    target.health -= amount;
    this.burst(target.x, target.y, target.color, 3);
    if (target.health <= 0) this.killTarget(target);
  }

  killTarget(target) {
    if (!this.targets.includes(target)) return;
    this.score += target.type === "boss" ? 10 : 1;
    const index = this.targets.indexOf(target);
    this.targets.splice(index, 1);
    const orbCount = target.xp > 5 ? 5 : target.xp;
    for (let i = 0; i < orbCount; i += 1) {
      this.orbs.push(this.orbPool.acquire(
        target.x + randomBetween(-12, 12), target.y + randomBetween(-10, 10),
        Math.max(1, (target.xp > 5 ? 2 : 1) + (this.bossItems.soulCompass || 0)),
      ));
    }
    this.burst(target.x, target.y, target.color, target.type === "boss" ? 22 : 10);
    if (target.type === "boss") {
      this.mode = "bossloot";
      this.currentChoices = getBossRewardChoices(this);
    }
  }

  updateOrbs(dt) {
    const magnetLevel = this.levelOf("magnet");
    const magnetRadius = WIDTH + HEIGHT + magnetLevel * 60;
    for (let i = this.orbs.length - 1; i >= 0; i -= 1) {
      const orb = this.orbs[i];
      const dx = this.player.x - orb.x;
      const dy = (this.player.y - 8) - orb.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      orb.phase += dt * 4;
      if (distance < magnetRadius) {
        const speed = 185 + magnetLevel * 45 + Math.max(0, magnetRadius - distance) * 0.8;
        orb.x += dx / distance * speed * dt;
        orb.y += dy / distance * speed * dt;
      }
      if (distance < 22) {
        this.xp += orb.value;
        this.orbPool.release(this.orbs.splice(i, 1)[0]);
        this.checkLevelUp();
      }
    }
  }

  checkLevelUp() {
    if (this.mode !== "playing" || this.xp < this.xpToNext) return;
    this.xp -= this.xpToNext;
    this.mode = "levelup";
    this.currentChoices = getUpgradeChoices(this);
  }

  chooseUpgrade(id) {
    if (this.mode !== "levelup" || !this.currentChoices.some((choice) => choice.id === id)) return;
    if (id === "phoenix") this.evolvedPhoenix = true;
    else if (id === "arrowStorm") this.evolvedStorm = true;
    else if (id === "glacialBarrage") this.evolvedGlacial = true;
    else if (id === "ballista") this.evolvedBallista = true;
    else if (id === "secondWind") this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
    else this.upgrades[id] = this.levelOf(id) + 1;

    this.level += 1;
    this.xpToNext = Math.ceil(this.xpToNext * 1.28 + 2);
    this.currentChoices = [];
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.currentChoices = getUpgradeChoices(this);
      this.mode = "levelup";
    } else {
      this.mode = "playing";
    }
  }

  chooseBossReward(id) {
    if (this.mode !== "bossloot" || !this.currentChoices.some((choice) => choice.id === id)) return;
    this.bossItems[id] = (this.bossItems[id] || 0) + 1;
    if (id === "heartwood") {
      this.player.maxHealth += 1;
      this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
    }
    this.currentChoices = [];
    this.mode = "playing";
    this.checkLevelUp();
  }

  damagePlayer(amount) {
    if (this.player.invulnerable > 0 || this.mode !== "playing") return;
    this.player.health = Math.max(0, this.player.health - amount);
    this.player.invulnerable = 1;
    this.hitFlash = 0.22;
    if (this.player.health <= 0) this.mode = "gameover";
  }

  removeTarget(target) {
    const index = this.targets.indexOf(target);
    if (index >= 0) this.targets.splice(index, 1);
  }

  releaseArrow(index) {
    this.arrowPool.release(this.arrows.splice(index, 1)[0]);
  }

  burst(x, y, color, count = 6) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(28, 130);
      this.particles.push(this.particlePool.acquire(
        x, y, Math.cos(angle) * speed, Math.sin(angle) * speed,
        randomBetween(0.22, 0.5), randomBetween(1.5, 3.5), color,
      ));
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.985;
      particle.vy += 80 * dt;
      if (particle.life <= 0) this.particlePool.release(this.particles.splice(i, 1)[0]);
    }
  }
}