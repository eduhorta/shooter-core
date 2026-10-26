export class UIManager {
  constructor(game) {
    this.game = game;
    this.overlay = document.querySelector("#game-overlay");
    this.wave = document.querySelector("#wave");
    this.level = document.querySelector("#level");
    this.score = document.querySelector("#score");
    this.healthLabel = document.querySelector("#health-label");
    this.healthBar = document.querySelector("#health-bar");
    this.xpLabel = document.querySelector("#xp-label");
    this.xpBar = document.querySelector("#xp-bar");
    this.hint = document.querySelector("#hint");
    this.lastMode = "";
    this.lastHud = "";
  }

  dismissHint() { this.hint.classList.add("is-hidden"); }

  render() {
    const game = this.game;
    this.wave.textContent = String(game.wave);
    this.level.textContent = String(game.level);
    this.score.textContent = String(game.score);
    this.healthLabel.textContent = game.player.health + " / " + game.player.maxHealth;
    this.healthBar.style.width = (game.player.health / game.player.maxHealth * 100) + "%";
    this.xpLabel.textContent = game.xp + " / " + game.xpToNext;
    this.xpBar.style.width = Math.min(100, game.xp / game.xpToNext * 100) + "%";

    if (game.mode !== this.lastMode) {
      this.lastMode = game.mode;
      this.renderOverlay();
    } else if (game.mode === "levelup" && game.currentChoices.length > 0 && !this.overlay.hasChildNodes()) {
      this.renderOverlay();
    }
  }

  renderOverlay() {
    const game = this.game;
    this.overlay.replaceChildren();
    if (game.mode === "playing") {
      this.overlay.hidden = true;
      return;
    }

    this.overlay.hidden = false;
    const panel = document.createElement("div");
    panel.className = "overlay-panel";
    if (game.mode === "levelup") {
      const kicker = document.createElement("p");
      kicker.className = "overlay-kicker";
      kicker.textContent = "NÍVEL " + (game.level + 1) + " ALCANÇADO";
      const title = document.createElement("h2");
      title.textContent = "Escolha um upgrade";
      const copy = document.createElement("p");
      copy.className = "overlay-copy";
      copy.textContent = "O tempo parou. Escolha uma melhoria para continuar sobrevivendo.";
      const list = document.createElement("div");
      list.className = "upgrade-list";

      for (const choice of game.currentChoices) {
        const button = document.createElement("button");
        button.className = "upgrade-card";
        button.type = "button";
        const icon = document.createElement("span");
        icon.className = "upgrade-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = choice.icon;
        const copyBlock = document.createElement("span");
        copyBlock.className = "upgrade-copy";
        const name = document.createElement("strong");
        name.textContent = choice.name;
        const description = document.createElement("small");
        description.textContent = choice.description;
        copyBlock.append(name, description);
        button.append(icon, copyBlock);
        button.addEventListener("click", () => {
          game.chooseUpgrade(choice.id);
          this.lastMode = "";
          this.render();
        });
        list.append(button);
      }
      panel.append(kicker, title, copy, list);
    } else {
      const kicker = document.createElement("p");
      kicker.className = "overlay-kicker";
      kicker.textContent = "FIM DE JOGO • ONDA " + game.wave;
      const title = document.createElement("h2");
      title.textContent = "A base caiu";
      const copy = document.createElement("p");
      copy.className = "overlay-copy";
      copy.textContent = "Você acertou " + game.score + " alvos e chegou ao nível " + game.level + ".";
      const restart = document.createElement("button");
      restart.className = "primary-button";
      restart.type = "button";
      restart.textContent = "Jogar novamente";
      restart.addEventListener("click", () => {
        game.reset();
        this.lastMode = "";
        this.render();
      });
      panel.append(kicker, title, copy, restart);
    }
    this.overlay.append(panel);
  }
}