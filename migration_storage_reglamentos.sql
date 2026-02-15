-- Create the storage bucket 'reglamentos'
insert into storage.buckets (id, name, public)
values ('reglamentos', 'reglamentos', true);

-- Policy to allow public access to read files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'reglamentos' );

-- Policy to allow authenticated users to upload files
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'reglamentos' and auth.role() = 'authenticated' );

-- Policy to allow authenticated users to update files
create policy "Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'reglamentos' and auth.role() = 'authenticated' );

-- Policy to allow authenticated users to delete files
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'reglamentos' and auth.role() = 'authenticated' );
