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

A ordem de importação em `src/estilo.css` importa. Cada arquivo pode ajustar o anterior.

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

Três famílias: Alegreya nos títulos, Alegreya Sans no corpo, Caveat só em nota à mão.

### Peso

`--p-normal` 400 no corpo. `--p-medio` 500 em navegação e destaque leve. `--p-forte` 700 em rótulo e ação. `--p-titulo` 800 só em título Alegreya. Texto corrido nunca vai em negrito.

### Raio

`--r-4` etiqueta. `--r-8` controle e item de lista. `--r-12` cartão. `--r-18` painel e livro. `--r-pilula` botão e selo. Elemento de dentro usa raio menor que o de fora.

### Espaço

Grade de 4: `--s1` 4, `--s2` 8, `--s3` 12, `--s4` 16, `--s5` 24, `--s6` 32.

### Altura de controle

`--h-sm` 32, `--h-md` 40, `--h-lg` 48. No celular nenhum alvo fica abaixo de 44 por 44.

### Tempo e movimento

`--d-rapido` 140 ms para resposta ao toque. `--d-medio` 200 ms para entrada de elemento. `--d-lento` 300 ms para o que atravessa a tela. Curva `--sai` em tudo que entra ou sai. Só `transform` e `opacity` animam. Com movimento reduzido, o deslocamento sai e fica um aparecer curto.

### Elevação

`--sombra-1` para cartão em lista. `--sombra-2` para bloco em destaque e cartão sob o mouse.

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
| Campo | `input`, `select`, `textarea` | | normal, foco, desligado |
| Foto colada | `figure.foto-colada` | com fita adesiva | |
| Vazio | `Vazio` em `Diario.tsx` | com ou sem ação | |
| Livro | `Livro` em `Diario.tsx` | normal, largo, tela inteira | abrindo, saindo |

## Regras de uso

- Título de grupo dentro de uma página usa Faixa ou cabeçalho de Bloco, nunca texto solto em negrito
- Assunto que cabe em poucas linhas vira Bloco, com ícone no cabeçalho
- Página da esquerda do livro nunca fica só com o título: leva foto colada, etiquetas de número ou roteiro
- Cor de sala aparece como faixa lateral no cartão, não como fundo
- Valor novo de letra, raio ou tempo entra primeiro em `tokens.css`
