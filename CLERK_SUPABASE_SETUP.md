# Clerk + Supabase Integration Setup

## Overview
Your project is now configured to use Clerk for authentication with Supabase as the database backend. This setup uses the new Third-Party Auth integration which is more secure than the deprecated JWT template approach.

## Prerequisites

Before this setup works, you need to configure your Clerk instance:

1. **Visit Clerk's Connect with Supabase page**: Go to [https://dashboard.clerk.com/setup/supabase](https://dashboard.clerk.com/setup/supabase)
2. **Configure your Clerk instance** for Supabase compatibility
3. **Add the `role` claim** to Clerk session tokens with the value `authenticated` for end-users

## Environment Variables

Create a `.env` file in your project root:

```bash
# Supabase Local Development
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

## Configuration Files

### Supabase Configuration
The Clerk integration is enabled in `supabase/config.toml`:

```toml
[auth.third_party.clerk]
enabled = true
domain = "holy-feline-92.clerk.accounts.dev"
```

## How It Works

### Authentication Flow
1. **Clerk handles authentication**: Users sign in/up through Clerk
2. **Clerk session tokens**: Include the required `role` claim
3. **Supabase recognizes tokens**: Automatically validates Clerk tokens
4. **RLS policies work**: Based on claims in the Clerk session token

### Custom Supabase Hook
The `useSupabaseClient()` hook automatically:
- Gets the current Clerk session token
- Injects it into Supabase requests
- Maintains authentication state

```typescript
import { useSupabaseClient } from './hooks/useSupabaseClient'

function MyComponent() {
  const supabase = useSupabaseClient()
  
  // Use supabase normally - authentication is handled automatically
  const { data } = await supabase.from('todos').select('*')
}
```

## Example Usage

### Basic Authentication Check
```typescript
import { useUser } from '@clerk/clerk-react'

function MyComponent() {
  const { isSignedIn, user } = useUser()
  
  if (!isSignedIn) {
    return <SignInButton />
  }
  
  return <div>Hello {user.firstName}!</div>
}
```

### Database Operations with RLS
```typescript
import { useSupabaseClient } from './hooks/useSupabaseClient'
import { useUser } from '@clerk/clerk-react'

function TodoList() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  
  // This will automatically filter by user due to RLS policies
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
  
  // Insert will automatically use the user's Clerk ID
  const { error } = await supabase
    .from('todos')
    .insert({ title: 'New todo', user_id: user.id })
}
```

## Row Level Security Policies

Your RLS policies can use Clerk session token claims:

```sql
-- Example: Users can only see their own todos
CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- Example: Check organization role (if using Clerk Organizations)
CREATE POLICY "Org admins can manage data" ON sensitive_table
  FOR ALL USING (
    auth.jwt() ->> 'org_role' = 'org:admin'
  );
```

### 🚀 Performance Optimization

**Important**: Your RLS policies are optimized for performance using the `(SELECT auth.jwt())` pattern:

```sql
-- ❌ SLOW - Re-evaluates for each row
CREATE POLICY "Users access their projects" ON projects
  FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');

-- ✅ FAST - Evaluates once per query
CREATE POLICY "Users access their projects" ON projects
  FOR ALL USING (clerk_user_id = (SELECT auth.jwt() ->> 'sub'));
```

**Why this matters:**
- **Without SELECT**: `auth.jwt()` is called for every single row
- **With SELECT**: `auth.jwt()` is called once and cached for the entire query
- **Performance impact**: 10x-100x faster on large datasets

Your schema uses the optimized pattern throughout for maximum performance at scale.

## Available Scripts

- `npm run dev` - Start development server
- `npm run supabase:start` - Start Supabase locally
- `npm run supabase:stop` - Stop Supabase
- `npm run supabase:status` - Check Supabase status
- `npm run supabase:studio` - Open database studio

## Components

### ClerkSupabaseExample
Check out `src/components/ClerkSupabaseExample.tsx` for a complete example showing:
- Clerk authentication (Sign In/Up/Out)
- Supabase database operations
- RLS policy enforcement
- Real-time UI updates

## Local Services URLs

- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323
- **Inbucket** (Email testing): http://127.0.0.1:54324

## Deployment Checklist

When ready to deploy:

1. **Configure production Clerk instance**:
   - Add your production domain
   - Configure Supabase integration

2. **Deploy Supabase project**:
   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

3. **Update environment variables**:
   - `VITE_SUPABASE_URL` → Your production Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → Your production anon key
   - `VITE_CLERK_PUBLISHABLE_KEY` → Your production Clerk key

4. **Configure Supabase dashboard**:
   - Add Clerk Third-Party Auth integration
   - Set domain to your production Clerk domain

## Troubleshooting

### Common Issues

1. **"Invalid JWT" errors**: 
   - Ensure Clerk session tokens include the `role` claim
   - Check that your Clerk instance is configured for Supabase

2. **RLS policy blocks**: 
   - Verify your policies use the correct user ID field
   - Check that Clerk user IDs match your database user_id columns

3. **Development setup**:
   - Make sure Supabase is running: `npm run supabase:status`
   - Check your `.env` file has the correct local URLs

## Security Notes

- Session tokens are automatically refreshed by Clerk
- No JWT secrets are shared between services (more secure than deprecated approach)
- RLS policies provide database-level security
- Tokens include user identity and organization claims for fine-grained access control 