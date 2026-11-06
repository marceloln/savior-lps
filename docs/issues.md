# Issues

As issues vivem aqui e no GitHub do repositório, com o mesmo número no título. A auditoria completa está em docs/auditoria.md.

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

## #19 Pessoas em 8 direções
Seguindo as skills isometric-character-sprites e isometric-pathfinding: 8 direções renderizadas do mesmo modelo, direção escolhida pelo vetor de movimento, pé fixo em todas.
Pronto quando: teste cobre a escolha da direção e ninguém escorrega de lado no mapa.

## #20 Cenário vivo
Árvores de fora balançam com vento e carros passam na rua, como sprites sobre o render. Salas de vidro e árvores grandes dentro do lab.
Pronto quando: vento e trânsito rodam leves e respeitam movimento reduzido.

## #21 Interface do diário de campo
Papel, couro e madeira. Placa e menu à esquerda, lugar embaixo à esquerda, objetivo e missões à direita, console de ações embaixo no centro, livro aberto no centro para os detalhes.

## #22 Ação Mover
Com uma pessoa escolhida, Mover mostra as casas do piso e o caminho até o ponto clicado.

Nota sobre a arte: os scripts em arte/ rodam com o Blender 4.2 em Python (bpy). Os caminhos de saída estão fixos na máquina onde foram gerados; ajuste antes de rodar em outro lugar.

## #23 Ritmo do lab
Hoje quase todo mundo sai da mesa a cada meio minuto e o escritório parece um corredor. A maior parte da equipe deve ficar trabalhando na mesa, com poucas pessoas circulando ao mesmo tempo.
- Sempre 2 ou 3 pessoas fora da mesa por conta própria ao mesmo tempo (ordens do jogador não contam)
- Tempo na mesa entre 1 e 3 minutos antes de levantar
- Café dura de 20 a 40 segundos e conversa com colega de 10 a 20 segundos
- Teste: em 10 minutos simulados nunca há mais de 3 fora e a média na mesa fica acima de 80%

## #24 Salas abrem suas funções
Clicar numa sala só mostrava um cartão pequeno no canto. A sala deve abrir o diário com o que acontece ali.
- Página da esquerda: recorte da sala no mapa e para que ela serve
- Abas Equipe, Missões e Reuniões
- Equipe: quem trabalha ali, com acesso à ficha de cada um; na recepção, o briefing com a Clara
- Missões: o que a equipe da sala tem em aberto e um campo para dar missão a alguém de lá
- Reuniões: reuniões com gente da sala e um botão para marcar uma nova
- A câmera vai até a sala ao abrir

## #25 HUD com funções de verdade
Revisão de UX e UI das telas. Cada painel precisa levar a uma ação.
- Abas trocam direto mesmo com um livro aberto
- Console mostra o que a pessoa escolhida está fazendo; sem ninguém escolhido, diz como liberar as ações, e os botões apagados parecem apagados
- Missão abre a ficha com o campo já em foco; cada missão aberta tem Começar ou Concluir; o console confirma a missão dada
- Painel de missões mostra também a fila, o rosto leva à pessoa no mapa e o texto leva ao projeto, com atalho para ver todas
- Sala: Conversar e Missão ao lado de cada pessoa; reunião com a sala inteira
- Selos com nome e clicáveis; barra explica que soma todos os projetos
- Lugares: planta na página da esquerda e lista clicável com quantas pessoas trabalham em cada sala
- Agenda: assunto com pelo menos 3 letras, ata só a partir do dia da reunião, feitas da mais recente para a mais antiga, nome ao passar sobre o rosto
- Missão repetida para a mesma pessoa é recusada
- Celular: aba Missões, faixa de abas com fim esmaecido, botões do console mais altos
- Livro prende o Tab dentro dele; botão de soltar maior; texto secundário mais escuro

## #26 Defeitos da auditoria
- O livro rouba o foco do campo de missão logo depois que ele abre
- Servidor aceita missão repetida para a mesma pessoa
- Missão com projeto inexistente derruba a rota com erro 500
- Apagar missão inexistente responde como se tivesse apagado
- Servidor aceita ata de reunião futura e datas impossíveis
Pronto quando: os testes da API cobrem cada caso e o teste da interface digita a missão logo depois de abrir.

## #27 Acesso fechado antes de publicar
Cloudflare Access na frente do Worker, só para a equipe. Limite de mensagens por minuto na conversa para proteger a chave.
Pronto quando: sem login a página e a API recusam, e a conversa recusa rajada com aviso claro.

## #28 Cliente e projeto pela interface
Cadastrar cliente por setor e situação, abrir projeto ligado a ele. O briefing da Clara termina com um resumo e um botão que cria o cliente e o projeto já com as primeiras missões de diagnóstico.
Pronto quando: um cliente novo nasce do briefing e aparece em Clientes e Projetos.

## #29 Ciclo do projeto anda sozinho
Projeto guarda a data de início. O dia do ciclo é calculado. A fase avança por botão no projeto, com aviso quando ainda há missão aberta da fase.
Pronto quando: teste cobre o cálculo do dia e a troca de fase grava no banco.

## #30 Dados consistentes
Semente nova descrita em docs/auditoria.md, com datas relativas ao dia em que o banco é semeado, missões coerentes com a fase, reuniões com ata ligadas às decisões, memórias e instruções. Rota de desenvolvimento para semear de novo o banco local.
Pronto quando: o lab conta a mesma história em todas as abas e as datas nunca envelhecem.

## #31 Cadeiras e estações de trabalho
Cadeira de escritório em cada mesa, mesas na altura de quem trabalha sentado, pessoas sentadas digitando quando estão na mesa.
Pronto quando: ninguém trabalha em pé no render e as pessoas se sentam e levantam ao sair.

## #32 Personagens novos
Modelo com roupa de escritório, cabelo variado, sapato, óculos e acessórios. Mulheres e homens distintos. Mesma câmera e 8 direções, com poses parado, andar e sentado digitando.
Pronto quando: cada um dos 17 é reconhecível pelo retrato e pelo mapa.

## #33 Ficha com a pessoa na estação
A página da esquerda da ficha mostra a pessoa sentada na própria estação, com a cor da sala, renderizada no Blender.
Pronto quando: as 17 fichas abrem com a cena da pessoa.

## #34 Vocabulário e textos
Missão em todos os lugares, nunca tarefa. Console com frase natural para o que a pessoa faz agora.

## #35 Publicação
Pull request das branches empilhadas para a main, revisão, segredo da chave da Anthropic no Worker e primeiro deploy pela main. Depende da #27.

## #36 Pendências visuais
Nomes legíveis na planta de Lugares, página da esquerda útil na ficha e na Agenda, confirmar o balanço das árvores num navegador normal.

## #37 Corrigir reunião e decisão
Editar e apagar reunião e decisão lançadas errado, pela API e pela interface.
