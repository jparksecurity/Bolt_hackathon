# Supabase Local Development Setup

## Overview
Your project is now set up with Supabase for local development. You can develop everything locally and later link to a remote project when ready to deploy.

## Environment Variables
Create a `.env` file in your project root with these values for local development:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

## Available Scripts

### Supabase Commands
- `npm run supabase:start` - Start Supabase local development
- `npm run supabase:stop` - Stop Supabase local development
- `npm run supabase:status` - Check status of local services
- `npm run supabase:reset` - Reset local database (applies migrations)
- `npm run supabase:studio` - Open Supabase Studio in browser

### Development
- `npm run dev` - Start Vite development server

## Local Services URLs
When Supabase is running locally, you can access:

- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323 (Database management UI)
- **Inbucket**: http://127.0.0.1:54324 (Email testing)

## Database Schema
The project includes example tables:
- `profiles` - User profile information
- `todos` - Example todo items with RLS

## Using Supabase in Your App

### Import the client
```typescript
import { supabase } from './lib/supabase'
```

### Authentication Example
```typescript
// Sign up
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Sign out
const { error } = await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Database Operations
```typescript
// Insert data
const { data, error } = await supabase
  .from('todos')
  .insert([
    { title: 'Learn Supabase', user_id: user.id }
  ])

// Fetch data
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .eq('user_id', user.id)

// Update data
const { data, error } = await supabase
  .from('todos')
  .update({ is_complete: true })
  .eq('id', todoId)

// Delete data
const { data, error } = await supabase
  .from('todos')
  .delete()
  .eq('id', todoId)
```

## Creating Migrations
To create a new migration:
```bash
npx supabase migration new your_migration_name
```

## Linking to Remote Project (When Ready)
When you're ready to deploy:

1. Create a project on https://supabase.com
2. Link your local project:
   ```bash
   npx supabase link --project-ref your-project-ref
   ```
3. Push your local database to remote:
   ```bash
   npx supabase db push
   ```
4. Update your `.env` with production URLs and keys

## Row Level Security (RLS)
Your tables are set up with RLS policies to ensure users can only access their own data. This is automatically enforced when using the Supabase client with user authentication.

## Example Component
Check out `src/components/SupabaseExample.tsx` for a working authentication example. 