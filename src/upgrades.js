const UPGRADES = [
  { id: "multishot", name: "Multi-disparo", icon: "➶", description: "Dispare uma flecha extra em leque.", max: 3 },
  { id: "piercing", name: "Ponta perfurante", icon: "➤", description: "Cada nível atravessa mais um alvo.", max: 3 },
  { id: "ricochet", name: "Ricochete", icon: "↗", description: "A flecha quica mais uma vez nas bordas.", max: 3 },
  { id: "drawSpeed", name: "Velocidade de recarga", icon: "⌁", description: "Reduz o intervalo entre disparos.", max: 4 },
  { id: "attackPower", name: "Poder de ataque", icon: "✦", description: "Aumenta o dano de cada flecha.", max: 4 },
  { id: "magnet", name: "Ímã de XP", icon: "◉", description: "Atrai orbes de experiência de mais longe.", max: 4 },
  { id: "arrowVelocity", name: "Flecha veloz", icon: "➤", description: "Aumenta velocidade e alcance do projétil.", max: 4 },
  { id: "fireArrow", name: "Flecha de fogo", icon: "♨", description: "Incendeia o alvo e causa dano em área.", max: 3 },
  { id: "iceArrow", name: "Flecha gélida", icon: "❄", description: "Atingir um inimigo reduz sua velocidade.", max: 3 },
  { id: "lightning", name: "Flecha elétrica", icon: "ϟ", description: "A eletricidade salta para inimigos próximos.", max: 3 },
  { id: "combustion", name: "Amuleto de combustão", icon: "✧", description: "Potencializa a evolução das flechas de fogo.", max: 2 },
];

export function getUpgradeChoices(game) {
  const choices = UPGRADES
    .filter((upgrade) => (game.upgrades[upgrade.id] || 0) < upgrade.max)
    .map((upgrade) => ({
      ...upgrade,
      description: upgrade.description + " Nível " + ((game.upgrades[upgrade.id] || 0) + 1) + " de " + upgrade.max + ".",
    }));

  if (!game.evolved && (game.upgrades.fireArrow || 0) >= 3 && (game.upgrades.combustion || 0) >= 2) {
    choices.push({
      id: "phoenix",
      name: "Flecha de Fênix",
      icon: "🔥",
      description: "Evolução: dispara chamas maiores e mais poderosas.",
      max: 1,
      evolution: true,
    });
  }

  for (let i = choices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices.slice(0, Math.min(3, choices.length));
}