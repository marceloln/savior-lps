# Design system e pixel perfect do Lab V30: plano de implementação

> **Para quem executar:** use superpowers:executing-plans, tarefa por tarefa. Os passos usam caixas de marcar.

**Objetivo:** fechar o sistema visual do lab em poucos degraus nomeados e fazer todas as telas usarem só esses degraus, sem mudar a cara aprovada.

**Arquitetura:** a folha única `src/estilo.css` vira uma pasta `src/estilo/` com os degraus em `tokens.css` e o resto dividido em ordem, para a cascata não mudar. Depois os valores soltos são trocados pelos degraus. Fotos por elemento, tiradas antes, provam que a divisão não mexeu em nenhum pixel e mostram o que cada troca mudou.

**Stack:** React 18, Vite, CSS puro com variáveis, PixiJS no mapa, Playwright e Pillow só como ferramenta de conferência.

**Spec:** `docs/superpowers/specs/2026-11-14-backlog-lab-v30-design.md`

## Restrições gerais

- Fonte, paleta e a ideia do diário de campo não mudam
- Letra: 12, 13, 14, 16, 18, 22 e 28
- Peso: 400 no corpo, 500 em destaque leve, 700 em rótulo e ação, 800 só em título Alegreya
- Altura de controle: 32, 40 e 48 no computador; 44 no mínimo no celular
- Raio: 4, 8, 12, 18 e pílula
- Tempo: 140 ms, 200 ms e 300 ms, com a curva `--sai`
- Texto de interface em português, sem travessão e sem aspas
- Movimento reduzido respeitado em toda animação

## Foco da revisão

- Texto que cresce de 15 para 16 e passa a quebrar ou cortar em botão estreito e no menu do celular
- Raio menor em elemento com filho arredondado, que deixa quina aparecendo
- Regra dividida em arquivo errado e a cascata muda sem ninguém ver: a foto antes e depois tem de dar diferença zero
- Controle que fica mais alto e empurra o console ou a coluna de missões para fora em 1280 por 720
- Alvo de toque corrigido no celular que desalinha o cartão no computador

---

### Tarefa 1: fotos de referência

**Arquivos:** ferramenta fora do repositório nesta rodada.

- [ ] Fotografar por elemento (livro, menu, coluna da direita, console) as 16 telas em 1440, 1280 e 390, com o mapa fora da foto
- [ ] Rodar duas vezes seguidas e confirmar diferença zero entre as duas, para saber que a foto é estável

### Tarefa 2: dividir a folha em ordem

**Arquivos:** criar `src/estilo/tokens.css`, `base.css`, `nucleo.css`, `acabamento.css`, `pedidos.css`, `ferramentas.css`, `briefing.css`; `src/estilo.css` passa a só importar, na mesma ordem de hoje.

- [ ] Cortar nos seis marcadores de seção que já existem, sem mexer em nenhuma regra
- [ ] `npm run build` e fotos: diferença zero contra a referência
- [ ] Commit

### Tarefa 3: degraus como variáveis

**Arquivos:** `src/estilo/tokens.css`.

**Produz:** `--t-12 --t-13 --t-14 --t-16 --t-18 --t-22 --t-28`, `--p-normal:400 --p-medio:500 --p-forte:700 --p-titulo:800`, `--r-4 --r-8 --r-12 --r-18 --r-pilula`, `--d-rapido:.14s --d-medio:.2s --d-lento:.3s`, `--h-sm --h-md --h-lg` (já existem).

- [ ] Declarar as variáveis; `small` e controles de formulário herdam a letra
- [ ] Fotos: diferença só onde havia 13,33
- [ ] Commit

### Tarefa 4: trocar valor solto por degrau

**Arquivos:** todos de `src/estilo/`.

- [ ] Letra: 13,5 vira 13; 14,5 vira 16 no texto de entrega; 15 vira 14 em botão e 16 no menu; 17 vira 18; 20 e 24 viram 22; 26 e 30 viram 28
- [ ] Raio: 2 e 3 viram 4; 5, 6, 7, 9 e 10 viram 8; 14 vira 12; 20 vira 18
- [ ] Tempo: .12 a .16 viram rápido; .18 a .25 viram médio; .3 vira lento
- [ ] Fotos das 16 telas nos três tamanhos, olhadas uma a uma; corrigir corte e quebra
- [ ] Medição: só os 7 tamanhos e os 5 raios aparecem
- [ ] Commit

### Tarefa 5: peso e hierarquia

- [ ] Menu, selos do topo e rótulos das ações do console passam de 700 para 500
- [ ] Medição: menos da metade dos textos em 700 ou mais
- [ ] Commit

### Tarefa 6: altura de controle e alvo de toque

- [ ] Abas, selos e retrato do cartão de missão em 32; link de ação com área de 32
- [ ] No celular: retrato do cartão, título do cartão no quadro, links da Memória e fechar o livro com 44 por 44
- [ ] Medição: nenhuma altura fora do sistema em controle; nenhum alvo abaixo de 44 no celular
- [ ] Commit

### Tarefa 7: documento do design system

**Arquivos:** criar `docs/design-system.md`.

- [ ] Degraus, quando usar cada um e os componentes com variantes e estados
- [ ] Página navegável com os mesmos degraus para o sócio conferir
- [ ] Commit

### Tarefa 8: fechamento

- [ ] `npx tsc -p . --noEmit`, `npx vitest run`, `npm run build`
- [ ] Passeio do pedido e do briefing em 1440, 1280 e 390, sem erro de console
- [ ] Pull request com os números de antes e depois
