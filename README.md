# Shooter Core

Jogo mobile-first de arqueiro e sobrevivência em Canvas 2D, com módulos ES nativos e sem dependências de build.

## Executar localmente

Sirva esta pasta por HTTP, por exemplo com python -m http.server 8000, e abra http://localhost:8000. Módulos ES não carregam de forma confiável via file://.

## Controles

- O arco dispara automaticamente para cima, em linha reta.
- Toque/arraste horizontalmente para alinhar o arqueiro aos alvos e desviar.
- No teclado, use A/D ou as setas esquerda/direita.
- Inimigos derrotados deixam gemas de XP; elas se aproximam do arqueiro e concedem XP ao serem coletadas.
- Ao subir de nível, o jogo pausa para escolher uma melhoria.

## Ritmo e evolução

As ondas iniciais usam balões lentos e alvos espaçados, no ritmo de um jogo de arcade clássico. Morcegos, brutos e chefes entram em ondas posteriores; a cadência sobe gradualmente.

As melhorias seguem o padrão de arma + item passivo no nível máximo antes de oferecer uma evolução. As combinações desta versão são:

- Flechas de Fogo nível 3 + Amuleto de Combustão nível 2 = Flecha de Fênix, com explosões maiores.
- Tiro Múltiplo nível 3 + Duplicador nível 2 = Tempestade de Flechas, com uma salva maior e recarga menor.
- Flecha Gélida nível 3 + Encantamento nível 2 = Rajada Glacial, que desacelera inimigos próximos.
- Ponta Perfurante nível 3 + Braçadeira nível 2 = Besta Perfurante, cujos virotes causam dano alto e atravessam inimigos.

O modelo de evolução foi inspirado no padrão de arma + passiva e nos bônus de recarga e quantidade de projéteis de Vampire Survivors: https://vampire.survivors.wiki/w/Evolution, https://vampire.survivors.wiki/w/Empty_Tome, https://vampire.survivors.wiki/w/Duplicator.

## Estrutura

- index.html e styles.css: interface vertical responsiva e HUD.
- src/main.js: loop e inicialização.
- src/input.js: movimento por Pointer Events e teclado.
- src/game.js: entidades, física, combate, ondas, XP e progressão.
- src/upgrades.js e src/ui.js: combinações e interface de level-up/derrota.
- src/renderer.js: desenho Canvas em mundo lógico 360 × 640.
- src/pool.js: reutilização de objetos.