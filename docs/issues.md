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

## #10 Moldura da interface
Barra de cima, menu de baixo e um sistema de janela único (centro no desktop, folha de baixo no celular), fechando com Esc e devolvendo o foco. Itens do menu que ainda não existem abrem um estado vazio honesto dizendo em que etapa chegam.
Pronto quando: todas as entradas do menu abrem e fecham por mouse, teclado e toque.

## #11 Ficha do especialista e painel de área
Clique numa pessoa abre a ficha com retrato tirado do atlas, papel, área e botão de conversa. Clique numa área lista quem trabalha nela.
Pronto quando: dá para ir do mapa à conversa em dois cliques.

## #12 Chat com especialistas
Lista de contatos e conversa, usando /api/historico e /api/conversa. Sem servidor ou sem chave, mostra aviso claro e não perde o que foi digitado.
Pronto quando: teste cobre a montagem das mensagens e o tratamento de erro.

## #13 Briefing com a Clara
Mesma conversa, com a Clara fazendo uma pergunta por vez até fechar setor, situação, dor e prazo.
Pronto quando: a instrução da Clara está no Worker e o briefing abre pelo menu e pelo balcão.

## #14 Esquema de memória no D1
Projetos, tarefas ligadas a projeto, reuniões com ata, decisões, instruções por especialista e memória de notas. Migração 0002.
Pronto quando: migração aplica em banco limpo e em banco com a 0001.

## #15 API de dados no Worker
GET /api/estado devolve tudo que a interface precisa. Rotas para criar, mover e apagar tarefa, criar reunião e gravar ata, criar decisão, ler e salvar instrução, criar e apagar memória. Validação pura e testada.
Pronto quando: testes cobrem a validação e o Worker local responde todas as rotas.

## #16 Dados de exemplo
Na primeira leitura de um banco vazio o Worker grava os exemplos. A prévia sem servidor usa os mesmos exemplos sem gravar. Cliente só por setor e situação.

## #17 Instruções e memória na conversa
A conversa inclui a instrução salva do especialista, as notas de memória dele e as tarefas abertas. Resposta pode virar nota de memória com um clique.

## #18 Menus com dados
Clientes, Projetos com mesa e kanban, Agenda, Decisões, Conexões e Troféus lendo e gravando pela API.
