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

---
