alter table public.business_members
drop constraint if exists business_members_role_check;

alter table public.business_members
add constraint business_members_role_check
check (role in ('OWNER', 'STAFF', 'VIEWER'));

create or replace function public.is_business_editor(target_business_id uuid)
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
      and bm.role in ('OWNER', 'STAFF')
  );
$$;

create or replace function public.is_current_user_business_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.user_id = auth.uid()
      and bm.role in ('OWNER', 'STAFF')
  );
$$;

drop policy if exists "businesses insert owner" on public.businesses;
create policy "businesses insert owner"
on public.businesses for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('SUPER_ADMIN', 'BUSINESS_OWNER')
  )
);

drop policy if exists "businesses update members" on public.businesses;
drop policy if exists "businesses update editors" on public.businesses;
create policy "businesses update editors"
on public.businesses for update
using (public.is_business_editor(id))
with check (public.is_business_editor(id));

drop policy if exists "business members insert owner" on public.business_members;
create policy "business members insert owner"
on public.business_members for insert
with check (public.is_business_owner(business_id));

drop policy if exists "business members update owner" on public.business_members;
create policy "business members update owner"
on public.business_members for update
using (public.is_business_owner(business_id))
with check (public.is_business_owner(business_id));

drop policy if exists "business members delete owner" on public.business_members;
create policy "business members delete owner"
on public.business_members for delete
using (public.is_business_owner(business_id));

drop policy if exists "categories members all" on public.categories;
drop policy if exists "categories members select" on public.categories;
drop policy if exists "categories editors insert" on public.categories;
drop policy if exists "categories editors update" on public.categories;
drop policy if exists "categories editors delete" on public.categories;
create policy "categories members select"
on public.categories for select
using (public.is_business_member(business_id));
create policy "categories editors insert"
on public.categories for insert
with check (public.is_business_editor(business_id));
create policy "categories editors update"
on public.categories for update
using (public.is_business_editor(business_id))
with check (public.is_business_editor(business_id));
create policy "categories editors delete"
on public.categories for delete
using (public.is_business_editor(business_id));

drop policy if exists "products members all" on public.products;
drop policy if exists "products members select" on public.products;
drop policy if exists "products editors insert" on public.products;
drop policy if exists "products editors update" on public.products;
drop policy if exists "products editors delete" on public.products;
create policy "products members select"
on public.products for select
using (public.is_business_member(business_id));
create policy "products editors insert"
on public.products for insert
with check (public.is_business_editor(business_id));
create policy "products editors update"
on public.products for update
using (public.is_business_editor(business_id))
with check (public.is_business_editor(business_id));
create policy "products editors delete"
on public.products for delete
using (public.is_business_editor(business_id));

drop policy if exists "product variants members all" on public.product_variants;
drop policy if exists "product variants members select" on public.product_variants;
drop policy if exists "product variants editors insert" on public.product_variants;
drop policy if exists "product variants editors update" on public.product_variants;
drop policy if exists "product variants editors delete" on public.product_variants;
create policy "product variants members select"
on public.product_variants for select
using (
  exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and public.is_business_member(p.business_id)
  )
);
create policy "product variants editors insert"
on public.product_variants for insert
with check (
  exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and public.is_business_editor(p.business_id)
  )
);
create policy "product variants editors update"
on public.product_variants for update
using (
  exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and public.is_business_editor(p.business_id)
  )
)
with check (
  exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and public.is_business_editor(p.business_id)
  )
);
create policy "product variants editors delete"
on public.product_variants for delete
using (
  exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and public.is_business_editor(p.business_id)
  )
);

drop policy if exists "inventory members all" on public.inventory_movements;
drop policy if exists "inventory members select" on public.inventory_movements;
drop policy if exists "inventory editors insert" on public.inventory_movements;
drop policy if exists "inventory editors update" on public.inventory_movements;
drop policy if exists "inventory editors delete" on public.inventory_movements;
create policy "inventory members select"
on public.inventory_movements for select
using (public.is_business_member(business_id));
create policy "inventory editors insert"
on public.inventory_movements for insert
with check (public.is_business_editor(business_id));
create policy "inventory editors update"
on public.inventory_movements for update
using (public.is_business_editor(business_id))
with check (public.is_business_editor(business_id));
create policy "inventory editors delete"
on public.inventory_movements for delete
using (public.is_business_editor(business_id));

