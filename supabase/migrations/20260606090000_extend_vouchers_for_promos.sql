alter table public.vouchers
add column if not exists title text,
add column if not exists description text,
add column if not exists promo_kind text default 'DISCOUNT',
add column if not exists min_quantity integer default 0,
add column if not exists buy_quantity integer default 0,
add column if not exists free_quantity integer default 0;

alter table public.vouchers
drop constraint if exists vouchers_promo_kind_check;

alter table public.vouchers
add constraint vouchers_promo_kind_check
check (promo_kind in ('DISCOUNT','BUY_X_GET_Y'));

create index if not exists vouchers_business_active_idx
on public.vouchers(business_id, is_active);
