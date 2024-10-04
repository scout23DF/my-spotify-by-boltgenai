# Spotify-like Web App

This is a Spotify-like web application built with React, TypeScript, and Supabase.

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
4. Edit `.env` and add your Supabase URL and anon key
5. Start the development server:
   ```
   npm run dev
   ```

## Supabase Setup

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Create the following function to allow creating tables dynamically:

```sql
create or replace function create_table(table_name text, columns text)
returns void as $$
begin
  execute format('create table if not exists %I (%s)', table_name, columns);
end;
$$ language plpgsql security definer;

-- Enable Row Level Security (RLS) for all tables
alter table artists enable row level security;
alter table albums enable row level security;
alter table songs enable row level security;

-- Create policies to allow all operations for authenticated users
create policy "Users can perform all actions on their own artists" on artists
  for all using (auth.uid() = user_id);

create policy "Users can perform all actions on their own albums" on albums
  for all using (auth.uid() = user_id);

create policy "Users can perform all actions on their own songs" on songs
  for all using (auth.uid() = user_id);

-- Create a policy for the storage bucket
create policy "Allow authenticated users access to their own folder"
on storage.objects for all using (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

4. Create a storage bucket named "songs" for storing MP3 files
5. Enable Email Auth provider in the Authentication settings
6. Copy your Supabase URL and anon key to the `.env` file

## Features

- User authentication (sign up, log in, log out)
- Manage artists, albums, and songs
- Upload and play MP3 files
- Basic audio player with playlist functionality

## TODO

- Enhance audio player features (shuffle, repeat)
- Implement search functionality
- Add album artwork upload and display
- Implement user profiles and sharing features