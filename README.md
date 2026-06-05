# Controle de Demandas - Setor de Cadastro e Legalização

Sistema web desenvolvido em **Next.js** para controle de demandas internas do setor de cadastro, legalização e acompanhamento de processos.

O projeto permite cadastrar, acompanhar, atualizar, concluir e consultar demandas, com controle de usuários, permissões, histórico de movimentações e anexos salvos no MongoDB Atlas via GridFS.

---

## Stack utilizada

* Next.js 15
* TypeScript
* Tailwind CSS
* MongoDB Atlas
* Mongoose
* GridFS
* Vercel

---

## Principais funcionalidades

* Cadastro de usuários
* Login de acesso
* Controle de permissões por perfil
* Cadastro de novas demandas
* Painel de acompanhamento de demandas
* Painel administrativo
* Alteração de status
* Definição de prioridade
* Definição de responsável
* Inclusão de observações
* Histórico de movimentações
* Upload de documentos
* Download de anexos
* Exclusão automática de anexos ao concluir demanda
* Gestão de usuários pelo administrador

---

## Collections do MongoDB

O Mongoose cria automaticamente as collections no primeiro uso:

```text
users
demands
demand_history
```

Os arquivos anexados são armazenados no MongoDB Atlas via **GridFS**.

---

## Configuração do MongoDB Atlas

1. Crie uma conta no MongoDB Atlas.
2. Crie um projeto.
3. Crie um cluster.
4. Em **Database Access**, crie um usuário de banco de dados.
5. Em **Network Access**, libere o IP local para desenvolvimento.
6. Para deploy na Vercel, pode ser necessário liberar:

```text
0.0.0.0/0
```

Atenção: essa regra libera acesso externo amplo ao banco. Use somente se estiver de acordo com sua política de segurança e mantenha usuário e senha fortes.

7. Em **Connect**, copie a string de conexão `mongodb+srv`.
8. Use um banco com o nome:

```text
controle_demandas
```

---

## Variáveis de ambiente

Crie um arquivo chamado `.env.local` na raiz do projeto:

```env
MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/controle_demandas?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_SECRET=troque-por-uma-chave-grande-e-segura-com-32-caracteres-ou-mais
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Nunca coloque `MONGODB_URI`, senhas, tokens ou chaves secretas no código fonte.

O arquivo `.env.local` não deve ser enviado para o GitHub.

---

## Instalação local

Instale as dependências:

```bash
npm install
```

Execute o projeto em ambiente local:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000/login
```

---

## Build local

Antes de publicar ou subir alterações para produção, recomenda-se testar o build:

```bash
npm run build
```

Se o build finalizar sem erro, o projeto está pronto para deploy.

---

## Primeiro acesso

O primeiro usuário criado pela tela de cadastro será definido automaticamente como administrador, desde que a collection `users` ainda esteja vazia.

Os próximos usuários criados entram como solicitantes com acesso pendente, aguardando aprovação do administrador na tela:

```text
/usuarios
```

---

## Seed opcional

O projeto possui um seed opcional para criar usuário administrador e dados de exemplo.

Execute:

```bash
npm run seed
```

Variáveis opcionais para o seed:

```env
SEED_ADMIN_EMAIL=admin@cadastro.local
SEED_ADMIN_PASSWORD=troque-por-uma-senha-forte
```

Recomenda-se usar o seed apenas em ambiente local ou ambiente de teste.

Não utilize senhas fracas ou senhas de exemplo em produção.

---

## Rotas principais

```text
/login
```

Tela de login e criação de acesso.

```text
/nova-demanda
```

Tela para cadastro de nova demanda.

```text
/demandas
```

Painel operacional para consulta e acompanhamento das demandas.

```text
/admin
```

Painel administrativo para edição, alteração de status, prioridade, responsável, conclusão, cancelamento e exclusão de demandas.

```text
/usuarios
```

Tela de aprovação e gestão de usuários. Disponível apenas para administradores.

---

## Perfis de acesso

### Solicitante

O usuário solicitante pode:

* Criar demandas
* Visualizar demandas
* Pesquisar demandas
* Ver andamento
* Ver histórico
* Atualizar observações
* Anexar documentos em demandas abertas

### Administrador

O usuário administrador pode:

* Aprovar usuários
* Alterar permissões
* Editar demandas
* Alterar status
* Definir prioridade
* Definir responsável
* Concluir demandas
* Cancelar demandas
* Excluir demandas
* Baixar documentos anexados
* Visualizar painel administrativo

---

## Documentos anexados

Os arquivos enviados nas demandas são salvos no MongoDB Atlas via **GridFS**.

Os anexos não são salvos no frontend e não são salvos no disco da Vercel.

Formatos aceitos:

```text
PDF
JPG
PNG
DOCX
XLSX
```

Limite atual:

```text
4 MB por arquivo
```

Atenção: ao marcar uma demanda como **Concluída**, os anexos vinculados a essa demanda são apagados automaticamente.

Antes de concluir uma demanda, baixe e salve os documentos que precisam ser preservados.

---

## Publicação na Vercel

1. Suba o projeto para um repositório Git.
2. Acesse a Vercel.
3. Clique em **Add New Project**.
4. Importe o repositório.
5. Configure as variáveis em:

```text
Settings > Environment Variables
```

Adicione:

```env
MONGODB_URI
NEXTAUTH_SECRET
NEXT_PUBLIC_APP_URL
```

6. Faça o deploy.
7. Após o primeiro deploy, copie a URL gerada pela Vercel e atualize:

```env
NEXT_PUBLIC_APP_URL=https://sua-url.vercel.app
```

8. Faça um novo deploy após ajustar a variável.

---

## Cuidados antes de deixar o repositório público

Antes de tornar o repositório público, verifique se não existem arquivos com informações sensíveis, como:

```text
.env
.env.local
.env.production
tokens
senhas
chaves de API
credenciais do MongoDB
dados reais de clientes
documentos internos
arquivos de banco de dados
```

Também confira se o `.gitignore` está bloqueando arquivos sensíveis.

Recomendado manter no `.gitignore`:

```gitignore
.env
.env.*
!.env.example
.vercel
node_modules
.next
```

---

## Arquivo `.env.example`

É recomendável manter um arquivo `.env.example` no repositório para orientar a configuração do projeto, sem dados reais:

```env
MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/controle_demandas?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_SECRET=troque-por-uma-chave-grande-e-segura
NEXT_PUBLIC_APP_URL=http://localhost:3000

SEED_ADMIN_EMAIL=admin@cadastro.local
SEED_ADMIN_PASSWORD=troque-por-uma-senha-forte
```

---

## Segurança

* Nunca exponha a string real do MongoDB no frontend.
* Nunca envie `.env.local` para o GitHub.
* Use senha forte para o banco de dados.
* Use uma chave segura em `NEXTAUTH_SECRET`.
* Revise os dados de exemplo antes de publicar o repositório.
* Evite nomes reais de clientes nos arquivos de seed ou documentação pública.
* Limite o acesso ao MongoDB Atlas sempre que possível.

---

## Licença

Projeto interno para controle operacional de demandas do setor de cadastro e legalização.

Caso o repositório seja publicado, defina uma licença de uso conforme a política do responsável pelo projeto.
