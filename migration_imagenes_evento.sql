-- Create table for event images (gallery)
create table public.imagenes_evento (
  id uuid not null default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  url text not null,
  descripcion text null,
  orden integer not null default 0,
  created_at timestamptz null default now(),
  constraint imagenes_evento_pkey primary key (id)
);

-- Enable RLS
alter table public.imagenes_evento enable row level security;

-- Policies for public access (Read)
create policy "Imágenes de eventos públicas" on public.imagenes_evento 
  for select using (true);

-- Policies for Admin (Write/Delete)
create policy "Admin gestiona imágenes de eventos" on public.imagenes_evento 
  for all using (auth.role() = 'authenticated');

-- Note: You also need to create a Storage Bucket named 'event-images' in Supabase
-- and set up public access policies for reading, and authenticated access for uploading/deleting.
