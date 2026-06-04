alter table public.businesses
add column if not exists whatsapp_ai_prompt text;

notify pgrst, 'reload schema';
