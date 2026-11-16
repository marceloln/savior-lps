# Backlog do Lab V30 e desenho do pixel perfect

Data: 14 de novembro de 2026. Estado: aguardando aprovação do sócio. Nada daqui foi implementado.

## Intenção

Deixar o lab no ponto para os consultores usarem: publicado, consistente no pixel e com as ferramentas que faltam. O visual aprovado não muda de cara. Muda a consistência.

## O que a medição mostrou

Contagem no navegador, 16 telas, em 1440, 1280 e 390 de largura.

- 14 tamanhos de letra em uso: 12, 13, 13,33, 14, 14,5, 15, 16, 17, 18, 20, 22, 24, 26 e 30
- 12 alturas de botão e campo no computador: 18, 24, 26, 27, 29, 30, 32, 34, 36, 40, 44 e 50
- 12 raios de canto: 2, 4, 5, 8, 9, 10, 12, 14, 18, 20, pílula e círculo
- Sete em cada dez textos em peso 700 ou mais. Há uso de peso 900, que a fonte não tem
- No celular: retrato do cartão de missão com 34 por 30, título do cartão no quadro com 18 de altura, links da Memória estreitos, fechar o livro com 34 de largura

## Objetivos

- Tudo que parece igual é igual: mesma letra, mesma altura, mesmo raio, mesmo respiro
- Nenhum alvo de toque abaixo de 44 por 44 no celular
- Mudança visual não aprovada falha um teste

## Fora do escopo

- Trocar fonte, paleta ou a ideia do diário de campo
- Redesenhar telas que já funcionam

## O que seria um fracasso

- O lab ficar diferente do que foi aprovado
- Consertar tela a tela e os números voltarem a subir na rodada seguinte

## Caminhos considerados

1. Sistema primeiro, depois as telas. Fecha os degraus como variáveis, passa tela a tela no que sobrar e guarda fotos de referência. Custa mais no começo e para de voltar. Recomendado.
2. Tela a tela, direto. Resultado mais rápido na primeira tela, mas cada tela vira um caso à parte. Foi assim que chegamos nos 14 tamanhos.
3. Redesenhar do zero. Joga fora um visual aprovado por um ganho que o caminho 1 já entrega.

Escolha: pendente do sócio.

## Degraus propostos

Chamadas minhas, a confirmar.

- Letra: 12, 13, 14, 16, 18, 22 e 28
- Peso: 400 no corpo, 500 em destaque leve, 700 em rótulo e ação, 800 só nos títulos em Alegreya
- Altura de controle: 32, 40 e 48 no computador, 44 no mínimo no celular
- Raio: 4, 8, 12, 18 e pílula
- Espaço: grade de 4

## Backlog

P1 primeiro, P2 logo depois, P3 pode esperar.

### 1. Publicar (depende do sócio)

- P1 Juntar a pull request 20, da conta do deploy
- P1 Juntar 33 e 35 no ramo da junção e a 27 na main
- P1 Ligar o Cloudflare Access
- P1 Guardar a chave de um provedor e rodar um pedido real de ponta a ponta

### 2. Pixel perfect

- P1 Escala de texto em 7 degraus
- P1 Peso e hierarquia
- P1 Altura dos controles
- P1 Raios de canto
- P1 Grade de espaço
- P1 Alvos de toque no celular
- P2 Passada tela a tela com régua, 16 telas em três tamanhos
- P2 Estados dos controles: foco, mouse, apertado e desligado
- P2 Folha de estilo separada por área, com os degraus como variáveis
- P2 Fotos de referência e comparação automática

### 3. Funcionalidade

- P1 Prazo nas missões
- P2 Lousa, mesa de projetos e parede da Marca vivas
- P2 Modelos de trabalho nas mesas de cada sala
- P2 Clara que improvisa perguntas com o modelo de IA
- P2 Anexo no pedido
- P3 Pedido em segundo plano
- P3 Usuário por sócio
- P3 Ferramentas para os agentes

