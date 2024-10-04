import { supabase, createTableCreationFunction } from '../supabaseClient'

async function retryOperation(operation, maxRetries = 3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await operation();
      return;
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries >= maxRetries) {
        console.error('Max retries reached. Operation failed.');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries))); // Exponential backoff
    }
  }
}

export async function setupDatabase() {
  const createTableIfNotExists = async (tableName: string, columns: string) => {
    await retryOperation(async () => {
      const { error } = await supabase.rpc('create_table_if_not_exists', {
        p_table_name: tableName,
        p_column_definitions: columns
      });

      if (error) {
        throw error;
      }

      console.log(`Table ${tableName} created successfully or already exists`);
    });
  };

  try {
    // Ensure the table creation function exists
    await createTableCreationFunction();

    // Create tables
    await createTableIfNotExists('user_profiles', `
      id uuid references auth.users(id) primary key,
      username text,
      bio text
    `);

    await createTableIfNotExists('artists', `
      id uuid default uuid_generate_v4() primary key,
      name text not null,
      user_id uuid references auth.users(id)
    `);

    await createTableIfNotExists('albums', `
      id uuid default uuid_generate_v4() primary key,
      title text not null,
      artist_id uuid references artists(id),
      artwork_url text,
      user_id uuid references auth.users(id)
    `);

    await createTableIfNotExists('songs', `
      id uuid default uuid_generate_v4() primary key,
      title text not null,
      album_id uuid references albums(id),
      file_path text,
      user_id uuid references auth.users(id)
    `);

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}