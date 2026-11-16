# Design system do Lab V30

O lab é um diário de campo: papel, couro verde e madeira sobre a foto do open space. Este documento diz quais degraus existem, quando usar cada um e quais são os componentes. Os valores moram em `src/estilo/tokens.css`.

## Onde fica cada coisa

| Arquivo | O que tem |
|---|---|
| `src/estilo/tokens.css` | Cores, letra, peso, espaço, raio, tempo, altura de controle e elevação |
| `src/estilo/base.css` | Mapa, placa, menu, console, livro e os painéis de origem |
| `src/estilo/nucleo.css` | Pedido ao lab, entregas, treino e skills |
| `src/estilo/acabamento.css` | Estados, vazios, laptop e celular |
| `src/estilo/pedidos.css` | Modelos de pedido, Para você e menu por assunto |
| `src/estilo/ferramentas.css` | Quadro, linha do tempo, calendário e tela inteira |
| `src/estilo/briefing.css` | Briefing guiado |
| `src/estilo/sistema.css` | Ajustes de degrau e os componentes de papel |
| `src/estilo/lateral.css` | Menu lateral em verde e área do sócio |
| `src/estilo/ambiente.css` | Cena da mesa, Pong e etiquetas |
| `src/estilo/radio.css` | Rádio V30: tocador no livro e botão do menu |
| `src/estilo/padrao.css` | Os três tipos de cartão, os estados dos controles e o movimento de entrada. Vem por último |

A ordem de importação em `src/estilo.css` importa. Cada arquivo pode ajustar o anterior, e `padrao.css` fecha a conta. O teste `src/lib/estilo.test.ts` confere essa ordem e as regras de cor, espaço, letra e movimento a cada rodada.

## Cor

A casa tem três cores de marca: verde `#20352F`, creme `#F0EAD6` e areia `#C5AA81`. O lab acrescenta os tons de papel e madeira do diário e um conjunto pequeno de cores de estado. Cor nova entra primeiro em `tokens.css`. Cor de marca, de estado, de cartão, de borda e de realce só existe como variável, e o teste do estilo barra a volta do valor solto. Sobram valores de uso único, como madeira, carimbo, selo e fases da linha do tempo, que ficam no arquivo onde são usados.

| Papel | Variável | Uso |
|---|---|---|
| Comando | `--tinta` | Botão primário, título, menu lateral |
| Leitura | `--papel`, `--papel-2`, `--cartao` | Fundo de página, faixa e cartão |
| Acento | `--areia`, `--ouro` | Divisória, número, borda da resposta pronta |
| Alerta de assunto | `--telha`, `--telha-forte` | Fita da data, faixa Para você |
| Sucesso | `--sucesso`, `--sucesso-fundo` | Feito, livre |
| Erro | `--erro`, `--erro-fundo` | Campo inválido, ciclo encerrado |
| Aviso | `--aviso`, `--aviso-fundo` | Pedido parado, data na linha das decisões |
| Informação | `--info`, `--info-fundo` | Nota de sistema |
| Borda | `--cartao-borda`, `--borda-forte`, `--borda-campo` | Cartão, tracejado e campo |
| Realce | `--realce`, `--realce-forte`, `--cartao-leve`, `--veu` | Fundo sob o mouse, trilho, cartão translúcido e véu sobre o couro |

Contraste conferido na auditoria de 15 de novembro: texto sobre papel acima de 4,5 para 1, borda de campo e barra de progresso acima de 3 para 1. Texto apagado usa cor própria, nunca opacidade. Cor nunca carrega o sentido sozinha: estado vem com palavra ou ícone junto.

## Degraus

### Letra

| Variável | Tamanho | Uso |
|---|---|---|
| `--t-12` | 12 | Etiqueta, selo, legenda em caixa alta |
| `--t-13` | 13 | Texto de apoio, metadado |
| `--t-14` | 14 | Controle, rótulo de campo, texto de cartão |
| `--t-16` | 16 | Leitura: conversa, entrega, menu |
| `--t-18` | 18 | Subtítulo, nota à mão |
| `--t-22` | 22 | Título de bloco, número de destaque |
| `--t-28` | 28 | Título de página |

Três famílias: Roboto no corpo e em todo controle, como manda a marca; Alegreya nos títulos do diário; Caveat só em nota à mão. Entrelinha em três degraus: `--lh-titulo` 1,15, `--lh-denso` 1,35 e `--lh-leitura` 1,5.