drop policy if exists "customers members all" on public.customers;
drop policy if exists "customers members select" on public.customers;
drop policy if exists "customers editors insert" on public.customers;
drop policy if exists "customers editors update" on public.customers;
drop policy if exists "customers editors delete" on public.customers;
create policy "customers members select"
on public.customers for select
using (public.is_business_member(business_id));
create policy "customers editors insert"
on public.customers for insert
with check (public.is_business_editor(business_id));
create policy "customers editors update"
on public.customers for update
using (public.is_business_editor(business_id))
with check (public.is_business_editor(business_id));
create policy "customers editors delete"
on public.customers for delete
using (public.is_business_editor(business_id));

drop policy if exists "orders members all" on public.orders;
drop policy if exists "orders members select" on public.orders;
drop policy if exists "orders editors insert" on public.orders;
drop policy if exists "orders editors update" on public.orders;
drop policy if exists "orders editors delete" on public.orders;
create policy "orders members select"
on public.orders for select
using (public.is_business_member(business_id));
create policy "orders editors insert"
on public.orders for insert
with check (public.is_business_editor(business_id));
create policy "orders editors update"
on public.orders for update
using (public.is_business_editor(business_id))
with check (public.is_business_editor(business_id));
create policy "orders editors delete"
on public.orders for delete
using (public.is_business_editor(business_id));

drop policy if exists "order items members all" on public.order_items;
drop policy if exists "order items members select" on public.order_items;
drop policy if exists "order items editors insert" on public.order_items;
drop policy if exists "order items editors update" on public.order_items;
drop policy if exists "order items editors delete" on public.order_items;
create policy "order items members select"
on public.order_items for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and public.is_business_member(o.business_id)
  )
);
create policy "order items editors insert"
on public.order_items for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and public.is_business_editor(o.business_id)
  )
);
create policy "order items editors update"
on public.order_items for update
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and public.is_business_editor(o.business_id)
  )
)
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and public.is_business_editor(o.business_id)
  )
);
create policy "order items editors delete"
on public.order_items for delete
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and public.is_business_editor(o.business_id)
  )
);

drop policy if exists "payments members all" on public.payments;
drop policy if exists "payments members select" on public.payments;
drop policy if exists "payments editors insert" on public.payments;
drop policy if exists "payments editors update" on public.payments;
drop policy if exists "payments editors delete" on public.payments;
create policy "payments members select"
on public.payments for select
using (
  exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and public.is_business_member(o.business_id)
  )
);
create policy "payments editors insert"
on public.payments for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and public.is_business_editor(o.business_id)
  )
);
create policy "payments editors update"
on public.payments for update
using (
  exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and public.is_business_editor(o.business_id)
  )
)
with check (
  exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and public.is_business_editor(o.business_id)
  )
);
create policy "payments editors delete"
on public.payments for delete
using (
  exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and public.is_business_editor(o.business_id)
  )
);

drop policy if exists "shipments members all" on public.shipments;
drop policy if exists "shipments members select" on public.shipments;
drop policy if exists "shipments editors insert" on public.shipments;
drop policy if exists "shipments editors update" on public.shipments;
drop policy if exists "shipments editors delete" on public.shipments;
create policy "shipments members select"
on public.shipments for select
using (
  exists (
    select 1 from public.orders o
    where o.id = shipments.order_id
      and public.is_business_member(o.business_id)
  )
);
create policy "shipments editors insert"
on public.shipments for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = shipments.order_id
      and public.is_business_editor(o.business_id)
  )
);
create policy "shipments editors update"
on public.shipments for update
using (
  exists (
    select 1 from public.orders o
    where o.id = shipments.order_id
      and public.is_business_editor(o.business_id)
  )
)
with check (
  exists (
    select 1 from public.orders o
    where o.id = shipments.order_id
      and public.is_business_editor(o.business_id)
  )
);
create policy "shipments editors delete"
on public.shipments for delete
using (
  exists (
    select 1 from public.orders o
    where o.id = shipments.order_id
      and public.is_business_editor(o.business_id)
  )
);

