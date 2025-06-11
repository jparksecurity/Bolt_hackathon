# Bolt Hackathon - JIGO Dash

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
- **projects**: Main lease tracking projects (includes public sharing functionality)
- **project_contacts**: Client contacts for each project
- **client_requirements**: Categorized requirements per project
- **project_roadmap**: Project phases and milestones
- **properties**: Properties of interest for each project
- **property_features**: Features for each property
- **project_documents**: Documents associated with projects
- **project_updates**: Activity log for each project

### Database Migration

Apply the complete schema using the consolidated migration file:

1. **Using Supabase CLI** (if available):
   ```bash
   supabase db push
   ```

2. **Using Supabase Dashboard**:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `supabase/migrations/00_complete_schema.sql`
   - Execute the migration

### What the Migration Includes

The consolidated migration sets up:

1. **Core Tables**: All lease tracking tables with proper relationships
2. **Row Level Security (RLS)**: Multi-tenant security policies
3. **Optimized Indexes**: Performance-optimized database indexes
4. **Storage Setup**: Document storage bucket with proper permissions
5. **Public Sharing**: Functions and permissions for read-only project sharing
6. **Anonymous Access**: Secure functions for public project viewing

### Remote Database Setup (Already Done)

The remote database has been linked and reset with migrations applied. To update seed data with correct user IDs:

1. Connect to your remote database
2. Update the `clerk_user_id` in the projects table:
   ```sql
   UPDATE projects 
   SET clerk_user_id = 'your_actual_clerk_user_id' 
   WHERE clerk_user_id = 'user_2yHntOGKi6N4kXscdHcJrYjEpWN';
   ```

## Public Project Sharing

The system includes a public sharing feature that allows project owners to generate shareable links for read-only access.

### How to Use Public Sharing

1. **For Project Owners**:
   - Navigate to any project page (`/projects/:id`)
   - Click the "Copy Public Link" button in the header
   - Share the generated URL with clients or stakeholders

2. **For Public Viewers**:
   - Visit the shared URL (e.g., `https://yourapp.com/share/{shareId}`)
   - View project details, updates, properties, roadmap, and documents in read-only mode
   - Download documents (if available)

### Security Features

- **Read-only Access**: Public viewers cannot edit or modify any data
- **Selective Sharing**: Only projects with generated share IDs are accessible publicly
- **Secure Functions**: Database functions use `SECURITY DEFINER` to bypass RLS safely
- **No Authentication Required**: Public links work without user accounts
- **Non-guessable URLs**: Public URLs use UUIDs for security

### Revoking Public Access

To revoke public access to a project:

```sql
UPDATE projects 
SET public_share_id = NULL 
WHERE id = 'your-project-id';
```

## Deployment

### Netlify (Primary Deployment)

1. Build the project:
   ```bash
   pnpm run build
   ```

2. Deploy the `dist` folder to Netlify

3. Set environment variables in Netlify dashboard

**Important Notes for Production:**

- **CLERK_DOMAIN**: **Required** for Supabase + Clerk integration. Use your production Clerk domain (e.g., `your-app.clerk.accounts.dev` or your custom domain)
- **VITE_CLERK_PUBLISHABLE_KEY**: Make sure to use your **production** Clerk publishable key (starts with `pk_live_` instead of `pk_test_`)
- **Supabase URLs**: Use your remote Supabase project URL, not the local development URL

### Alternative: Manual Build

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
- **Deployment**: Netlify

## Project Structure

```
src/
├── components/           # React components
│   ├── PublicProjectPage.tsx       # Main public sharing page
│   ├── PublicProjectHeader.tsx     # Read-only header
│   ├── PublicRecentUpdates.tsx     # Public updates view
│   ├── PublicPropertiesOfInterest.tsx
│   ├── PublicProjectRoadmap.tsx
│   └── PublicProjectDocuments.tsx
├── lib/                 # Utility libraries (Supabase client, public API)
├── assets/              # Static assets
│   └── design/          # Logo and design assets
├── App.tsx              # Main application component
└── main.tsx             # Application entry point

supabase/
├── migrations/          # Database migrations
│   └── 00_complete_schema.sql  # Consolidated migration file
├── seed.sql            # Sample data
└── config.toml         # Supabase configuration

Configuration files:
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```