# Auditoria de funcionalidades do Lab V30

Primeira revisão completa, feita em 6 de novembro de 2026 sobre a branch feature/hud-funcoes.
O objetivo é saber o que funciona de verdade, o que falta para o lab ser usado no dia a dia e em que ordem resolver.

## Como foi feita

1. Leitura de todo o código da interface, do Worker e das migrações.
2. Teste automatizado da API contra o Worker rodando com banco D1 local, rota por rota.
3. Teste automatizado da interface no navegador, seguindo cada história de usuário do começo ao fim, incluindo recarregar a página para ver se o dado ficou gravado.
4. Revisão das capturas de tela de todas as telas no computador e no celular.
5. Revisão das issues #1 a #25 e de tudo que ficou pendente na conversa.

## Quem usa

**Sócio da V30.** Abre o lab para ver como estão os projetos, distribuir trabalho entre os especialistas, conversar com eles e registrar o que foi decidido. É o usuário principal hoje.

**Gerente de projeto da V30.** Usa o lab para conduzir o ritual semanal, mover missões e registrar ata. Ainda não tem conta própria, usa o mesmo acesso.

**Cliente.** Não acessa o lab. Aparece só por setor e situação, nunca pelo nome.

## O que é uma missão

Missão é a unidade de trabalho do lab. Tem dono (um especialista), título, projeto opcional e três estados: na fila, fazendo e feito.
A missão nasce de uma ordem do sócio, de uma reunião ou de uma sala. Ela aparece no painel da direita, na ficha da pessoa, na sala da pessoa e no quadro do projeto.
Missão concluída conta para os troféus e para o andamento do projeto.
Hoje a interface chama a mesma coisa de missão em alguns lugares e de tarefa em outros. A auditoria pede um nome só: missão.

## Histórias de usuário e situação

Legenda: **funciona** quando passou no teste de ponta a ponta, **parcial** quando funciona com defeito ou faltando um pedaço, **não existe** quando ainda não foi construído.

### Ver o lab

| Nº | História | Situação | Observação |
|---|---|---|---|
| H1 | Como sócio, quero abrir o lab e ver a equipe trabalhando, para sentir o ritmo do escritório | funciona | Duas ou três pessoas circulam, o resto trabalha na mesa |
| H2 | Como sócio, quero ver as pessoas sentadas nas estações de trabalho | não existe | O escritório não tem cadeiras e todo mundo trabalha em pé |
| H3 | Como sócio, quero reconhecer cada especialista pela aparência | parcial | Todos usam o mesmo boneco de blocos; homens e mulheres parecem iguais; cabelo cobre o rosto de alguns retratos |
| H4 | Como sócio, quero arrastar, dar zoom e ir até uma sala | funciona | Câmera presa dentro da foto de fundo |
| H5 | Como sócio, quero ver o entorno vivo, com árvores e carros | parcial | Carros confirmados; balanço das árvores ainda não confirmado num navegador normal |

### Pessoas e ordens

| Nº | História | Situação | Observação |
|---|---|---|---|
| H6 | Como sócio, quero escolher alguém no mapa ou na lista de Pessoas | funciona | |
| H7 | Como sócio, quero mandar alguém ir até um ponto do escritório | funciona | Casa ocupada avisa no console |
| H8 | Como sócio, quero dar uma missão em dois cliques | parcial | O botão Missão abre a ficha, mas o livro rouba o foco do campo e a pessoa precisa clicar de novo |
| H9 | Como sócio, quero começar e concluir uma missão sem abrir o projeto | funciona | Pela ficha e pelo quadro do projeto |
| H10 | Como sócio, quero abrir a ficha e ver a pessoa na estação de trabalho dela | não existe | A ficha mostra só um rosto recortado |
| H11 | Como sócio, quero dizer a cada especialista como responder | funciona | Instruções salvas entram na conversa |
| H12 | Como sócio, quero guardar e esquecer notas na memória de cada um | funciona | |

### Conversa e briefing

| Nº | História | Situação | Observação |
|---|---|---|---|
| H13 | Como sócio, quero conversar com um especialista que conhece o projeto | parcial | A conversa monta o contexto certo, mas a chave da API ainda não está no Worker, então nenhuma resposta sai |
| H14 | Como sócio, quero que uma resposta boa vire nota de memória | funciona | Depende da conversa responder |
| H15 | Como sócio, quero fazer o briefing de um cliente novo com a Clara | parcial | A conversa abre, mas o briefing não vira nada. Ao final não nasce cliente, nem projeto, nem missão |
| H16 | Como sócio, quero que um próximo passo dito na conversa vire missão | não existe | Fica para depois do briefing virar cliente |