drop policy if exists "order logs members all" on public.order_status_logs;
drop policy if exists "order logs members select" on public.order_status_logs;
drop policy if exists "order logs editors insert" on public.order_status_logs;
create policy "order logs members select"
on public.order_status_logs for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_status_logs.order_id
      and public.is_business_member(o.business_id)
  )
);
create policy "order logs editors insert"
on public.order_status_logs for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_status_logs.order_id
      and public.is_business_editor(o.business_id)
  )
);

drop policy if exists "reviews members all" on public.reviews;
drop policy if exists "reviews members select" on public.reviews;
drop policy if exists "reviews editors update" on public.reviews;
drop policy if exists "reviews editors delete" on public.reviews;
create policy "reviews members select"
on public.reviews for select
using (public.is_business_member(business_id));
create policy "reviews editors update"
on public.reviews for update
using (public.is_business_editor(business_id))
with check (public.is_business_editor(business_id));
create policy "reviews editors delete"
on public.reviews for delete
using (public.is_business_editor(business_id));

drop policy if exists "vouchers members all" on public.vouchers;
drop policy if exists "vouchers members select" on public.vouchers;
drop policy if exists "vouchers editors insert" on public.vouchers;
drop policy if exists "vouchers editors update" on public.vouchers;
drop policy if exists "vouchers editors delete" on public.vouchers;
create policy "vouchers members select"
on public.vouchers for select
using (public.is_business_member(business_id));
create policy "vouchers editors insert"
on public.vouchers for insert
with check (public.is_business_editor(business_id));
create policy "vouchers editors update"
on public.vouchers for update
using (public.is_business_editor(business_id))
with check (public.is_business_editor(business_id));
create policy "vouchers editors delete"
on public.vouchers for delete
using (public.is_business_editor(business_id));

drop policy if exists "conversations members all" on public.conversations;
drop policy if exists "conversations members select" on public.conversations;
drop policy if exists "conversations editors insert" on public.conversations;
drop policy if exists "conversations editors update" on public.conversations;
drop policy if exists "conversations editors delete" on public.conversations;
create policy "conversations members select"
on public.conversations for select
using (public.is_business_member(business_id));
create policy "conversations editors insert"
on public.conversations for insert
with check (public.is_business_editor(business_id));
create policy "conversations editors update"
on public.conversations for update
using (public.is_business_editor(business_id))
with check (public.is_business_editor(business_id));
create policy "conversations editors delete"
on public.conversations for delete
using (public.is_business_editor(business_id));

drop policy if exists "messages members all" on public.messages;
drop policy if exists "messages members select" on public.messages;
drop policy if exists "messages editors insert" on public.messages;
create policy "messages members select"
on public.messages for select
using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and public.is_business_member(c.business_id)
  )
);
create policy "messages editors insert"
on public.messages for insert
with check (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and public.is_business_editor(c.business_id)
  )
);

drop policy if exists "ai logs members all" on public.ai_action_logs;
drop policy if exists "ai logs members select" on public.ai_action_logs;
drop policy if exists "ai logs editors insert" on public.ai_action_logs;
create policy "ai logs members select"
on public.ai_action_logs for select
using (public.is_business_member(business_id));
create policy "ai logs editors insert"
on public.ai_action_logs for insert
with check (public.is_business_editor(business_id));

drop policy if exists "authenticated upload product images" on storage.objects;
drop policy if exists "business editors upload product images" on storage.objects;
create policy "business editors upload product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and public.is_current_user_business_editor()
);

drop policy if exists "authenticated upload qris images" on storage.objects;
drop policy if exists "business editors upload qris images" on storage.objects;
create policy "business editors upload qris images"
on storage.objects for insert
with check (
  bucket_id = 'qris-images'
  and public.is_current_user_business_editor()
);

notify pgrst, 'reload schema';
