import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function setupDatabase() {
  try {
    // Create user_profiles table if it doesn't exist
    const { error: userProfilesError } = await supabase.rpc('create_table_if_not_exists', {
      p_table_name: 'user_profiles',
      p_column_definitions: `
        id uuid references auth.users(id) primary key,
        username text,
        bio text
      `
    })
    if (userProfilesError) throw userProfilesError

    // Create artists table if it doesn't exist
    const { error: artistsError } = await supabase.rpc('create_table_if_not_exists', {
      p_table_name: 'artists',
      p_column_definitions: `
        id uuid default uuid_generate_v4() primary key,
        name text not null,
        user_id uuid references auth.users(id)
      `
    })
    if (artistsError) throw artistsError

    // Create albums table if it doesn't exist
    const { error: albumsError } = await supabase.rpc('create_table_if_not_exists', {
      p_table_name: 'albums',
      p_column_definitions: `
        id uuid default uuid_generate_v4() primary key,
        title text not null,
        artist_id uuid references artists(id),
        artwork_url text,
        user_id uuid references auth.users(id)
      `
    })
    if (albumsError) throw albumsError

    // Create songs table if it doesn't exist
    const { error: songsError } = await supabase.rpc('create_table_if_not_exists', {
      p_table_name: 'songs',
      p_column_definitions: `
        id uuid default uuid_generate_v4() primary key,
        title text not null,
        album_id uuid references albums(id),
        file_path text,
        user_id uuid references auth.users(id)
      `
    })
    if (songsError) throw songsError

    console.log('Database setup completed successfully')
  } catch (error) {
    console.error('Error setting up database:', error)
    throw error
  }
}