### 4. Qualidade

- P2 Teste de ponta a ponta no repositório
- P2 Peso do carregamento, com o mapa sob demanda
- P2 Revisão dos textos do briefing por quem faz briefing
- P3 Confirmar os dias de cada fase na linha do tempo
- P3 Passada com leitor de tela

### 5. Interface mais rica

- P1 Blocos no lugar do vazio (feito em Ficha, Pessoas e Linha do tempo)
- P1 Faixas e etiquetas de papel (feito)
- P1 Conjunto de ícones para estado, prazo, anexo, fase e tipo de trabalho
- P2 Ilustrações por assunto e para tela vazia
- P2 Marcadores laterais no livro e tela inicial como painel

### 6. Leis de UX

- P1 Menu lateral com grupos (feito)
- P1 Uma ação principal por tela (feito)
- P2 Sugestão ao dar missão e barra no pedido em execução (feito)
- P2 Fecho do pedido no mapa

### 7. Ambiente (pedido de 15 de novembro, issue 43)

O lab precisa parecer um lugar de verdade, com a marca aplicada do jeito certo.

- P1 Sem árvore grande dentro do deck. Nada passa de 1,25 m. Entram canteiros baixos e plantas pequenas em mesas, balcões e cantos
- P1 Marca oficial em 3D. Sai a escultura em fonte padrão. Entram o totem inclinado no gramado, de frente para a câmera, e a parede de marca atrás da recepção, os dois com o arquivo oficial do logo
- P1 Marca oficial na interface. Logo Vetor30 no menu, versão curta V30 no menu recolhido e no celular, ícone da aba. Creme e areia sobre verde, verde e areia sobre claro
- P1 Trânsito na mão certa. Cada veículo usa o sprite que olha para onde ele vai. Regra coberta por teste
- P1 Rua viva. Carros de quatro tipos, van de entrega, motos, bicicletas na ciclofaixa e dois drones de entrega, um que pousa no ponto da calçada
- P1 Árvores de fora mais realistas e diferentes entre si: sibipiruna, oiti, ipê-amarelo, palmeira e araucária
- P1 Mesa de cada especialista. Clicar na pessoa aproxima a câmera e abre a cena da mesa: a pessoa trabalhando, o porta-retrato da família, os objetos dela e o mural atrás
- P1 Peculiaridades de cada um: frase, manias, o que tem na mesa e o que está no mural, num arquivo só que alimenta a tela e o desenho do mural
- P1 Pong clássico ao clicar na mesa de pingue-pongue
- P2 Futuro próximo sem neon: eletroposto com placa solar na calçada e ponto de entrega de drone. O guia de marca proíbe visual futurista, então o tom é de coisa plausível
- P2 Mesa montada também para quem os sócios criarem depois no lab
- P2 Fliperama jogável e outros objetos clicáveis do lounge
- P3 Dia e noite, chuva e estação do ano no entorno
- Feito na frente 10: corpo em Roboto, títulos em Alegreya. Os sócios ainda podem pedir Roboto também nos títulos

### 8. Equipe maior (pedido de 15 de novembro, issue 45)

O lab precisa cobrir as competências que os projetos da V30 pedem, sem inchar a equipe fixa. O repertório veio do repositório aberto agency-agents, reescrito em português. Crédito e lista completa em `docs/convidados.md`.

