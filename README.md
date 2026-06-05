# Controle de Demandas - Setor de Cadastro e Legalização

Sistema web em Next.js para controle de demandas internas de cadastro/legalização, usando MongoDB Atlas com Mongoose.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Mongoose
- MongoDB Atlas
- Vercel

## Collections

O Mongoose cria automaticamente as collections no primeiro uso:

- `users`
- `demands`
- `demand_history`

## Configurar MongoDB Atlas

1. Crie um projeto no MongoDB Atlas.
2. Crie um cluster.
3. Em `Database Access`, crie um usuário de banco.
4. Em `Network Access`, libere seu IP local. Para Vercel, use `0.0.0.0/0` ou uma regra compatível com sua política de segurança.
5. Em `Connect`, copie a string `mongodb+srv`.
6. Use um banco chamado `controle_demandas`.

## Criar `.env.local`

Crie um arquivo `.env.local` na raiz do projeto:

```env
MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/controle_demandas?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_SECRET=uma-chave-grande-e-segura-com-32-caracteres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Nunca coloque `MONGODB_URI` em código de frontend. Ela é usada apenas no servidor.

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse:

```text
http://localhost:3000/login
```

O primeiro usuário criado pela tela de cadastro vira `admin` automaticamente. Os próximos usuários entram como `solicitante` com acesso pendente, aguardando aprovação do administrador na tela `/usuarios`.

## Seed opcional

Para criar um admin e demandas de exemplo:

```bash
npm run seed
```

Variáveis opcionais para o seed:

```env
SEED_ADMIN_EMAIL=admin@cadastro.local
SEED_ADMIN_PASSWORD=Admin123456!
```

## Rotas

- `/login`: login e criação de acesso
- `/nova-demanda`: cadastro de demanda
- `/demandas`: painel operacional para solicitantes e admins
- `/admin`: painel administrativo com edição, status, conclusão e exclusão
- `/usuarios`: aprovação e gestão de usuários, apenas para admins

## Permissões

Solicitante:

- Cria demandas
- Visualiza demandas
- Pesquisa demandas
- Ver andamento e histórico
- Atualiza observações
- Anexa documentos em demandas abertas

Admin:

- Edita demandas
- Altera status
- Define prioridade
- Define responsável
- Conclui
- Cancela
- Exclui
- Baixa documentos anexados

## Documentos anexados

Arquivos enviados na demanda são salvos no MongoDB Atlas via GridFS, não no frontend e não no disco da Vercel.

Formatos aceitos:

- PDF
- JPG
- PNG
- DOCX
- XLSX

Limite atual: 4 MB por arquivo.

Ao marcar uma demanda como `Concluída`, os anexos dessa demanda são apagados automaticamente. Baixe e salve os documentos necessários antes de concluir.

## Publicar na Vercel

1. Suba o projeto para um repositório Git.
2. Na Vercel, clique em `Add New Project`.
3. Importe o repositório.
4. Configure as variáveis em `Settings > Environment Variables`:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
5. Faça o deploy.

Em produção, ajuste `NEXT_PUBLIC_APP_URL` para a URL da Vercel.
