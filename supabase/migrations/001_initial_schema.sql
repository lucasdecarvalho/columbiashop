-- ColumbiaShop — Schema inicial
-- Função para decrementar estoque de forma segura
create or replace function decrement_stock(product_id uuid, qty integer)
returns void as $$
begin
  update products
  set stock = greatest(0, stock - qty)
  where id = product_id;
end;
$$ language plpgsql security definer;


create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  phone text,
  cpf text,
  created_at timestamptz default now()
);

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price numeric(10,2) not null,
  stock integer not null default 0,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  mp_token text,
  last_four text not null,
  brand text not null,
  holder_name text not null,
  expiration_month integer not null,
  expiration_year integer not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  status text not null default 'pending',
  total numeric(10,2) not null,
  mp_payment_id text,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  unit_price numeric(10,2) not null
);
