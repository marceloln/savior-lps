# PRODUCT.md — Savior Platform (plataforma operacional)

register: product

## O que é
Plataforma operacional interna da Savior Medical Service. Substitui Blip + Pipedrive + planilhas por uma interface unificada de despacho de ambulâncias, gestão de frota e atendimento. Protótipo inicial para validação com o diretor (Rodrigo).

## Usuários
- **Supervisor de central** (desktop, escritório, 8-12h por dia): monitora chamados, despacha VTRs, acompanha mapa em tempo real
- **Gestor de frota** (desktop, oficina/escritório): gerencia manutenções, checklists, pneus, documentos de veículos
- **Diretor** (desktop/mobile, reuniões): visão geral de KPIs, custos, status da operação
- **Atendente** (desktop, central telefônica): recebe chamados por WhatsApp/telefone, qualifica, encaminha

## Cena física
Supervisor numa sala de operações com 2 monitores, iluminação fluorescente, rádio ao fundo. Precisa ver mapa + lista de chamados ao mesmo tempo. Informação rápida, sem decoração.

## Voz e tom
Funcional, limpo, zero adjetivo. Dados falam. Labels curtos. Status por cor + ícone, nunca só texto.

## Anti-referências
- Dashboards SaaS com hero-metrics e gradientes (Stripe-wannabe)
- Painéis de controle com azul corporativo genérico
- Apps de delivery coloridos (iFood, Uber) — somos médicos, não entregas
- Admin templates Bootstrap/Material com cara de 2018

## Referências visuais (tom)
- Linear (densidade de informação limpa, tipografia forte)
- Vercel dashboard (dark, espaçado, mono para dados)
- Raycast (contraste, hierarquia clara, sem excessos)

## Princípios estratégicos
1. Densidade sem ruído: muita informação, pouca decoração
2. Status visível em 1 segundo: cor + badge + posição no mapa
3. Zero clique desnecessário: ação principal sempre acessível
4. Light warm gray: contraste legivel em ambiente hospitalar bem iluminado
5. Dados reais vencem: mostrar placa, km, equipe — nunca lorem ipsum
