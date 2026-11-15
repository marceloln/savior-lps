# Convidados e reforço da equipe

O lab tem dezessete especialistas de partida. Esta página registra o que entrou depois: uma skill de ofício para cada um deles e um banco de trinta e sete convidados que os sócios chamam quando o projeto pede.

## De onde veio

O ponto de partida foi o repositório aberto [agency-agents](https://github.com/msitarzewski/agency-agents), de AgentLand Contributors, com licença MIT. Ele reúne 283 agentes em inglês. Lemos na versão `8ae6164`, de 8 de novembro de 2026.

Nada entrou como está. Cada método foi reescrito em português, no contexto brasileiro, com três cortes.

- Saíram os números de resultado prontos. A casa não inventa métrica.
- Saiu o que só vale fora do Brasil: plataformas, leis e formulários de outros países. Onde havia regra local, entrou a referência daqui e o aviso de conferir com quem responde pelo tema.
- Saíram tom de startup e emoji. O texto segue a regra da casa: sem travessão, sem aspas, fácil de falar.

Ficaram de fora os agentes que não têm a ver com o trabalho da V30, como jogos, mapas técnicos, plataformas de outros países e segurança ofensiva.

## Como funciona no lab

- **Reforço.** As dezoito skills de ofício moram em `src/lib/skills.ts` e já chegam ligadas a quem faz aquele trabalho.
- **Banco.** Os convidados moram em `src/lib/convidados.json`. Ficam fora do mapa até um sócio chamar pela tela de pessoas. Chamado, o convidado entra na equipe com um dos seis bonecos sem dono e com a skill do método dele. Dispensado, volta para o banco e guarda memória, instruções e skill.
- **Biblioteca.** O método de cada convidado também fica na biblioteca de skills desde o começo, sem dono. Dá para treinar alguém da equipe nele sem chamar o convidado.
- **Banco de dados que já está no ar.** A semente tem versão. Quem está na versão anterior recebe só as skills novas, sem mexer no que os sócios editaram ou apagaram.

## Reforço da equipe de partida

| Quem | Skill | Ponto de partida no agency-agents |
|---|---|---|
| Lia | Síntese de entrevistas | `product/product-feedback-synthesizer.md`, `research/research-synthesist.md` |
| Davi | Leitura de mercado e concorrência | `product/product-trend-researcher.md` |
| Rui | Condução de projeto | `project-management/project-management-project-shepherd.md` |
| Nina | Desenho de fluxo de trabalho | `specialized/specialized-workflow-architect.md` |
| Caio | Descoberta em vendas | `sales/sales-discovery-coach.md` |
| Bela | Estratégia de proposta | `sales/sales-proposal-strategist.md` |
| Iara | Guarda da marca | `design/design-brand-guardian.md` |
| Theo | Conteúdo para LinkedIn | `marketing/marketing-linkedin-content-creator.md` |
| Duda | Divisão de pedido em missões | `specialized/agents-orchestrator.md` |
| Rosa | Pesquisa com usuário | `design/design-ux-researcher.md` |
| Beto | Rotina de operação de loja | `specialized/operations-manager.md` |
| Lara | Painel e relato de dados | `support/support-analytics-reporter.md` |
| Otto | Precificação | `specialized/specialized-pricing-analyst.md` |
| Otto | Caso de negócio | `finance/finance-financial-analyst.md` |
| Max | Protótipo rápido | `engineering/engineering-rapid-prototyper.md` |
| Ana | Desenho de agente de IA | `engineering/engineering-prompt-engineer.md`, `engineering/engineering-multi-agent-systems-architect.md` |
| Nico | Registro de reunião e de conhecimento | `project-management/project-management-meeting-notes-specialist.md`, `specialized/zk-steward.md` |
| Clara | Triagem de entrada | `specialized/legal-client-intake.md` |

## Banco de convidados

### Pessoas e cultura

| Nome | Papel | Quando chamar | Ponto de partida no agency-agents |
|---|---|---|---|
| Helena | Gestão da mudança | Quando a solução está pronta e o risco é ninguém usar. | `specialized/change-management-consultant.md` |
| Cecília | Psicologia organizacional | Quando o problema parece ser de pessoas e ninguém sabe nomear o que é. | `specialized/organizational-psychologist.md` |
| Dora | Desenho de treinamento | Quando o time precisa aprender um jeito novo de trabalhar e curso de slide não resolve. | `specialized/corporate-training-designer.md` |
| Ivo | Recrutamento e integração | Quando a rotatividade está comendo a operação e cada vaga demora a fechar. | `specialized/recruitment-specialist.md`, `specialized/hr-onboarding.md` |

### Operação e rede

| Nome | Papel | Quando chamar | Ponto de partida no agency-agents |
|---|---|---|---|
| Raul | Cadeia de suprimentos | Quando falta produto na ponta, sobra no estoque ou o fornecedor manda no jogo. | `specialized/supply-chain-strategist.md` |
| Saulo | Integração de unidades | Quando a rede compra, abre ou converte unidades e precisa fazê-las operar do mesmo jeito. | `specialized/ma-integration-manager.md` |
| Marta | Hospitalidade e atendimento | Quando o atendimento na loja ou na pista depende de quem está no turno. | `specialized/customer-service.md`, `specialized/hospitality-guest-services.md` |
| Paulo | Central de atendimento | Quando o SAC, o WhatsApp ou a central viram fila e o cliente precisa repetir a história. | `support/support-support-responder.md` |
| Vítor | Geografia da rede | Quando a decisão depende de lugar: onde abrir, onde fechar, que praça priorizar. | `academic/academic-geographer.md` |

### Vendas e receita

| Nome | Papel | Quando chamar | Ponto de partida no agency-agents |
|---|---|---|---|
| Alice | Sucesso do cliente | Quando o contrato fecha e a preocupação passa a ser o cliente ficar e crescer. | `specialized/customer-success-manager.md` |
| Regina | Estratégia de contas | Quando poucos clientes grandes respondem por muito e cada um está na mão de uma pessoa só. | `sales/sales-account-strategist.md` |
| Enzo | Prospecção ativa | Quando o funil depende de indicação e é preciso abrir conversa com quem ainda não conhece a empresa. | `sales/sales-outbound-strategist.md` |
| Gil | Leitura de funil | Quando a previsão de vendas erra todo mês e ninguém sabe dizer em que etapa o negócio para. | `sales/sales-pipeline-analyst.md` |
| Tereza | Treino de vendedores | Quando o resultado de vendas depende de dois ou três e o resto do time não evolui. | `sales/sales-coach.md` |
| Mário | Negociação de grandes contas | Quando um negócio grande e demorado está em jogo e ninguém sabe dizer se vai fechar. | `sales/sales-deal-strategist.md` |

### Marketing e conteúdo

| Nome | Papel | Quando chamar | Ponto de partida no agency-agents |
|---|---|---|---|
| Sofia | Busca orgânica | Quando o site existe e ninguém chega nele pela busca. | `marketing/marketing-seo-specialist.md` |
| Renan | Mídia paga | Quando há verba para anúncio e é preciso saber onde pôr e como medir. | `paid-media/paid-media-ppc-strategist.md`, `paid-media/paid-media-paid-social-strategist.md` |
| Irene | E-mail e relacionamento | Quando existe base de contatos e a empresa só fala com ela para vender. | `marketing/marketing-email-strategist.md` |
| Júlia | Redes sociais | Quando a marca posta todo dia e não sabe dizer para quê. | `marketing/marketing-social-media-strategist.md` |
| Murilo | Imprensa e reputação | Quando a empresa precisa aparecer na imprensa pelo motivo certo ou se preparar para o errado. | `marketing/marketing-pr-communications-manager.md` |

### Dados e finanças

| Nome | Papel | Quando chamar | Ponto de partida no agency-agents |
|---|---|---|---|
| Tomé | Economia comportamental | Quando o time sabe o que fazer e mesmo assim não faz, ou o incentivo puxa para o lado errado. | `product/product-behavioral-nudge-engine.md` |
| Inês | Pilotos e experimentos | Quando a ideia precisa ser testada em poucas unidades antes de virar regra. | `project-management/project-management-experiment-tracker.md` |
| Sílvia | Estatística | Quando uma conclusão importante depende de saber se a diferença é real ou acaso. | `academic/academic-statistician.md` |
| Fábio | Planejamento financeiro | Quando o orçamento é feito uma vez por ano e ninguém explica por que o realizado saiu diferente. | `finance/finance-fpa-analyst.md` |
| Olga | Controladoria | Quando o fechamento atrasa, os números não batem entre sistemas ou cada unidade faz de um jeito. | `finance/finance-bookkeeper-controller.md` |

### Risco e conformidade

| Nome | Papel | Quando chamar | Ponto de partida no agency-agents |
|---|---|---|---|
| Jorge | Privacidade e LGPD | Quando o projeto mexe com dado de cliente ou de funcionário e ninguém olhou a LGPD. | `specialized/data-privacy-officer.md`, `support/support-legal-compliance-checker.md` |
| Hugo | Checagem de realidade | Antes de uma entrega ir para o cliente, quando alguém precisa fazer o papel de cético. | `testing/testing-reality-checker.md` |
| Elisa | Governança de automação e IA | Quando as automações e os agentes de IA se multiplicam e ninguém sabe dizer quem cuida de cada um. | `specialized/automation-governance-architect.md` |
| Marina | ESG e sustentabilidade | Quando cliente, investidor ou edital pede ESG e a empresa não sabe por onde começar. | `specialized/esg-sustainability-officer.md` |

### Produto e tecnologia

| Nome | Papel | Quando chamar | Ponto de partida no agency-agents |
|---|---|---|---|
| Carla | Gestão de produto | Quando há um produto digital para construir e muita ideia disputando pouco tempo. | `product/product-manager.md` |
| Igor | Arquitetura de software | Quando uma decisão técnica de hoje vai custar caro para mudar depois. | `engineering/engineering-software-architect.md` |
| Samuel | Engenharia de dados | Quando o painel depende de planilha exportada à mão e cada sistema conta uma verdade. | `engineering/engineering-data-engineer.md` |
| Aline | Acessibilidade | Quando o site ou o aplicativo precisa funcionar para todo mundo, inclusive para quem usa leitor de tela. | `testing/testing-accessibility-auditor.md` |
| Bruno | Desenho de interface | Quando o produto funciona e ninguém consegue usar sem ajuda. | `design/design-ui-designer.md`, `design/design-ux-architect.md` |

### Estratégia e gestão

| Nome | Papel | Quando chamar | Ponto de partida no agency-agents |
|---|---|---|---|
| Joana | Etnografia de campo | Quando é preciso entender o que acontece de verdade na loja antes de propor mudança. | `academic/academic-anthropologist.md` |
| Abel | Estratégia de negócio | Quando a decisão é grande: entrar num mercado, mudar o modelo, escolher onde crescer. | `specialized/business-strategist.md` |
| Glória | Gabinete da diretoria | Quando a diretoria se reúne muito, decide pouco e ninguém acompanha o que foi combinado. | `specialized/specialized-chief-of-staff.md` |

## Para pôr mais um convidado

1. Acrescente a entrada em `src/lib/convidados.json`, com função, sala, três bonecos em ordem de preferência, quando chamar, frase, manias, origem e o método em quatro partes: quando entra, como trabalha, o que entrega e cuidados.
2. Rode `npm test`. O teste confere nome repetido, sala, boneco, tamanho do texto e a regra de escrita.
3. Se o banco de dados já está no ar e a skill precisa aparecer na biblioteca de todos, suba `VERSAO_DA_BASE` em `src/lib/skills.ts` e ajuste a leva.

## O que ainda não tem

- Mural e objetos próprios na mesa do convidado. Ele usa a cena do boneco.
- Mais de seis bonecos. Com mais de três mulheres ou três homens convidados ao mesmo tempo, o boneco se repete no mapa.
- Vínculo do convidado com um projeto. Ele entra na equipe e recebe missão de qualquer pedido.

## Licença do material de origem

```
MIT License

Copyright (c) 2025 AgentLand Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
