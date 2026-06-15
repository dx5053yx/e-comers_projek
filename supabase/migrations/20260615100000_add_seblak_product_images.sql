update public.products as product
set image_url = case product.slug
  when 'seblak-original' then '/products/seblak-original.webp'
  when 'seblak-seafood' then '/products/seblak-seafood.webp'
  when 'es-teh' then '/products/es-teh.webp'
  else product.image_url
end
from public.businesses as business
where product.business_id = business.id
  and business.slug = 'warung-seblak-ibu-ani'
  and product.slug in ('seblak-original', 'seblak-seafood', 'es-teh');

notify pgrst, 'reload schema';
