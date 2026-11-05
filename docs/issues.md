# Issues

Enquanto o repositório no GitHub não existe, as issues ficam aqui. Cada uma vira issue de verdade quando o repo for criado.

## #1 Base do projeto
React 18, TypeScript, Vite e PixiJS 8. Estrutura pages, hooks, components, lib. Vitest para a lib.
Pronto quando: npm run build e npm test passam.

## #2 Projeção isométrica e leitura do lab.json
lib/projecao.ts converte metros do lab em pixels do render e o inverso no chão, a partir dos vetores da câmera do Blender.
Pronto quando: teste confere pontos conhecidos contra o render.

## #3 Rotas com A*
lib/rotas.ts monta a grade de 25 cm com os obstáculos da cena e devolve caminho suavizado.
Pronto quando: teste cobre caminho livre, desvio de móvel e destino bloqueado.

## #4 Mapa em PixiJS com oclusão por profundidade
components/MapaPixi.tsx desenha fundo e pessoas. Cada pessoa é uma malha com shader que descarta o pixel quando o render está mais perto da câmera.
Pronto quando: pessoa passa atrás de mesa e planta sem cálculo pixel a pixel em JavaScript.

## #5 Câmera
Arrastar, zoom na roda e no toque, enquadramento inicial no deck.

## #6 Dica e clique em área
Passar o mouse mostra área, pessoa ou objeto. Clique numa área abre o painel dela.