### Projetos e clientes

| Nº | História | Situação | Observação |
|---|---|---|---|
| H17 | Como sócio, quero ver clientes por setor e situação | funciona | Nunca pelo nome |
| H18 | Como sócio, quero cadastrar um cliente e abrir um projeto | não existe | Não há rota nem tela para criar cliente ou projeto |
| H19 | Como sócio, quero ver o quadro de missões de cada projeto | funciona | |
| H20 | Como sócio, quero que o dia do ciclo de 30 dias ande sozinho | não existe | O dia é um número fixo gravado no banco; o projeto fica no dia 18 para sempre |
| H21 | Como sócio, quero passar o projeto de fase quando a fase fecha | não existe | A fase também é fixa |
| H22 | Como sócio, quero ver o andamento de cada projeto e de todos juntos | funciona | Barra explica que soma todos os projetos |

### Ritual, decisões e conquistas

| Nº | História | Situação | Observação |
|---|---|---|---|
| H23 | Como gerente, quero marcar reunião com a equipe de uma sala | funciona | |
| H24 | Como gerente, quero registrar ata e a decisão que saiu | parcial | Funciona, mas o servidor aceita ata de reunião que ainda não aconteceu e data impossível como 45 de dezembro |
| H25 | Como gerente, quero corrigir ou apagar reunião e decisão lançadas errado | não existe | Não há rota para editar nem apagar |
| H26 | Como sócio, quero ver as conquistas do time | funciona | Troféus contam só o que foi feito |
| H27 | Como sócio, quero saber se o lab está ligado ao banco e à IA | funciona | Aba Conexões |

### Acesso e uso fora do computador

| Nº | História | Situação | Observação |
|---|---|---|---|
| H28 | Como sócio, quero usar o lab no celular | parcial | Abas, missões e console funcionam; a planta de Lugares tem letras pequenas |
| H29 | Como sócio, quero que só a minha equipe consiga ver e mexer no lab | não existe | Qualquer pessoa com o endereço consegue ler, gravar e gastar a chave da IA |
| H30 | Como sócio, quero que o lab publicado seja a versão mais nova | não existe | Nada foi para a main ainda; as branches estão empilhadas e a publicação só roda na main |

Resumo: 14 funcionam, 7 estão parciais e 9 não existem.

## Resultado dos testes

### API, contra o Worker com banco local

Passaram: ler o estado, saúde, conexões, criar, mudar e apagar missão, recusar estado inválido, criar reunião, criar decisão, salvar e limpar instrução, criar e apagar memória, histórico e erro claro na conversa sem chave.

Falharam:
- Missão repetida para a mesma pessoa é aceita pelo servidor. Só a tela barra.
- Missão com projeto que não existe derruba a rota com erro 500, sem mensagem.
- Apagar missão que não existe responde como se tivesse apagado.
- O servidor aceita ata de reunião marcada para o futuro.
- O servidor aceita a data 2026-13-45.
- Não há rota para criar cliente, criar projeto nem mudar fase.
- Qualquer pessoa grava sem login.

### Interface, no navegador

Passaram: ações apagadas sem ninguém escolhido, escolher pela aba Pessoas, Ver no mapa, guardar e esquecer memória, conversa sem chave avisando e guardando o texto digitado, Mover com retorno no console, quadro do projeto, marcar reunião, registrar decisão, briefing abrindo a Clara, selo abrindo a aba certa, troca de aba com livro aberto e reunião continuando depois de recarregar.

Falharam:
- Missão pelo console: o livro pega o foco depois que o campo abre, então quem digita logo em seguida perde o texto.
- Não existe botão para cadastrar cliente.

## Problemas por tema

### Segurança, antes de qualquer publicação
O Worker não pede login e a rota de conversa usa a chave da Anthropic guardada no servidor. Publicado assim, qualquer pessoa com o endereço lê os dados, apaga missões e gasta a chave. Precisa de Cloudflare Access na frente do Worker e de um limite de mensagens por minuto na conversa.

### Dados
- Os exemplos têm datas fixas de novembro de 2026. Daqui a um mês a reunião da próxima semana vira passado sem ata.
- O dia do ciclo e a fase do projeto não mudam.
- O banco local guardou missões de teste repetidas, que apareceram nas capturas da ficha do Rui. A regra nova impede que se repita, mas o banco precisa ser semeado de novo.
- O conjunto de exemplo é pequeno e não conta uma história coerente de ponta a ponta. A proposta está na seção Dados para popular o banco.

