create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text check (role in ('SUPER_ADMIN','BUSINESS_OWNER','BUSINESS_STAFF','CUSTOMER')) default 'BUSINESS_OWNER',
  created_at timestamptz default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id),
  name text not null,
  slug text unique not null,
  category text,
  description text,
  address text,
  whatsapp_number text,
  logo_url text,
  payment_instructions text,
  qris_image_url text,
  whatsapp_ai_prompt text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('OWNER','STAFF')) not null,
  created_at timestamptz default now(),
  unique(business_id, user_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  category_id uuid references public.categories(id),
  name text not null,
  slug text not null,
  description text,
  sku text,
  price numeric(12,2) not null default 0,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(business_id, slug)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  name text not null,
  sku text,
  price_adjustment numeric(12,2) default 0,
  stock integer default 0 check (stock >= 0),
  low_stock_threshold integer default 5 check (low_stock_threshold >= 0),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  product_variant_id uuid references public.product_variants(id),
  type text check (type in ('IN','OUT','ADJUSTMENT','ORDER_RESERVED','ORDER_CANCELLED')) not null,
  quantity integer not null,
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  name text,
  phone text,
  whatsapp_number text,
  email text,
  address text,
  segment text default 'NEW' check (segment in ('NEW','RETURNING','LOYAL')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id),
  order_code text unique not null,
  source text check (source in ('WEB','WHATSAPP','ADMIN')) default 'WEB',
  status text check (status in ('PENDING_PAYMENT','PAID','PROCESSING','PACKING','SHIPPED','COMPLETED','CANCELLED','REFUNDED')) default 'PENDING_PAYMENT',
  subtotal numeric(12,2) default 0,
  discount_total numeric(12,2) default 0,
  shipping_cost numeric(12,2) default 0,
  grand_total numeric(12,2) default 0,
  payment_status text check (payment_status in ('PENDING','PAID','REJECTED','REFUNDED')) default 'PENDING',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_variant_id uuid references public.product_variants(id),
  product_name text not null,
  variant_name text,
  quantity integer not null check (quantity > 0),
  price numeric(12,2) not null,
  total numeric(12,2) not null,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  method text default 'MANUAL_TRANSFER',
  status text check (status in ('PENDING','PAID','REJECTED','REFUNDED')) default 'PENDING',
  amount numeric(12,2) not null,
  proof_url text,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  note text,
  created_at timestamptz default now(),
  unique(order_id)
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  courier text,
  tracking_number text,
  status text check (status in ('NOT_SHIPPED','READY_TO_SHIP','SHIPPED','DELIVERED','RETURNED')) default 'NOT_SHIPPED',
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(order_id)
);

create table if not exists public.order_status_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  old_status text,
  new_status text,
  note text,
  changed_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  customer_id uuid references public.customers(id),
  rating integer check (rating between 1 and 5),
  comment text,
  is_visible boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  code text not null,
  type text check (type in ('FIXED','PERCENTAGE')),
  value numeric(12,2) not null,
  min_purchase numeric(12,2) default 0,
  max_uses integer,
  used_count integer default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(business_id, code)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id),
  channel text check (channel in ('WHATSAPP','WEB')) default 'WHATSAPP',
  external_chat_id text,
  last_message_at timestamptz,
  created_at timestamptz default now(),
  unique(business_id, external_chat_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_type text check (sender_type in ('CUSTOMER','BOT','ADMIN','SYSTEM')),
  message text not null,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create table if not exists public.ai_action_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  conversation_id uuid references public.conversations(id),
  intent text,
  input_text text,
  output_json jsonb,
  confidence numeric(4,3),
  status text check (status in ('SUCCESS','FAILED','NEEDS_REVIEW')),
  error_message text,
  created_at timestamptz default now()
);

create index if not exists businesses_owner_idx on public.businesses(owner_id);
create index if not exists business_members_user_idx on public.business_members(user_id);
create index if not exists products_business_idx on public.products(business_id);
create index if not exists variants_product_idx on public.product_variants(product_id);
create index if not exists inventory_business_idx on public.inventory_movements(business_id);
create index if not exists customers_business_phone_idx on public.customers(business_id, phone);
create index if not exists orders_business_status_idx on public.orders(business_id, status);
create index if not exists orders_code_idx on public.orders(order_code);
create index if not exists payments_order_idx on public.payments(order_id);
create index if not exists shipments_order_idx on public.shipments(order_id);
create index if not exists reviews_business_idx on public.reviews(business_id);
create index if not exists conversations_business_chat_idx on public.conversations(business_id, external_chat_id);

drop trigger if exists set_businesses_updated_at on public.businesses;
create trigger set_businesses_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_product_variants_updated_at on public.product_variants;
create trigger set_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_shipments_updated_at on public.shipments;
create trigger set_shipments_updated_at
before update on public.shipments
for each row execute function public.set_updated_at();

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = target_business_id
      and bm.user_id = auth.uid()
  );
