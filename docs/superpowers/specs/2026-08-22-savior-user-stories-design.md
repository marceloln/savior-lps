# Savior Platform — User Stories Design Spec

## Personas

### 1. Solicitante (quem precisa da ambulância)
Canal: WhatsApp + telefone + site. Mobile, sob estresse.

### 2. Atendente da central (Claudia/Gabrielly)
Desktop, escritório, 8-12h por dia. Monitora chamados, despacha VTRs.

### 3. Equipe da ambulância (motorista + enfermeiro + médico)
Mobile/tablet dentro da ambulância. Recebe missões, faz checklists, preenche fichas.

---

## Histórias priorizadas pro protótipo

### Atendente (core)
- **A1**: Lista de chamados priorizada com status, tempo de espera, canal
- **A2**: Chat WhatsApp integrado na plataforma (Meta Cloud API)
- **A3**: Qualificação do chamado (tipo, origem, destino, paciente)
- **A4**: Mapa com VTRs disponíveis, escolher a mais próxima
- **A5**: Despachar ambulância com um clique, notificar motorista
- **A7**: Dashboard com KPIs do dia

### Equipe da ambulância
- **E1**: Receber missão com endereço e rota
- **E2**: Checklist do veículo no início do plantão
- **E6**: Confirmar chegada na origem e destino

### Solicitante
- **S4**: Receber orçamento com valor, tipo e ETA
- **S6**: Acompanhar ambulância em tempo real

---

## Interfaces derivadas

### Tela 1: Central de Atendimento (A1 + A2 + A3)
Layout master-detail: lista de chamados à esquerda (agrupados por status), detalhe + chat à direita. Chamado selecionado mostra conversa WhatsApp + formulário de qualificação + ações.

### Tela 2: Mapa de Despacho (A4 + A5)
Mapa full-screen com VTRs. Ao selecionar um chamado, mostra origem/destino no mapa. Ao clicar numa VTR, mostra ETA e botão "Despachar".

### Tela 3: Dashboard Operacional (A7)
KPIs: chamados hoje, em andamento, concluídos, tempo médio. Chamados recentes. Status da frota.

### Tela 4: Frota — lista + detalhe (dados reais SofitView)
88 veículos reais com placa, modelo, status. Detalhe com manutenções, docs.

### Tela 5: App Equipe — missão recebida (E1 + E6)
Tela mobile: dados do chamado, endereço, botão Waze, botões de status (cheguei na origem / saí / cheguei no destino).

### Tela 6: App Equipe — checklist (E2)
Fluxo guiado: itens de verificação agrupados, fotos, assinatura.

### Tela 7: Tracking público (S6)
Página pública (sem login): mapa com posição da VTR, ETA, dados do chamado.

---

## Dados reais disponíveis

- 88 veículos ativos do SofitView (Renault Master, Mercedes Sprinter, motos)
- 45 funcionários ativos (43 motoristas)
- Status real: 41 em uso, 39 disponíveis, 8 em manutenção
