# ColumbiaShop

E-commerce piloto responsivo com área do cliente, dashboard administrativo e integração com Mercado Pago. Desenvolvido como projeto de demonstração para validação de fluxos de compra, gestão de produtos e pedidos.

---

## Sobre o Projeto

O ColumbiaShop é uma loja virtual focada em produtos de limpeza. O sistema contempla duas jornadas distintas:

**Cliente**
- Catálogo de produtos com busca em tempo real
- Detalhe do produto (modal no desktop, drawer no mobile)
- Carrinho persistido em `localStorage`
- Checkout com cartão de crédito salvo
- Área logada: dados pessoais, cartões, histórico de pedidos

**Administrador**
- Dashboard com CRUD completo de produtos
- Visualização e gestão de todos os pedidos

**Acessos principais**
- HK: https://columbiashophk.vercel.app
- PROD: https://columbiashop.vercel.app

**Credenciais de acesso (seed)**
| Perfil | URL de Acesso | E-mail | Senha |
|--------|--------|-------|-------|
| Cliente | https://columbiashop.vercel.app/login | `tester@columbia.shop` | `Columbia2026!@` |
| Admin | https://columbiashop.vercel.app/admin/login | `admin@columbia.shop` | `Columbia2026!@` |

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 |
| Animações | Framer Motion 12 |
| Formulários | React Hook Form + Zod |
| Máscaras | react-imask |
| Notificações | Sonner |
| Ícones | Lucide React |
| Autenticação | NextAuth v4 (Credentials) |
| Banco de dados | Supabase (PostgreSQL) |
| Pagamentos | Mercado Pago SDK v3 |
| Deploy | Vercel |
| Linguagem | TypeScript 5 |

---

## Estrutura de Pastas

```
columbiashop/
├── app/
│   ├── (rotas públicas)   /catalogo, /carrinho, /login
│   ├── minha-conta/       Área do cliente (autenticada)
│   ├── admin/             Dashboard admin (autenticado)
│   └── api/               Rotas de API (checkout, products, orders, cards, client)
├── components/
│   ├── ui/                Componentes base (Button, Input, Modal, Drawer, Spinner…)
│   ├── layout/            Navbar, AdminSidebar, ClientSidebar
│   ├── product/           ProductCard, ProductDetail
│   ├── cart/              CartItem, CheckoutForm
│   └── admin/             ProductForm, OrdersTable
├── lib/                   Supabase client, NextAuth config, utilitários
├── hooks/                 useCart, useMediaQuery
├── context/               LoaderContext
├── types/                 Tipos TypeScript globais
└── supabase/
    ├── migrations/        001_initial_schema.sql
    └── seed/              002_seed.sql
```

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Conta no [Supabase](https://supabase.com)
- Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers) (opcional para modo piloto)

---

## Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# NextAuth
NEXTAUTH_SECRET=seu_secret_aleatorio_aqui
NEXTAUTH_URL=http://localhost:3000

# URL pública da aplicação (usada no webhook)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mercado Pago (opcional em modo piloto)
MP_ACCESS_TOKEN=TEST-...
MP_PUBLIC_KEY=TEST-...
MP_WEBHOOK_SECRET=...
```

---

## Configuração do Banco de Dados

As migrations precisam ser aplicadas manualmente no **SQL Editor** do painel do Supabase (Dashboard → SQL Editor → New Query).

**Passo 1 — Schema inicial**

Copie e execute o conteúdo do arquivo [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).

Esse arquivo cria as tabelas: `clients`, `admins`, `products`, `cards`, `orders`, `order_items`, e a função RPC `decrement_stock`.

**Passo 2 — Seed de dados**

Copie e execute o conteúdo do arquivo [`supabase/seed/002_seed.sql`](supabase/seed/002_seed.sql).

Esse arquivo insere:
- 1 usuário cliente: `tester@columbia.shop`
- 1 usuário admin: `admin@columbia.shop`
- 6 produtos de limpeza
- 1 cartão Mastercard vinculado ao cliente tester

---

## Rodando Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/lucasdecarvalho/columbiashop.git
cd columbiashop

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com seus valores

# 4. Rode o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

O projeto usa **Turbopack** por padrão, que oferece hot reload significativamente mais rápido que o webpack.

---

## Build de Produção (local)

```bash
# Gera o build otimizado
npm run build

# Inicia o servidor de produção
npm start
```

O servidor sobe em [http://localhost:3000](http://localhost:3000) com a build otimizada.

> Certifique-se de que `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` estejam apontando para o endereço correto antes do build.

---

## Deploy na Vercel

### Primeiro deploy

1. Faça push do repositório para o GitHub
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório
3. A Vercel detecta automaticamente o Next.js
4. Antes de confirmar o deploy, adicione todas as variáveis de ambiente em **Environment Variables** (as mesmas do `.env.local`, com os valores de produção)
5. Clique em **Deploy**

### Deploys subsequentes

O projeto usa a estratégia **develop → main**:

```bash
# Após commits no branch develop:
git checkout main
git merge develop
git push origin main
git checkout develop
```

O push para `main` dispara o deploy automático na Vercel.

### Variáveis de ambiente na Vercel

Após alterar qualquer variável de ambiente no painel da Vercel, é necessário forçar um novo deploy para que as mudanças sejam aplicadas:

```bash
git commit --allow-empty -m "chore: redeploy" && git push origin main
```

Ou pelo painel: **Deployments → último deploy → Redeploy**.

---

## Fluxo de Autenticação

- `/login` — acesso exclusivo para clientes
- `/admin/login` — acesso exclusivo para administradores
- Rotas `/minha-conta/*` exigem sessão com `role: client`
- Rotas `/admin/*` exigem sessão com `role: admin`
- Proteção implementada via `proxy.ts` (equivalente ao `middleware.ts` no Next.js 16)

---

## Observações sobre o Modo Piloto

O checkout está configurado em **modo piloto**: os pedidos são criados e aprovados automaticamente sem chamadas reais à API do Mercado Pago. O estoque é decrementado normalmente. Isso permite demonstrar o fluxo completo de compra sem dependência de credenciais de sandbox.

Para ativar a integração real com o Mercado Pago, é necessário substituir a lógica em [`app/api/checkout/route.ts`](app/api/checkout/route.ts) pela chamada ao SDK e configurar credenciais de teste (`TEST-...`) nas variáveis de ambiente.
