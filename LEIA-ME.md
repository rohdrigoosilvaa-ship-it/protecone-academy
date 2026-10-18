# ProtecHub — plataforma de treinamentos EAD

Plataforma completa de treinamentos online (EAD): cursos, módulos, aulas em
vídeo, quiz por módulo, prova final, certificado com QR Code e painel
administrativo para montar tudo isso sem mexer em código.

Este guia foi escrito para quem **nunca usou terminal/linha de comando**. Vá
na ordem, sem pular etapas. Se algo aparecer diferente do que este guia
descreve, pare e copie a mensagem de erro para pedir ajuda.

---

## 1. Instalar o Node.js

Se você já configurou o Portal SSMA antes, pode pular esta etapa — é o mesmo
Node.js.

1. Acesse **https://nodejs.org** e baixe a versão **LTS**.
2. Instale clicando em "Next" em todas as telas.
3. Feche janelas de terminal abertas e abra uma nova. Confira digitando:
   ```bash
   node --version
   ```
   Deve aparecer algo como `v20.x.x`.

---

## 2. Criar o banco de dados gratuito (Neon)

A ProtecSeg Academy usa **seu próprio banco de dados**, separado do Portal
SSMA — são sistemas diferentes.

1. Acesse **https://neon.tech**, crie uma conta (ou entre com Google/GitHub).
2. Crie um novo projeto, por exemplo `protecseg-academy`.
3. Na tela do projeto, procure **"Connect"** / **"Connection string"** e
   copie o texto (algo como
   `postgresql://usuario:senha@ep-exemplo.aws.neon.tech/neondb?sslmode=require`).

---

## 3. Configurar o arquivo `.env`

1. Abra a pasta `server` deste projeto no Explorador de Arquivos.
2. Copie o arquivo **`.env.example`**, cole na mesma pasta e renomeie a
   cópia para **`.env`** (sem `.example`).
3. Abra o `.env` com o Bloco de Notas e preencha:
   ```
   DATABASE_URL="cole aqui a connection string do Neon"
   JWT_SECRET="uma frase longa e aleatória, só sua"
   PORT=3002
   ADMIN_EMAIL=admin@protecseg.com.br
   ADMIN_PASS=escolha-uma-senha-forte
   APP_URL="http://localhost:5174"
   ```
4. Salve e feche.

---

## 4. Instalar e preparar o servidor

Abra o terminal dentro da pasta `server` (Shift + botão direito → "Abrir
janela do PowerShell aqui") e rode, um de cada vez:

```bash
npm install
```

```bash
npx prisma migrate dev --name init
```
Isso cria as tabelas no banco Neon.

```bash
npm run seed
```
Isso cria o usuário administrador (com o e-mail/senha do `.env`) e o
primeiro curso, **"Integração de Segurança e Saúde no Trabalho"**, já
estruturado com os 10 módulos — como rascunho, pronto para você preencher
com vídeos e questões antes de publicar.

---

## 5. Ligar o servidor

Ainda na pasta `server`:
```bash
npm start
```
Deve aparecer `ProtecSeg Academy — servidor rodando na porta 3002`. Deixe
essa janela aberta.

---

## 6. Ligar a parte visual (front-end)

Em **outra** janela de terminal, agora na pasta `client`:
```bash
npm install
```
```bash
npm run dev
```
Deve aparecer um endereço `http://localhost:5174`. Deixe essa janela aberta
também.

---

## 7. Testar tudo

1. Acesse **http://localhost:5174** no navegador.
2. Entre com o e-mail/senha do administrador (definidos no `.env`).
3. Você cai no **painel administrativo** (ou use o link "Painel
   administrativo" na barra lateral).
4. Vá em **Cursos → Integração de Segurança e Saúde no Trabalho**:
   - Na aba **Módulos e aulas**, edite cada aula e cole o link do vídeo
     (um vídeo do YouTube marcado como **"não listado"**, ou do Vimeo).
   - Na aba **Banco de questões**, cadastre as perguntas de cada módulo e
     algumas para o banco geral (usadas na prova final).
   - Na aba **Dados gerais**, quando estiver pronto, mude o status para
     **Publicado**.
5. Saia e entre novamente com uma conta de **aluno** (crie uma em
   **Alunos → Novo usuário**) para testar a jornada completa: assistir
   aula → quiz → próximo módulo → prova final → certificado.
6. Teste a validação pública do certificado em
   **http://localhost:5174/certificados/validar** (não precisa estar
   logado).

---

## 8. Publicar no Vercel

Mesmo processo já usado no Portal SSMA:

1. Suba este projeto para um repositório novo no GitHub.
2. Crie um projeto no Vercel apontando para esse repositório (Framework:
   "Other"; o `vercel.json` já define o resto).
3. Nas variáveis de ambiente do Vercel, configure as mesmas do `.env`:
   `DATABASE_URL`, `JWT_SECRET`, `APP_URL` (troque para o domínio final,
   ex.: `https://academy.protecseg.com.br` — importante para o QR Code do
   certificado apontar para o lugar certo).
4. Depois do primeiro deploy, rode `npx prisma migrate deploy` e
   `npm run seed` uma vez (localmente, apontando o `DATABASE_URL` para o
   banco de produção) para criar as tabelas e o curso inicial em produção.

---

## Sobre os vídeos

Os vídeos das aulas ficam hospedados fora da plataforma (YouTube "não
listado" ou Vimeo) — é de graça e não exige nenhuma conta nova além da que
você já usa. Ao cadastrar uma aula do tipo "Vídeo", escolha o provedor e
cole apenas o **ID do vídeo** (o trecho depois de `v=` na URL do YouTube, ou
o número no fim da URL do Vimeo), não a URL inteira.

## Estrutura de arquivos

```
server/
  index.js               → ponto de entrada local (Render)
  api/ (via ../api)       → ponto de entrada do Vercel
  src/
    app.js                → configuração do Express
    middleware/auth.js     → login (JWT) e permissão por perfil
    routes/ controllers/ services/  → um trio por módulo (cursos, aulas, quiz…)
    services/progressoService.js    → motor único de progresso/bloqueio de conteúdo
    services/provaFinalService.js   → sorteio, embaralhamento e correção da prova final
    services/certificadoPdfService.js → geração do PDF + QR Code do certificado
  prisma/
    schema.prisma          → modelagem do banco
    seed.js                 → cria admin + primeiro curso
client/
  src/
    pages/public/           → login, validação pública de certificado
    pages/aluno/             → dashboard, catálogo, curso, player de aula, quiz, prova final, certificados
    pages/admin/              → dashboard, cursos, banco de questões, alunos, certificados, relatórios
    components/admin/          → editor de módulos/aulas/questões (usado dentro de cada curso)
    components/aluno/VideoPlayer.tsx → player YouTube/Vimeo/link direto com acompanhamento de progresso
```

## O que ficou fora do MVP (de propósito)

- Notificação por e-mail/WhatsApp — hoje só notificação dentro da
  plataforma (sino no topo).
- Upload de vídeo direto na plataforma — por ora só link externo
  (YouTube/Vimeo), para não depender de um serviço de armazenamento pago.
- Log de auditoria e log de validações de certificado — a validação
  funciona, só não fica registrada num histórico.

Nada disso limita o funcionamento do curso — são só telas/registros a mais
que podem ser adicionados depois, se fizerem falta.