O mesmo papel tem o mesmo tamanho em toda tela: título de página 28, título de seção e mês do calendário 22, título de registro 18, cabeçalho de bloco 16, cabeçalho de coluna 14 em Roboto forte. Número em coluna usa algarismo de largura fixa.

### Peso

`--p-normal` 400 no corpo. `--p-medio` 500 em navegação e destaque leve. `--p-forte` 700 em rótulo e ação. `--p-titulo` 800 só em título Alegreya. Texto corrido nunca vai em negrito.

### Raio

`--r-4` etiqueta. `--r-8` controle e item de lista. `--r-12` cartão. `--r-18` painel e livro. `--r-pilula` botão e selo. Elemento de dentro usa raio menor que o de fora.

### Espaço

Grade de 4: `--s0` 2 para ajuste fino, `--s1` 4, `--s2` 8, `--s3` 12, `--s4` 16, `--s5` 24, `--s6` 32. Respiro, margem e vão só usam esses degraus.

### Altura de controle

`--h-sm` 32, `--h-md` 40, `--h-lg` 48. No celular nenhum alvo fica abaixo de 44 por 44.

### Tempo e movimento

`--d-rapido` 140 ms para resposta ao toque. `--d-medio` 200 ms para entrada de elemento. `--d-lento` 300 ms para o que atravessa a tela. Curva `--sai` em tudo que entra ou sai. Só `transform` e `opacity` animam. Com movimento reduzido, o deslocamento sai e fica um aparecer curto.

| Momento | Movimento |
|---|---|
| Apertar qualquer botão | Encolhe para 0,97 em 140 ms |
| Aviso, resposta pronta e conteúdo de gaveta | Chega de baixo, 8 px, em 200 ms |
| Lista que acabou de chegar: plano, banco, estações | Itens entram um depois do outro, 50 ms de intervalo |
| Botão esperando o servidor | Três pontos, os mesmos do andamento do pedido |
| Livro | Abre em 300 ms a partir da lombada |

O que se usa dezenas de vezes por dia, como trocar de aba e passar o mouse, não se desloca: só muda de cor. Nada passa de 300 ms na interface. Efeito de mouse só existe em aparelho com mouse.

### Elevação

`--sombra-1` para cartão em lista. `--sombra-2` para bloco em destaque e cartão sob o mouse.

## Cartão

Três tipos, e só três. Cartão novo entra numa das listas de `padrao.css`.

| Tipo | Quando | Desenho |
|---|---|---|
| Item | Uma coisa numa lista: missão, pessoa, skill, decisão, lugar | Borda fina, raio 8, sombra de um degrau |
| Bloco | Um assunto inteiro, com título: cliente, pedido, reunião, resumo do projeto, próxima reunião | Borda fina, raio 12, sombra de dois degraus |
| Tracejado | Rascunho, formulário, vazio e convite: plano a aprovar, banco de convidados, edição | Borda tracejada, sem fundo e sem sombra |

A resposta pronta e o fecho do briefing são bloco com borda dourada, porque são o ponto alto da tela.

## Componentes

| Componente | Classe ou função | Variantes | Estados |
|---|---|---|---|
| Botão | `.primario`, `.leve`, `.perigo`, `.mini` | três alturas | normal, mouse, apertado, desligado, foco |
| Link de ação | `button.link` | | normal, mouse, foco |
| Aba | `.abas button` | | normal, escolhida, foco |
| Faixa | `.faixa`, `.titulo-coluna`, `.para-voce h3` | tinta, telha | |
| Bloco | `Bloco` em `Diario.tsx` | com ou sem ação no cabeçalho | |
| Etiqueta de número | `Resumo` em `Diario.tsx` | com valor, zerada | |
| Cartão de missão | `.cartao-missao`, `.cartao` | na fila, fazendo, feito | normal, mouse, editando |
| Cartão de pessoa | `.elenco li` | cor da sala, situação | normal, mouse, apertado |
| Selo de estado | `.estado`, `.estado-fita`, `.carimbo` | fila, fazendo, feito, entregue | |
| Fala | `.fala` | dele, minha | nova, digitando |
| Campo | `input`, `select`, `textarea` | | normal, foco, desligado, inválido com `aria-invalid` e texto em `.erro-campo` |
| Foto colada | `figure.foto-colada` | com fita adesiva | |
| Vazio | `Vazio` em `Diario.tsx` | com ou sem ação | |
| Gaveta | `Gaveta` em `Nucleo.tsx`, `.gaveta` | com ou sem resumo na linha fechada | fechada, aberta, foco |
| Cartão do banco | `.banco li` | cor da sala, sigla no lugar do rosto | normal, chamando |
| Livro | `Livro` em `Diario.tsx` | normal, largo, tela inteira | abrindo, saindo |
| Reunião | `article.reuniao` | próxima, feita | normal, remarcando, registrando ata |
| Decisão | `ol.linha-tempo li` | com ou sem projeto | normal, editando |
| Rádio | `Radio` e `BotaoDaRadio` em `Radio.tsx` | livro, botão do menu | desligada, no ar |
| Botão ocupado | qualquer botão com `aria-busy` | | três pontos enquanto espera |

