# Convidados e reforço da equipe

O lab tem dezessete especialistas de partida e um banco de sessenta e oito convidados que os sócios chamam quando o projeto pede uma competência que a equipe não cobre. Esta página registra de onde veio cada um.

## De onde veio

O ponto de partida foi o repositório aberto [agency-agents](https://github.com/msitarzewski/agency-agents), de AgentLand Contributors, com licença MIT. Em 16 de novembro de 2026 lemos os 299 arquivos dele, um a um. Entraram 193, por encaixe: reforço da equipe de partida, origem de um convidado que já existia ou convidado novo. Ficaram de fora 106, com o motivo registrado: jogos, mercado chinês, blockchain, saúde clínica, leis de outros países e nichos sem uso provável na V30.

Nada entrou como está. Cada método foi reescrito em português, no contexto de posto, distribuidora, loja de conveniência e varejo físico, com o conteúdo inteiro da original: missão, regras, fluxo, entregáveis, capacidades avançadas, modo de comunicar, o que o especialista aprende e como saber que ficou bom. Três cortes valem para tudo.

- Saíram os números de resultado prontos. A casa não inventa métrica: meta vira critério a combinar com o cliente.
- Saiu o nome de pessoa real e de empresa. Método famoso entra descrito pelo que faz.
- Saiu o que só vale fora do Brasil. Onde havia regra local, entrou o cuidado de conferir com quem responde pelo tema, sem citar artigo de lei.

## Como funciona no lab

- Cada skill tem dez seções fixas: Missão, Quando entra, Regras que não se quebram, Como trabalha, O que entrega, Capacidades avançadas, Como comunica, O que aprende e guarda, Como saber que ficou bom e Cuidados. Entre 1.100 e 1.650 palavras.
- Cada especialista tem perfil: identidade, tom de voz, o que domina, o que não quebra e o que guarda de um projeto para o outro. O perfil entra em toda conversa com a pessoa e aparece na aba Perfil da ficha. O da equipe fixa está em `src/lib/perfis.json`; o do convidado, junto dele em `src/lib/convidados.json`.
- O texto das skills de base mora em `src/lib/conteudos.json`. A primeira tela carrega só nome e descrição; o Worker usa o texto completo.
- Banco que já estava no ar recebe o conteúdo novo na versão 3 da semente. Skill que os sócios editaram fica como estava.

## Reforço da equipe de partida

| Skill | Para quem | Origem |
|---|---|---|
| Agentes em produção | Ana | `specialized/specialized-mcp-builder.md`, `engineering/engineering-voice-ai-integration-engineer.md`, `engineering/engineering-autonomous-optimization-architect.md`, `engineering/engineering-email-intelligence-engineer.md` |
| Busca e base de conhecimento | Ana | `engineering/engineering-rag-pipeline-engineer.md`, `engineering/engineering-search-relevance-engineer.md`, `engineering/engineering-knowledge-graph-engineer.md` |
| Caso de negócio | Otto | `finance/finance-financial-analyst.md`, `specialized/chief-financial-officer.md` |
| Condução de projeto | Rui | `project-management/project-management-project-shepherd.md`, `project-management/project-manager-senior.md`, `project-management/project-management-studio-producer.md`, `product/product-sprint-prioritizer.md` |
| Consolidação de dados | Lara | `specialized/data-consolidation-agent.md`, `specialized/sales-data-extraction-agent.md`, `specialized/specialized-model-qa.md` |
| Conteúdo para LinkedIn | Theo | `marketing/marketing-linkedin-content-creator.md`, `marketing/marketing-content-creator.md` |
| Coordenação e passagem de bastão | Duda, Rui | `strategy/coordination/handoff-templates.md`, `strategy/nexus-strategy.md`, `strategy/playbooks/phase-0-discovery.md`, `strategy/playbooks/phase-3-build.md` |
| Cuidado com o código | Max | `engineering/engineering-code-reviewer.md`, `engineering/engineering-minimal-change-engineer.md`, `engineering/engineering-git-workflow-master.md`, `specialized/specialized-codebase-archaeologist.md` |
| Descoberta em vendas | Caio | `sales/sales-discovery-coach.md` |
| Desenho de agente de IA | Ana | `engineering/engineering-prompt-engineer.md`, `engineering/engineering-multi-agent-systems-architect.md`, `engineering/engineering-ai-engineer.md` |
| Desenho de fluxo de trabalho | Nina | `specialized/specialized-workflow-architect.md`, `testing/testing-workflow-optimizer.md`, `project-management/project-management-studio-operations.md` |
| Direção de imagem | Iara | `design/design-image-prompt-engineer.md`, `design/design-visual-storyteller.md`, `design/design-inclusive-visuals-specialist.md` |
| Divisão de pedido em missões | Duda | `specialized/agents-orchestrator.md`, `strategy/coordination/agent-activation-prompts.md`, `strategy/QUICKSTART.md` |
| Documentação técnica | Max, Nico | `engineering/engineering-technical-writer.md`, `engineering/engineering-codebase-onboarding-engineer.md` |
| Estratégia de proposta | Bela | `sales/sales-proposal-strategist.md` |
| Guarda da marca | Iara | `design/design-brand-guardian.md` |
| Leitura de mercado e concorrência | Davi | `product/product-trend-researcher.md`, `marketing/marketing-x-twitter-intelligence-analyst.md`, `specialized/specialized-strategy-duel-agent.md` |
| Narrativa e texto longo | Theo | `marketing/marketing-book-co-author.md`, `academic/academic-narratologist.md` |
| Painel e relato de dados | Lara | `support/support-analytics-reporter.md`, `engineering/engineering-data-visualization-engineer.md` |
| Passeio de persona | Rosa | `design/design-persona-walkthrough.md` |
| Pesquisa com usuário | Rosa, Lia | `design/design-ux-researcher.md` |
| Precificação | Otto | `specialized/specialized-pricing-analyst.md` |
| Protótipo rápido | Max | `engineering/engineering-rapid-prototyper.md`, `engineering/engineering-frontend-developer.md` |
| Registro de reunião e de conhecimento | Nico | `project-management/project-management-meeting-notes-specialist.md`, `specialized/zk-steward.md` |
| Resumo executivo | Lia, Bela | `support/support-executive-summary-generator.md` |
| Rotina de operação de loja | Beto | `specialized/operations-manager.md` |
| Síntese de entrevistas | Lia | `product/product-feedback-synthesizer.md`, `research/research-synthesist.md` |
| Triagem de entrada | Clara | `specialized/legal-client-intake.md` |

## Banco de convidados

### Pessoas e cultura

| Nome | Papel | Origem |
|---|---|---|
| Helena | Gestão da mudança | `specialized/change-management-consultant.md` |
| Cecília | Psicologia organizacional | `specialized/organizational-psychologist.md`, `academic/academic-psychologist.md` |
| Dora | Desenho de treinamento | `specialized/corporate-training-designer.md` |
| Ivo | Recrutamento e integração | `specialized/recruitment-specialist.md`, `specialized/hr-onboarding.md` |
| Lúcia | Mentoria de líderes | `specialized/personal-growth-mentor.md` |

### Operação e rede

| Nome | Papel | Origem |
|---|---|---|
| Raul | Cadeia de suprimentos | `specialized/supply-chain-strategist.md` |
| Saulo | Integração de unidades | `specialized/ma-integration-manager.md` |
| Marta | Hospitalidade e atendimento | `specialized/customer-service.md`, `specialized/hospitality-guest-services.md` |
| Paulo | Central de atendimento | `support/support-support-responder.md` |
| Vítor | Geografia da rede | `academic/academic-geographer.md`, `gis/gis-analyst.md`, `gis/gis-spatial-data-scientist.md` |
| Edu | Suporte interno e chamados | `engineering/engineering-it-service-manager.md` |
| Sandra | Trocas e devoluções | `specialized/retail-customer-returns.md` |

### Vendas e receita

| Nome | Papel | Origem |
|---|---|---|
| Alice | Sucesso do cliente | `specialized/customer-success-manager.md` |
| Regina | Estratégia de contas | `sales/sales-account-strategist.md` |
| Enzo | Prospecção ativa | `sales/sales-outbound-strategist.md`, `specialized/sales-outreach.md` |
| Gil | Leitura de funil | `sales/sales-pipeline-analyst.md` |
| Tereza | Treino de vendedores | `sales/sales-coach.md` |
| Mário | Negociação de grandes contas | `sales/sales-deal-strategist.md` |
| Bianca | Oferta e geração de demanda | `sales/sales-offer-lead-gen-strategist.md`, `marketing/marketing-growth-hacker.md` |
| Léo | Pré-venda técnica e demonstração | `sales/sales-engineer.md` |
| Tiago | Programas de pontos e incentivo | `game-development/economy-designer.md`, `game-development/game-designer.md` |

### Marketing e conteúdo

| Nome | Papel | Origem |
|---|---|---|
| Sofia | Busca orgânica | `marketing/marketing-seo-specialist.md`, `marketing/marketing-app-store-optimizer.md` |
| Renan | Mídia paga | `paid-media/paid-media-ppc-strategist.md`, `paid-media/paid-media-paid-social-strategist.md`, `paid-media/paid-media-search-query-analyst.md` |
| Irene | E-mail e relacionamento | `marketing/marketing-email-strategist.md` |
| Júlia | Redes sociais | `marketing/marketing-social-media-strategist.md`, `marketing/marketing-instagram-curator.md`, `marketing/marketing-carousel-growth-engine.md` |
| Murilo | Imprensa e reputação | `marketing/marketing-pr-communications-manager.md` |
| Caetano | Presença em assistentes de IA | `marketing/marketing-ai-citation-strategist.md`, `marketing/marketing-aeo-foundations.md` |
| Chico | Podcast | `marketing/marketing-global-podcast-strategist.md` |
| Dani | Relacionamento por WhatsApp | `marketing/marketing-private-domain-operator.md` |
| Heitor | Medição e auditoria de mídia | `paid-media/paid-media-tracking-specialist.md`, `paid-media/paid-media-auditor.md` |
| Lívia | Criativo e mídia programática | `paid-media/paid-media-creative-strategist.md`, `paid-media/paid-media-programmatic-buyer.md` |
| Mel | Vídeo para redes | `marketing/marketing-tiktok-strategist.md`, `marketing/marketing-video-optimization-specialist.md`, `marketing/marketing-short-video-editing-coach.md` |
| Yara | Tradução e adaptação cultural | `specialized/language-translator.md`, `specialized/specialized-cultural-intelligence-strategist.md` |

### Dados e finanças

| Nome | Papel | Origem |
|---|---|---|
| Tomé | Economia comportamental | `product/product-behavioral-nudge-engine.md` |
| Inês | Pilotos e experimentos | `project-management/project-management-experiment-tracker.md` |
| Sílvia | Estatística | `academic/academic-statistician.md` |
| Fábio | Planejamento financeiro | `finance/finance-fpa-analyst.md`, `support/support-finance-tracker.md`, `specialized/chief-financial-officer.md` |
| Olga | Controladoria | `finance/finance-bookkeeper-controller.md`, `specialized/accounts-payable-agent.md`, `specialized/legal-billing-time-tracking.md` |
| Nádia | Dados geográficos | `gis/gis-spatial-data-engineer.md`, `gis/gis-qa-engineer.md`, `gis/gis-technical-consultant.md` |
| Zeca | Relatórios e documentos | `specialized/report-distribution-agent.md`, `specialized/specialized-document-generator.md`, `engineering/engineering-pdf-engine-architect.md`, `engineering/engineering-universal-document-compiler.md` |

### Risco e conformidade

| Nome | Papel | Origem |
|---|---|---|
| Jorge | Privacidade e LGPD | `specialized/data-privacy-officer.md`, `engineering/engineering-privacy-engineer.md`, `support/support-legal-compliance-checker.md` |
| Hugo | Checagem de realidade | `testing/testing-reality-checker.md`, `testing/testing-evidence-collector.md`, `strategy/playbooks/phase-4-hardening.md` |
| Elisa | Governança de automação e IA | `specialized/automation-governance-architect.md`, `specialized/agentic-identity-trust.md`, `engineering/engineering-autonomous-optimization-architect.md` |
| Marina | ESG e sustentabilidade | `specialized/esg-sustainability-officer.md` |
| Estela | Auditoria de conformidade | `security/security-compliance-auditor.md` |
| Jonas | Operação de segurança e resposta a invasão | `security/security-senior-secops.md`, `security/security-incident-responder.md`, `security/security-penetration-tester.md` |
| Laura | Revisão de contratos | `specialized/legal-document-review.md` |
| Rita | Acessos, chaves e segredos | `engineering/engineering-identity-access-engineer.md`, `security/security-secrets-credential-engineer.md`, `security/security-cloud-security-architect.md` |
| Ícaro | Segurança de aplicações | `security/security-appsec-engineer.md`, `security/security-ai-generated-code-auditor.md`, `security/security-architect.md` |

### Produto e tecnologia

| Nome | Papel | Origem |
|---|---|---|
| Carla | Gestão de produto | `product/product-manager.md`, `product/product-sprint-prioritizer.md` |
| Igor | Arquitetura de software | `engineering/engineering-software-architect.md`, `engineering/engineering-backend-architect.md`, `specialized/specialized-master-plan-architect.md` |
| Samuel | Engenharia de dados | `engineering/engineering-data-engineer.md`, `engineering/engineering-database-optimizer.md`, `engineering/engineering-ai-data-remediation-engineer.md` |
| Aline | Acessibilidade | `testing/testing-accessibility-auditor.md`, `engineering/engineering-section-508-specialist.md` |
| Bruno | Desenho de interface | `design/design-ui-designer.md`, `design/design-ui-finish-gate-reviewer.md`, `design/design-whimsy-injector.md` |
| Artur | Testes de software | `testing/testing-test-automation-engineer.md`, `testing/testing-performance-benchmarker.md`, `testing/testing-test-results-analyzer.md` |
| Cora | Arquitetura de experiência | `design/design-ux-architect.md` |
| Dênis | Publicação e operação de sistemas | `engineering/engineering-devops-automator.md`, `engineering/engineering-sre.md`, `support/support-infrastructure-maintainer.md` |
| Flora | Confiabilidade e incidentes | `engineering/engineering-incident-response-commander.md`, `engineering/engineering-database-reliability-engineer.md` |
| Guto | Escolha de ferramentas e fornecedores | `testing/testing-tool-evaluator.md` |
| Hélio | Meios de pagamento e conciliação | `engineering/engineering-payments-billing-engineer.md` |
| Luna | Aplicativos de celular | `engineering/engineering-mobile-app-builder.md`, `engineering/engineering-mobile-release-engineer.md` |
| Nara | Site e loja virtual | `engineering/engineering-cms-developer.md`, `engineering/engineering-wordpress-performance.md`, `engineering/engineering-wordpress-shopping-cart.md` |
| Paula | Integração de sistemas | `engineering/engineering-api-platform-engineer.md`, `testing/testing-api-tester.md` |
| Ravi | Mapas interativos | `gis/gis-web-gis-developer.md`, `gis/gis-cartography-designer.md`, `gis/gis-solution-engineer.md` |
| Válter | Arquitetura de CRM | `specialized/specialized-salesforce-architect.md` |

### Estratégia e gestão

| Nome | Papel | Origem |
|---|---|---|
| Joana | Etnografia de campo | `academic/academic-anthropologist.md` |
| Abel | Estratégia de negócio | `specialized/business-strategist.md` |
| Glória | Gabinete da diretoria | `specialized/specialized-chief-of-staff.md`, `strategy/EXECUTIVE-BRIEF.md`, `strategy/playbooks/phase-6-operate.md` |

## Para pôr mais um convidado

O roteiro da curadoria, o contrato de formato e o validador usados nesta rodada ficam descritos na issue 49. Convidado novo entra em `src/lib/convidados.json` com perfil e em `src/lib/conteudos.json` com o texto, e a versão da semente sobe um número.

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