$$;

create or replace function public.is_business_owner(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = target_business_id
      and bm.user_id = auth.uid()
      and bm.role = 'OWNER'
  );
$$;

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.order_status_logs enable row level security;
alter table public.reviews enable row level security;
alter table public.vouchers enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.ai_action_logs enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "businesses select members" on public.businesses;
create policy "businesses select members"
on public.businesses for select
using (public.is_business_member(id));

drop policy if exists "businesses insert owner" on public.businesses;
create policy "businesses insert owner"
on public.businesses for insert
with check (owner_id = auth.uid());

drop policy if exists "businesses update members" on public.businesses;
create policy "businesses update members"
on public.businesses for update
using (public.is_business_member(id))
with check (public.is_business_member(id));

drop policy if exists "business members select own" on public.business_members;
create policy "business members select own"
on public.business_members for select
using (user_id = auth.uid() or public.is_business_member(business_id));

drop policy if exists "business members insert owner" on public.business_members;
create policy "business members insert owner"
on public.business_members for insert
with check (user_id = auth.uid() or public.is_business_owner(business_id));

drop policy if exists "business members update owner" on public.business_members;
create policy "business members update owner"
on public.business_members for update
using (public.is_business_owner(business_id))
with check (public.is_business_owner(business_id));

drop policy if exists "categories members all" on public.categories;
create policy "categories members all"
on public.categories for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "products members all" on public.products;
create policy "products members all"
on public.products for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "product variants members all" on public.product_variants;
create policy "product variants members all"
on public.product_variants for all
using (
  exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and public.is_business_member(p.business_id)
  )
)
with check (
  exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and public.is_business_member(p.business_id)
  )
);

drop policy if exists "inventory members all" on public.inventory_movements;
create policy "inventory members all"
on public.inventory_movements for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "customers members all" on public.customers;
create policy "customers members all"
on public.customers for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "orders members all" on public.orders;
create policy "orders members all"
on public.orders for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "order items members all" on public.order_items;
create policy "order items members all"
on public.order_items for all
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and public.is_business_member(o.business_id)
  )
)
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and public.is_business_member(o.business_id)
  )
);

drop policy if exists "payments members all" on public.payments;
create policy "payments members all"
on public.payments for all
using (
  exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and public.is_business_member(o.business_id)
  )
)
with check (
  exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and public.is_business_member(o.business_id)
  )
);

drop policy if exists "shipments members all" on public.shipments;
create policy "shipments members all"
on public.shipments for all
using (
  exists (
    select 1 from public.orders o
    where o.id = shipments.order_id
      and public.is_business_member(o.business_id)
  )
)
with check (
  exists (
    select 1 from public.orders o
    where o.id = shipments.order_id
      and public.is_business_member(o.business_id)
  )
);

drop policy if exists "order logs members all" on public.order_status_logs;
create policy "order logs members all"
on public.order_status_logs for all
using (
  exists (
    select 1 from public.orders o
    where o.id = order_status_logs.order_id
      and public.is_business_member(o.business_id)
  )
)
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_status_logs.order_id
      and public.is_business_member(o.business_id)
  )
);

drop policy if exists "reviews members all" on public.reviews;
create policy "reviews members all"
on public.reviews for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "vouchers members all" on public.vouchers;
create policy "vouchers members all"
on public.vouchers for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "conversations members all" on public.conversations;
create policy "conversations members all"
on public.conversations for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "messages members all" on public.messages;
create policy "messages members all"
on public.messages for all
using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and public.is_business_member(c.business_id)
  )
)
with check (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and public.is_business_member(c.business_id)
  )
);

drop policy if exists "ai logs members all" on public.ai_action_logs;
create policy "ai logs members all"
on public.ai_action_logs for all
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('qris-images', 'qris-images', true)
on conflict (id) do nothing;

drop policy if exists "authenticated upload product images" on storage.objects;
create policy "authenticated upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "authenticated upload payment proofs" on storage.objects;
create policy "authenticated upload payment proofs"
on storage.objects for insert
with check (bucket_id = 'payment-proofs' and auth.role() = 'authenticated');

drop policy if exists "authenticated read payment proofs" on storage.objects;
create policy "authenticated read payment proofs"
on storage.objects for select
using (bucket_id = 'payment-proofs' and auth.role() = 'authenticated');

drop policy if exists "authenticated upload qris images" on storage.objects;
create policy "authenticated upload qris images"
on storage.objects for insert
with check (bucket_id = 'qris-images' and auth.role() = 'authenticated');

drop policy if exists "public read qris images" on storage.objects;
create policy "public read qris images"
on storage.objects for select
using (bucket_id = 'qris-images');

notify pgrst, 'reload schema';
