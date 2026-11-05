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

## #7 Publicação na Cloudflare com Workers
Um Worker agencia-v30 serve o build estático e responde as rotas /api. Deploy pelo GitHub Actions a cada push na main, com teste e build antes.
Pronto quando: push na main publica e /api/saude responde ok.

## #8 Banco D1 com esquema inicial
Banco agencia-v30 com clientes (setor e situação, nunca nome), missões e mensagens. Migração versionada em migrations/.
Pronto quando: tabelas criadas e o Worker lê e grava.

## #9 Conversa com especialista pelo Worker
POST /api/conversa recebe o especialista e as mensagens, chama a API do Claude com a chave guardada como segredo do Worker e grava a troca no D1. A chave nunca vai para o navegador.
Pronto quando: teste cobre a montagem do pedido e o Worker responde erro claro sem chave.