### Arte
- O escritório não tem cadeira. As mesas são altas e as pessoas digitam em pé.
- O boneco é o modelo de blocos da Kenney, igual para todos, mudando só a cor. Falta roupa de escritório, cabelo variado, sapato, óculos, acabamento.
- O retrato da ficha é um recorte do rosto. Não mostra a pessoa no lugar dela.

### Interface
- Missão e tarefa aparecem misturadas. O quadro do projeto diz tarefas.
- O console escreve que a pessoa está em seguido do título da missão, e a frase fica estranha.
- Nas fichas e na Agenda a página da esquerda ainda fica quase vazia.
- Os nomes dentro da planta de Lugares saem pequenos.

### Publicação
Oito branches empilhadas, da feature/base-e-mapa até a feature/hud-funcoes, nenhuma na main. A publicação automática só roda na main, então o lab que está no ar não é este.

## Issues da conversa revisadas

| Item | Situação |
|---|---|
| #1 a #18, base, mapa, Worker, banco, interface e dados | Feitos nas branches, ainda fora da main |
| #19 Pessoas em 8 direções | Feito |
| #20 Cenário vivo | Feito, falta confirmar o balanço das árvores num navegador normal |
| #21 Diário de campo | Feito |
| #22 Mover | Feito, com aviso de casa ocupada |
| #23 Ritmo do lab | Feito |
| #24 Salas | Feito |
| #25 HUD com funções | Feito, com o defeito de foco do campo de missão |
| Retrato da Duda só com cabelo | Aberto, entra no refazer dos personagens |
| Imagem da mesa escondida no livro de Projetos | Resolvido, a mesa aparece na página da esquerda |
| Zoom do celular | Resolvido |
| Aviso de Mover em casa ocupada | Resolvido |
| Abrir o PR para a main | Aberto, com você |
| Segredo ANTHROPIC_API_KEY no Worker | Aberto, com você |
| Renomear o repositório e torná-lo privado | Aberto, com você |
| Texto de issues dizendo que o repositório no GitHub não existe | Corrigido nesta auditoria; as issues passam a viver no GitHub também |

## Dados para popular o banco

Regras: cliente só por setor e situação, nenhum número de resultado inventado, nenhuma pessoa real. As datas são calculadas a partir do dia em que o banco é semeado, para o lab nunca envelhecer.

### Clientes
1. Rede regional de postos. Atendimento muda de turno para turno e a loja de conveniência não conversa com a pista. Projeto em Execução.
2. Distribuidora regional de combustíveis. Equipe comercial sem rotina comum e pouca visibilidade do que funciona em cada praça. Projeto em Co-criação.
3. Rede de lojas de conveniência. Turnover alto no balcão e padrão de loja que não se sustenta sem supervisão. Projeto em Diagnóstico.
4. Marca de produto próprio com lojas físicas. Venda online cresce e a loja física não acompanha a experiência. Em conversa, ainda sem projeto, com o briefing da Clara em andamento.

### Projetos
- Piloto de atendimento na pista e na loja. Começou há 17 dias, está no dia 18, fase Execução.
- Ritmo comercial semanal. Começou há 8 dias, dia 9, fase Co-criação.
- Padrão de balcão que se sustenta. Começou há 2 dias, dia 3, fase Diagnóstico.

### Missões
Cada projeto tem missões coerentes com a fase em que está: as das fases anteriores já feitas, as da fase atual em andamento e as próximas na fila. Cada missão fica com o especialista do papel certo.
Exemplos do piloto de postos: entrevistas em quatro unidades com Lia, feita; jornada da pista ao caixa com Rosa, feita; roteiro de abordagem do frentista com Beto, em andamento; checklist de turno no celular com Max, em andamento; o que medir antes de escalar com Lara, em andamento; material de treino do turno da noite com Theo, na fila; custo de levar o piloto para mais unidades com Otto, na fila; aprendizados da semana com Nico, na fila.
O lab também tem missões internas, sem projeto: tom de voz dos posts com Iara, post da semana com Theo, agente de briefing com Ana, proposta para a marca em conversa com Bela, retorno ao contato da marca com Caio.

### Reuniões e decisões
- Kickoff de cada projeto no dia em que começou, com ata e uma decisão.
- Ritual semanal de cada projeto em andamento, as passadas com ata e as próximas marcadas.
- Uma conversa de briefing com a marca em conversa, marcada para esta semana.
- Toda decisão aponta para a reunião de onde saiu.

