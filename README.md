# Shooter Core

Protótipo inicial de um jogo de arqueiro mobile-first em Canvas 2D. O projeto usa módulos JavaScript nativos e não precisa de dependências ou etapa de build.

## Executar localmente

Sirva a pasta por um servidor HTTP local, por exemplo:

    python -m http.server 8000

Depois abra http://localhost:8000 no navegador. Módulos ES não carregam de forma confiável via file://.

## Controles

- Toque e arraste acima da base para mirar; solte para disparar.
- Quanto mais longe o arrasto, maior a potência.
- Arraste na faixa inferior para mover o arqueiro pela base.
- A linha pontilhada mostra a trajetória aproximada da flecha.

## Estrutura

- index.html: interface e canvas.
- styles.css: layout vertical e responsivo.
- src/main.js: inicialização e game loop.
- src/input.js: Pointer Events para mouse, toque e caneta.
- src/game.js: estado, física, alvos, colisões e pontuação.
- src/renderer.js: desenho no canvas com escala lógica 360 × 640.
- src/pool.js: reutilização de objetos de flecha e impacto.

A base prepara o loop de mira e disparo. Próximos passos sugeridos: vida e ondas, gemas de XP, pausa de level-up e seleção de upgrades.