-- Create table for regulations
create table public.reglamentos (
  id uuid not null default gen_random_uuid(),
  titulo text not null,
  url text not null,
  created_at timestamptz null default now(),
  constraint reglamentos_pkey primary key (id)
);

-- Note: You also need to create a Storage Bucket named 'reglamentos' in Supabase
-- and set up public access policies for reading, and authenticated access for uploading/deleting.