## Regras de uso

- Título de grupo dentro de uma página usa Faixa ou cabeçalho de Bloco, nunca texto solto em negrito
- Assunto que cabe em poucas linhas vira Bloco, com ícone no cabeçalho
- Página da esquerda do livro nunca fica só com o título: leva foto colada, etiquetas de número ou roteiro
- Cor de sala aparece como faixa lateral no cartão, não como fundo
- Valor novo de letra, raio ou tempo entra primeiro em `tokens.css`

## Leis de UX que valem aqui

Cada lei vira uma regra que dá para conferir na tela. A coluna da direita diz onde o lab ainda deve.

| Lei | Regra no lab | Onde já vale | Onde ainda deve |
|---|---|---|---|
| Hick | Uma decisão principal por tela. Escolha com mais de sete opções vem agrupada ou com sugestão | Briefing com uma pergunta por vez; modelos de pedido | Menu com 13 itens, mesmo agrupado em quatro blocos |
| Miller e agrupamento | Lista longa vira grupos de até sete | Menu por assunto; quadro em três colunas | Kanban do projeto com muitas missões numa coluna só |
| Fitts | Ação principal grande e perto de onde a mão já está. Alvo de 44 no celular | Console na base da tela; alvos corrigidos nesta rodada | Fechar o livro fica longe do conteúdo em tela inteira |
| Jakob | Padrão conhecido antes de invenção: kanban, calendário, abas, conversa | Painéis; briefing em formato de conversa | Menu vertical de diário pede um primeiro uso para entender |
| Tesler | A complexidade fica com o lab, não com o sócio | Orquestração divide o pedido; plano vem pronto para aprovar | Configuração de chave e acesso ainda é manual no painel da Cloudflare |
| Estética e usabilidade | Tudo que parece igual é igual | Sete letras, cinco raios, três tempos, três tipos de cartão, cor de sistema só por variável | Cores de fase da linha do tempo ainda são valores próprios dentro de `ferramentas.css` |
| Pico e fim | O momento da entrega e o fecho do pedido são os mais cuidados | Carimbo de feito; resposta ao pedido em destaque | Fecho do pedido não tem um momento próprio no mapa |
| Limiar de Doherty | Resposta em menos de 400 ms ou sinal de que algo anda | Atualização otimista; Clara digitando; balão no mapa | Primeira carga do mapa passa de um segundo |
| Reconhecer em vez de lembrar | Opção à vista em vez de campo em branco | Respostas prontas no briefing; modelos de pedido; skills marcáveis | Dar missão ainda é um campo livre, sem sugestão |
| Gradiente de meta | Progresso sempre visível perto do fim | Roteiro do briefing; barras por projeto; dia do ciclo | Pedido em execução mostra contagem, mas não uma barra |
| Von Restorff | Uma ação primária por tela, em verde tinta | Botão primário único por formulário | Fecho do briefing tem cinco botões lado a lado |
| Região comum e proximidade | O que é do mesmo assunto fica no mesmo bloco | Bloco com cabeçalho; etiquetas de número; reunião, decisão e resumo do projeto em cartão | Memória é uma lista única, sem agrupar por pessoa |
| Prova social | Não se aplica: ferramenta interna, sem número inventado | | |

## Lateral

Menu de altura inteira em verde tinta, com a marca no topo, os itens em quatro grupos nomeados e a área do sócio no pé. Recolhe para 72 de largura e fica só nos ícones, com Vetor30 virando V30. A escolha fica guardada no navegador. A largura mora na variável `--lado`, e livro, console e cartão do lugar se posicionam a partir dela. No celular a lateral dá lugar à barra de cima.

