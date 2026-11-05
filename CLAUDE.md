# Agência V30

Mapa isométrico do Lab V30 com especialistas de IA. Fundo renderizado no Blender, gente viva desenhada por cima com PixiJS, painéis em React.

## Disciplina de Desenvolvimento
- Nunca codar sem antes criar uma issue descrevendo o que vai ser feito
- Cada feature em branch isolada (git checkout -b feature/nome)
- Antes de implementar: pesquisar se já existe código similar no projeto
- Testes para cada feature antes de merge
- Arquitetura: pages/ > hooks/ > components/ > lib/
- Nunca fazer merge direto na main sem revisar

## Princípios
1. KISS, simplicidade vence abstração
2. YAGNI, só o que o problema atual exige
3. DRY, quando a abstração for mais clara que a repetição
4. SoC, preocupações distintas separadas
5. Reutilizar soluções testadas que entendemos

## Comandos
- npm run dev, npm run build, npm test
- Arte: os scripts do Blender ficam em arte/ e geram public/assets/