- P1 Treinar os dezessete da equipe de partida. Cada um ganha ao menos uma skill do ofício dele, dezoito no total, já ligadas a quem faz aquele trabalho
- P1 Banco de convidados por função. Trinta e sete especialistas em oito funções: pessoas e cultura, operação e rede, vendas e receita, marketing e conteúdo, dados e finanças, risco e conformidade, produto e tecnologia, estratégia e gestão
- P1 Chamar e dispensar pela tela de pessoas. O convidado entra com um boneco sem dono e a skill do método dele. Dispensado, volta para o banco e guarda o que aprendeu
- P1 Painel de skills populado. O método de cada convidado fica na biblioteca desde o começo, para treinar quem os sócios quiserem. A biblioteca e o treino aparecem em gavetas: método da casa, ofício da equipe e uma por função
- P1 Banco de dados que já está no ar recebe as skills novas por semente com versão, sem desfazer edição dos sócios
- P2 Os mesmos convidados como skill na conta do Claude, para usar fora do lab
- P2 Mais bonecos. Hoje são seis para trinta e sete convidados e o rosto se repete com mais de três mulheres ou três homens chamados ao mesmo tempo
- P2 Mesa montada para o convidado, com objetos e mural próprios
- P2 Chamar o convidado já ligado a um projeto e manter no squad até o fim do ciclo
- P3 Busca por texto na biblioteca de skills
- P3 Revisão dos sócios no texto dos trinta e sete métodos e das dezoito skills de ofício

### 9. Lab descontraído (pedido de 15 de novembro, issue 47)

O lab é de uma consultoria do Rio, não de um banco. A equipe estava de terno e o lounge não convidava a sentar.

- P1 Roupa informal para os vinte e três bonecos. Sai o terno. Entram camiseta, polo, malha, jeans e bermuda acima do joelho em treze deles
- P1 Pufes grandes com encosto no lounge, em seis posições
- P1 Rádio V30. Um canto com aparelho de madeira, caixas, microfone e discos, com o logo oficial no painel verde. Clicar no aparelho abre a rádio
- P1 Música composta pelo navegador, sem arquivo de áudio e sem obra de terceiros. Três estações, volume, botão no menu que pausa de qualquer tela
- P2 Fliperama jogável
- P2 Mais variação de roupa por dia da semana
- P3 Programação da rádio com vinheta e recado da equipe

### 10. Auditoria visual, de design system e de UX (pedido de 15 de novembro, issue 48)

Auditoria feita com sete referências que o sócio mandou: movimento a serviço do uso, ciência da cor, roteiro do designer, fluxo do usuário, planta do design system e lista de auditoria de UX em oito critérios.

- P1 Cor de sistema só por variável: marca, estado, cartão, borda e realce. Cores de estado com par de fundo e texto. Contraste AA conferido
- P1 Corpo em Roboto, como a marca pede. Alegreya fica só nos títulos do diário
- P1 Espaço na grade de 4 em todo o CSS
- P1 Três tipos de cartão: item, bloco e tracejado. O mesmo papel de título tem o mesmo tamanho em toda tela
- P1 Registro em cartão: reunião, decisão e resumo do projeto deixam de ser texto solto
- P1 Estados de controle completos: mouse, apertado, desligado, inválido e ocupado
- P1 Movimento com função: aviso, resposta pronta, gaveta, lista que chega e cartão que muda de coluna
- P1 Sinal de resposta pronta no menu e num recado, quando o pedido termina com outro livro aberto
- P1 Teste automático do estilo, para a regra não se perder na rodada seguinte
- P2 Gaveta que abre com altura animada
- P2 Primeira carga mais leve: a folha de sprites pesa 2,2 MB e o código 750 KB
- P2 Quadro do projeto com menos botões por cartão
- P3 Memória agrupada por pessoa

### 12. Rádios do Brasil (pedido de 16 de novembro, issue 52)

A Rádio V30 tocava só as três estações compostas pelo navegador. O sócio pediu rádios de verdade, do Brasil inteiro, para escolher.

- P1 Aba Do Brasil com rádios abertas do catálogo Radio Browser, só as de som seguro que responderam na última checagem
- P1 Filtro por estado, por gênero e busca por nome ou cidade
- P1 O servidor guarda a lista por doze horas e troca de espelho quando um cai
- P1 Aviso claro quando a rádio não conecta em quinze segundos
- P2 Favoritas de cada pessoa
- P3 Nome da música no ar, quando a rádio informa

## Deixado para quem construir

- Nome das variáveis e a ordem dos arquivos de estilo
- Ferramenta de comparação de fotos
