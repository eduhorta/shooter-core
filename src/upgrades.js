const UPGRADES = [
  { id: "multishot", name: "Tiro múltiplo", icon: "➶", description: "Adiciona uma flecha à salva diagonal.", max: 3 },
  { id: "duplicator", name: "Duplicador", icon: "✣", description: "Dispara mais uma flecha por salva.", max: 2 },
  { id: "piercing", name: "Ponta perfurante", icon: "➤", description: "Cada nível atravessa mais um alvo.", max: 3 },
  { id: "bracer", name: "Braçadeira", icon: "⌁", description: "Aumenta velocidade e dano de flechas.", max: 2 },
  { id: "ricochet", name: "Ricochete", icon: "↗", description: "A flecha quica mais uma vez nas bordas.", max: 3 },
  { id: "drawSpeed", name: "Velocidade de recarga", icon: "⌁", description: "Reduz o intervalo entre disparos.", max: 4 },
  { id: "attackPower", name: "Poder de ataque", icon: "✦", description: "Aumenta o dano de cada flecha.", max: 4 },
  { id: "magnet", name: "Ímã de XP", icon: "◉", description: "Atrai orbes de experiência de mais longe.", max: 4 },
  { id: "arrowVelocity", name: "Flecha veloz", icon: "➤", description: "Aumenta velocidade e alcance do projétil.", max: 4 },
  { id: "fireArrow", name: "Flecha de fogo", icon: "♨", description: "Incendeia o alvo e causa dano em área.", max: 3 },
  { id: "combustion", name: "Amuleto de combustão", icon: "✧", description: "Catalisador para a evolução das flechas de fogo.", max: 2 },
  { id: "iceArrow", name: "Flecha gélida", icon: "❄", description: "Atingir um inimigo reduz sua velocidade.", max: 3 },
  { id: "spellbinder", name: "Encantamento", icon: "◈", description: "Prolonga efeitos elementais.", max: 2 },
  { id: "lightning", name: "Flecha elétrica", icon: "ϟ", description: "A eletricidade salta para inimigos próximos.", max: 3 },
];

function level(game, id) { return game.upgrades[id] || 0; }

export function getUpgradeChoices(game) {
  const choices = UPGRADES
    .filter((upgrade) => level(game, upgrade.id) < upgrade.max)
    .map((upgrade) => ({
      ...upgrade,
      description: upgrade.description + " Nível " + (level(game, upgrade.id) + 1) + " de " + upgrade.max + ".",
    }));

  if (!game.evolvedPhoenix && level(game, "fireArrow") >= 3 && level(game, "combustion") >= 2) {
    choices.push({ id: "phoenix", name: "Flecha de Fênix", icon: "🔥", description: "Evolução: salvas incendiárias explodem em uma área maior.", evolution: true });
  }
  if (!game.evolvedStorm && level(game, "multishot") >= 3 && level(game, "duplicator") >= 2) {
    choices.push({ id: "arrowStorm", name: "Tempestade de Flechas", icon: "🌠", description: "Evolução: lança uma grande salva diagonal com recarga menor.", evolution: true });
  }
  if (!game.evolvedGlacial && level(game, "iceArrow") >= 3 && level(game, "spellbinder") >= 2) {
    choices.push({ id: "glacialBarrage", name: "Rajada Glacial", icon: "❄", description: "Evolução: o impacto gélido desacelera inimigos ao redor.", evolution: true });
  }
  if (!game.evolvedBallista && level(game, "piercing") >= 3 && level(game, "bracer") >= 2) {
    choices.push({ id: "ballista", name: "Besta Perfurante", icon: "🏹", description: "Evolução: virotes fortes atravessam todos os inimigos.", evolution: true });
  }

  choices.push({ id: "secondWind", name: "Fôlego renovado", icon: "♥", description: "Recupere 1 ponto de vida.", max: Infinity });
  for (let i = choices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices.slice(0, Math.min(3, choices.length));
}