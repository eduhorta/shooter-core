# Shooter Core

Jogo mobile-first de arqueiro e sobrevivência em Canvas 2D, com módulos ES nativos e sem dependências de build.

## Executar localmente

Sirva esta pasta por HTTP, por exemplo com python -m http.server 8000, e abra http://localhost:8000. Módulos ES não carregam de forma confiável via file://.

## Controles

- Toque/arraste acima da base para mirar; solte para disparar. O comprimento do arrasto regula a força.
- Arraste na faixa inferior para mover o arqueiro.
- A linha pontilhada mostra a trajetória aproximada.
- Escolha uma carta de upgrade quando subir de nível.

## Sistemas implementados

- Ondas com balões, morcegos, brutos e chefes; inimigos ativos descem e alguns disparam contra a base.
- Vida, dano, invulnerabilidade curta e tela de derrota com reinício.
- Orbes de XP com atração magnética e pausa de level-up com três escolhas.
- Upgrades de multi-shot, perfuração, ricochete, recarga, dano, ímã, velocidade e flechas elementais.
- Evolução Flecha de Fogo + Amuleto de Combustão em Flecha de Fênix.
- Pools reutilizáveis de flechas, partículas e orbes.

## Estrutura

- index.html e styles.css: interface vertical responsiva e HUD.
- src/main.js: loop e inicialização.
- src/input.js: Pointer Events para mouse, toque e caneta.
- src/game.js: entidades, física, combate, ondas, XP e progressão.
- src/upgrades.js e src/ui.js: cartas e interface de level-up/derrota.
- src/renderer.js: desenho Canvas em mundo lógico 360 × 640.
- src/pool.js: reutilização de objetos.