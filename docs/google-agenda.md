# Google Agenda e Meet no lab

O Google Agenda da V30 é o lugar oficial das reuniões com sócios e clientes. O lab lê os eventos, marca reunião nova com link do Meet e lê as Anotações do Gemini que o Meet prende no evento. Com elas, a orquestração propõe ata, decisões e missões, e nada entra no lab sem um sócio aprovar.

## Como funciona

1. Marcar no Meet, na Agenda do lab, cria o evento no Google Agenda com link do Meet e manda o convite por e-mail. O projeto do lab fica guardado no evento.
2. Na chamada, quem organiza liga as anotações do Gemini. Quando a reunião acaba, o documento aparece preso no evento.
3. Na Agenda do lab, a reunião aparece em Com anotações para organizar. Organizar com a equipe traz o texto do documento e a orquestração propõe a ata.
4. O sócio confere, desmarca o que não foi decidido e aprova. A ata vai para Feitas, as decisões para o registro e as missões para o quadro.

Sem a autorização do Google, a Agenda continua funcionando. Organizar anotações aceita o texto colado à mão.

## Ligar uma vez

A autorização é de uma conta só, a que organiza as reuniões. As anotações do Gemini ficam no Drive dela.

1. No Google Cloud, crie um projeto para o lab e ative a Google Calendar API e a Google Drive API.
2. Em APIs e serviços, Tela de permissão OAuth, escolha uso interno, que vale só para contas vetor30.com.br.
3. Em Credenciais, crie um ID do cliente OAuth do tipo Aplicativo da Web. Em URIs de redirecionamento autorizados, ponha `https://developers.google.com/oauthplayground`.
4. Abra o OAuth 2.0 Playground. Na engrenagem, marque Use your own OAuth credentials e cole o ID e o segredo do cliente.
5. Em Input your own scopes, cole os dois escopos abaixo, separados por espaço, e autorize com a conta que organiza as reuniões:
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/drive.readonly`
6. Clique em Exchange authorization code for tokens e copie o Refresh token.
7. Guarde os segredos no Worker:

```
npx wrangler secret put GOOGLE_OAUTH_ID
npx wrangler secret put GOOGLE_OAUTH_SEGREDO
npx wrangler secret put GOOGLE_OAUTH_RENOVACAO
```

Se a agenda não for a principal da conta, guarde também `AGENDA_GOOGLE` com o e-mail da agenda.

Em Conexões, o item Google Agenda e Meet fica verde quando os três segredos estão no Worker.

## Cuidados

- O token de renovação dá acesso à agenda e ao Drive da conta. Ele fica só no Worker, nunca no código, no chat ou em nota.
- O lab só lê o Drive. Ele não apaga nem muda arquivo.
- O convite avisa que a conversa terá anotações. Os clientes já concordaram, e vale manter o aviso em todo convite.
- Se a autorização vencer ou a senha da conta mudar, refaça os passos 4 a 7.
