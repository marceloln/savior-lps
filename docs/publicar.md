# Como publicar o Lab V30

O lab só vai para o ar depois que o acesso estiver fechado. São quatro passos no painel da Cloudflare e no GitHub.

## 1. Fechar o acesso com Cloudflare Access
1. No painel da Cloudflare, abra Zero Trust e depois Access, Applications.
2. Crie uma aplicação do tipo Self-hosted para o endereço do Worker agencia-v30 (o workers.dev e, se houver, o domínio próprio).
3. Na política, permita só os e-mails da equipe V30.
4. Copie o Application Audience (AUD) da aplicação e o nome do time do Zero Trust (o que vem antes de .cloudflareaccess.com).

## 2. Contar ao Worker quem pode entrar
No painel do Worker agencia-v30, em Settings, Variables, crie:
- ACESSO_EQUIPE com o nome do time
- ACESSO_AUD com o AUD copiado

Pode criar as duas antes ou depois do merge: o deploy mantém as variáveis do painel (keep_vars no wrangler.jsonc). Com as duas preenchidas, toda rota /api confere o token do login. Sem elas o Worker publicado recusa a API e a página abre em modo de prévia, com os exemplos e sem gravar nada. Só o computador local, no desenvolvimento, passa sem login.

## 3. Guardar as chaves dos provedores de IA
No mesmo lugar, crie os segredos dos provedores que o lab vai usar. Basta um para começar.
- ANTHROPIC_API_KEY para os modelos Claude, que são o padrão do lab
- OPENAI_API_KEY se algum especialista usar modelo da OpenAI
- GOOGLE_API_KEY se algum especialista usar modelo do Google

O modelo padrão do lab se escolhe na aba Conexões, e o de cada especialista na aba Treino da ficha. O identificador é provedor:modelo, por exemplo anthropic:claude-sonnet-5-5. Os nomes de modelo mudam com o tempo: se o provedor recusar, a tela avisa e dá para digitar outro.

Conversa, plano de pedido, execução de missão e síntese somam no máximo 60 chamadas a cada 10 minutos para o lab inteiro.

Nunca crie a variável IA_SIMULADA em produção. Ela só existe para testar no computador local sem gastar.

## 4. Levar para a main
Abra o pull request da última branch para a main, revise e faça o merge. A publicação roda sozinha na main: testes, build, migrações do banco e deploy.
