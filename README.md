# Bolt Hackathon - Lease Tracking System

A React + TypeScript lease tracking application with Supabase backend and Clerk authentication.

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Clerk Domain (required for Supabase + Clerk integration)
CLERK_DOMAIN=your-production-domain.clerk.accounts.dev
```

## Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start Supabase locally (optional for local development):
   ```bash
   pnpm run supabase:start
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

## Database Setup

The project uses Supabase with the following schema:
- **projects**: Main lease tracking projects
- **project_contacts**: Client contacts for each project
- **client_requirements**: Categorized requirements per project
- **project_roadmap**: Project phases and milestones
- **properties**: Properties of interest for each project
- **property_features**: Features for each property
- **project_documents**: Documents associated with projects
- **project_updates**: Activity log for each project

### Remote Database Setup (Already Done)

The remote database has been linked and reset with migrations applied. To update seed data with correct user IDs:

1. Connect to your remote database
2. Update the `clerk_user_id` in the projects table:
   ```sql
   UPDATE projects 
   SET clerk_user_id = 'your_actual_clerk_user_id' 
   WHERE clerk_user_id = 'user_2yHntOGKi6N4kXscdHcJrYjEpWN';
   ```

## Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard or via CLI:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_CLERK_PUBLISHABLE_KEY
   ```

**Important Notes for Production:**

- **CLERK_DOMAIN**: **Required** for Supabase + Clerk integration. Use your production Clerk domain (e.g., `your-app.clerk.accounts.dev` or your custom domain)
- **VITE_CLERK_PUBLISHABLE_KEY**: Make sure to use your **production** Clerk publishable key (starts with `pk_live_` instead of `pk_test_`)
- **Supabase URLs**: Use your remote Supabase project URL, not the local development URL

### Option 2: Netlify

1. Build the project:
   ```bash
   pnpm run build
   ```

2. Deploy the `dist` folder to Netlify

3. Set environment variables in Netlify dashboard

### Option 3: Manual Build

1. Build the project:
   ```bash
   pnpm run build
   ```

2. Serve the `dist` folder with any static hosting service

## Technologies Used

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Deployment**: Vercel/Netlify ready

## Project Structure

```
src/
├── components/           # React components
├── lib/                 # Utility libraries (Supabase client)
└── assets/              # Static assets

supabase/
├── migrations/          # Database migrations
├── seed.sql            # Sample data
└── config.toml         # Supabase configuration
```