A área do sócio mostra o e-mail que o login da equipe entrega pela rota `/api/eu`. Sem o login ligado, mostra Visitante e leva às Conexões.

## Marca

O logo é sempre o arquivo oficial, em `src/ui/marca/`, pelo componente `Marca`. Texto em fonte no lugar do logo não entra.

| Onde | Versão | Cor |
|---|---|---|
| Menu lateral aberto | Vetor30 | creme e areia sobre o verde |
| Menu recolhido | V30 | creme e areia sobre o verde |
| Celular | V30 | verde e areia sobre papel |
| Tela de espera | Vetor30 | verde e areia sobre papel |
| Ícone da aba | V30 | creme sobre o verde, canto arredondado |

A versão cheia fica com 164 px, acima do mínimo de 140. O logo não recebe sombra, contorno nem filtro. O que vale no cenário 3D está em `arte/marca.md`.

## Ambiente

| Peça | Onde | O que faz |
|---|---|---|
| `CenaDaMesa` | `components/Mesa.tsx` | A pessoa na mesa, em dois quadros que alternam a cada 430 ms. Com movimento reduzido fica parada |
| `MesaDe` e `JeitoDe` | `components/Mesa.tsx` | Páginas da direita e da esquerda do livro da mesa: cena, objetos, mural, frase e manias |
| `Pong` e `ComoJogar` | `components/Pong.tsx` | Jogo no canvas, com as regras em `lib/pong.ts`. Mouse, dedo e teclado |
| `.etiquetas` | `estilo/ambiente.css` | Lista de pílulas para objetos e cartões do mural |

Movimento: a cena da mesa entra de perto para longe em 300 ms com a curva `--sai`, uma vez, na abertura. O clique na pessoa leva a câmera do mapa até ela antes de o livro abrir. Trânsito e drones param com movimento reduzido, e o drone de entrega fica pousado.

## Rádio V30

O canto da rádio fica no lounge, com o logo oficial no painel verde. Clicar no aparelho, no botão do menu ou no botão da sala abre o livro da rádio. A música é composta pelo navegador, compasso por compasso, em `lib/radio.ts` e `lib/tocador.ts`: não há arquivo de áudio nem música de terceiros. São três estações, o volume e a estação ficam guardados no navegador, e o som só começa por um clique. Fechar o livro não para a música.

A aba Do Brasil toca rádios de verdade, do catálogo aberto Radio Browser. O Worker busca o catálogo em `worker/radios.ts`, normaliza em `lib/radios.ts` e guarda por doze horas. Entram só rádios com som seguro, checagem recente funcionando e sem HLS: cerca de 1.100. Estado vira UF mesmo quando vem escrito de outro jeito, e as etiquetas viram quinze gêneros em português. Rádio que não toca em quinze segundos avisa e pede outra. Na prévia sem servidor a aba mostra o aviso e só a casa toca.

## Voz da interface

- Português falado, frase curta, sem travessão e sem aspas
- Botão diz o que acontece: Chamar, Dispensar, Marcar reunião, Fechar reunião
- Vazio sempre diz o próximo passo, nunca só que não há nada
- Erro diz o que houve e o que fazer, sem código e sem culpa
- Cliente aparece por setor e situação, nunca pelo nome. Número só entra se for real

## Acessibilidade

- Contraste AA em texto e 3 para 1 em borda de campo, ícone e barra
- Foco sempre visível, com contorno de 2 px
- Alvo de toque de 44 por 44 no celular
- Estado nunca depende só de cor
- Movimento reduzido respeitado em toda animação, inclusive rolagem suave e a rádio
- Tudo que se faz com mouse se faz com teclado. Escape fecha o livro

## Registro de mudanças

| Data | O que mudou |
|---|---|
| 15 de novembro | Auditoria visual: corpo em Roboto, cor só por variável, espaço na grade de 4, três tipos de cartão, estados de controle, movimento de entrada, registro em cartão na Agenda e nas Decisões, teste do estilo |
| 15 de novembro | Rádio V30, roupa informal do elenco, pufes e canto da rádio no lounge |
| 14 de novembro | Banco de convidados em gavetas por função e painel de skills em gavetas |