### Memória e instruções
- Uma ou duas notas por especialista que já trabalhou em projeto, escritas como aprendizado de campo, sem número.
- Instruções para Clara, Rui e Lia, no tom da V30.

## Ordem de trabalho

1. #26 Corrigir os defeitos da auditoria.
2. #27 Fechar o acesso antes de publicar.
3. #30 Dados consistentes com datas relativas, e #29 ciclo do projeto andando sozinho.
4. #28 Cliente e projeto pela interface, com o briefing da Clara gerando o cadastro.
5. #31 Cadeiras e estações de trabalho.
6. #32 Personagens novos.
7. #33 Ficha com a pessoa na estação.
8. #34 Vocabulário e textos.
9. #35 Publicação: PR para a main, segredo da chave e primeiro deploy.
10. #36 Pendências visuais.
11. #37 Editar e apagar reunião e decisão.

## Andamento depois da auditoria

| Issue | Situação | Branch |
|---|---|---|
| #26 Defeitos da auditoria | Feito | feature/defeitos-auditoria |
| #27 Acesso fechado | Código feito; falta ligar o Cloudflare Access no painel, passo a passo em docs/publicar.md | feature/acesso |
| #28 Cliente e projeto pela interface | Feito | feature/cadastro |
| #29 Ciclo do projeto | Feito | feature/dados-consistentes |
| #30 Dados consistentes | Feito | feature/dados-consistentes |
| #31 Cadeiras e estações | Mesa na altura de quem senta e cadeira giratória em cada estação; quem trabalha aparece sentado digitando, com a cadeira no próprio quadro | feature/personagens |
| #32 Personagens novos | 23 pessoas feitas no MPFB com roupas, cabelos e sapatos CC0; animação da Universal Animation Library adaptada osso a osso; render na mesma câmera e luz do lab | feature/personagens |
| #33 Ficha na estação | Página da esquerda da ficha mostra a pessoa trabalhando na própria mesa, na cor da sala; rostos refeitos em 256 px | feature/personagens |
| #34 Vocabulário | Feito | feature/vocabulario |
| #35 Publicação | Com o sócio: Access, chave e pull request | |
| #36 Pendências visuais | Feito; balanço das árvores de fora confirmado no navegador | feature/pendencias-visuais |
| #37 Corrigir reunião e decisão | Feito | feature/corrige-reuniao |
| #38 Postura dos personagens (issue 15 no GitHub) | Corcunda corrigida: o tronco mantém a curva do próprio modelo, parado parte do repouso ereto com os braços soltos, andando com a cabeça nivelada e sentado ereto com os cotovelos junto do corpo | feature/postura |
| #39 Auditoria de UX e design (issue 17 no GitHub) | Diário sozinho na tela, console enxuto sem pessoa escolhida, link para todas as missões, resumos úteis na página da esquerda, ficha sem repetição e com retrato no celular, fases em cores calmas, troféus como medalhas com o próximo em destaque, conexões com o passo exato do que falta | feature/ux-polimento |

Defeito achado no caminho: o Worker não sobe quando o módulo principal exporta uma constante solta. Corrigido na própria branch da #27.
Testes automatizados: 52 passando.

## Superauditoria de 14 de novembro

Quatro auditorias em paralelo (funcional, design e UX, motion, arquitetura) e três frentes de correção, cada uma com issue e branch própria.

- Núcleo multiagente e multi-IA (issue 21, PR 24): equipe, skills e pedidos no banco, três provedores, execução de missão com entrega, pedido ao lab com plano, aprovação e síntese. Revisão independente aplicada: trava de execução, pedido atômico, resposta cortada avisada, teto de skills.
- Mapa e motion (issue 22, PR 25): passo no ritmo do chão, zoom ancorado, inércia, anel de quem está escolhido, balão de quem escreve, papel da distribuição, nome das salas.
- Acabamento de interface (issue 23, PR 26): 32 itens entre defeitos, contraste, tipografia, botões, livro, laptop e celular.
- Junção (PR 27): as três frentes num ramo, 103 testes, passeio completo em 1440, 1280 e 390 no Worker local com IA simulada.

Ainda sem teste: chamada real aos provedores, e inércia e pinça num aparelho de verdade.
Para decidir: peso 600 da Alegreya Sans não existe no Google Fonts, 409 ao remarcar reunião que já aconteceu, Escape em dois tempos fora do livro.
