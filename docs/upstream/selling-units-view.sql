-- PROPOSED for Xana Plus App (supabase/migrations). Not applied.
-- Publishes the BC selling unit so app and website can say what one price buys.
-- Apply only after the BC administrator confirms the source fields
-- (see docs/selling-units.md in the website repository).

alter table public.products
  add column if not exists base_unit_of_measure text,
  add column if not exists base_unit_label text,
  add column if not exists unit_conversions jsonb;

-- New columns are appended at the end; existing view columns are unchanged.
create or replace view public.catalogue as
select
  item_no,
  description                            as name,
  unit_price                             as price,
  greatest(inventory, 0)                 as stock,
  inventory_posting_group                as category,
  item_category_code,
  gtin,
  (
    inventory_posting_group = 'CONTROLLED'
    or item_category_code in ('PHARMACY', 'POM', 'CHRONIC', 'CONTROLLED')
    or (item_category_code is null and inventory_posting_group = 'CHRONIC')
  )                                      as requires_rx,
  inventory_posting_group = 'WINES & SPIRITS' as age_restricted,
  photo_url,
  photo_url is not null                  as has_photo,
  coalesce(inventory, 0) > 0             as in_stock,
  base_unit_of_measure                   as selling_unit,
  base_unit_label                        as selling_unit_label,
  unit_conversions
from public.products
where is_active
  and unit_price > 0;

grant select on public.catalogue to anon, authenticated;
