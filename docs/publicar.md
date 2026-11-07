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

## 3. Guardar a chave da Anthropic
No mesmo lugar, crie o segredo ANTHROPIC_API_KEY. A conversa aceita no máximo 30 perguntas a cada 10 minutos para o lab inteiro.

## 4. Levar para a main
Abra o pull request da última branch para a main, revise e faça o merge. A publicação roda sozinha na main: testes, build, migrações do banco e deploy.
