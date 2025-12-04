# Multiple Apps

A **multi-activity learning app** built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Supabase for authentication and data persistence. Contains 5 independent activities sharing a common auth layer.

## Tech Stack

- **Next.js 16.0.6** - App Router with Server Components
- **React 19.2.0** - Latest React
- **Tailwind CSS v4** - Modern CSS framework
- **TypeScript 5** - Strict mode enabled
- **Supabase** - Auth, PostgreSQL database, and file storage
- **Drizzle ORM** - Type-safe database queries and migrations
- **Zod** - Schema validation and type inference
- **shadcn/ui** - UI component library (Radix primitives + Tailwind)
- **Lucide React** - Icon library

## Activities

| Route | Activity | Description |
|-------|----------|-------------|
| `/todo` | To-Do List | CRUD todos per user |
| `/drive` | Google Drive Lite | CRUD photos with search/sort |
| `/food` | Food Review | CRUD photos + nested reviews |
| `/pokemon` | Pokemon Review | Search Pokemon API + CRUD reviews |
| `/notes` | Markdown Notes | CRUD notes with raw/preview modes |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with auth provider
│   ├── page.tsx                # Index (login or activity list)
│   └── (activities)/           # Route group for shared activity layout
│       ├── layout.tsx          # Shared layout with header navigation
│       ├── todo/               # To-Do List activity
│       ├── drive/              # Google Drive Lite activity
│       ├── food/               # Food Review activity
│       ├── pokemon/            # Pokemon Review activity
│       └── notes/              # Markdown Notes activity
├── components/
│   ├── auth/                   # Authentication components
│   ├── layout/                 # Header, navigation components
│   ├── shared/                 # Reusable components across activities
│   ├── ui/                     # shadcn/ui components
│   └── [activity]/             # Activity-specific components
└── lib/
    ├── actions/                # Server Actions
    ├── db/                     # Drizzle ORM setup and schema
    └── supabase/               # Supabase client configuration
```

## Database Schema

The app uses the following data models with Drizzle ORM:

- **Users** - User accounts (synced with Supabase Auth)
- **Todos** - To-do items per user
- **Photos** - Photo uploads for Drive activity
- **Food Photos** - Food photo uploads with reviews
- **Food Reviews** - Reviews for food photos
- **Pokemon** - Saved Pokemon from PokeAPI
- **Pokemon Reviews** - Reviews for saved Pokemon
- **Notes** - Markdown notes per user

All tables include `user_id` for data ownership and RLS.

## Authentication

The app uses Supabase Auth with email/password authentication:

- **Login** - Email and password authentication
- **Logout** - Clear session and redirect to login
- **Delete Account** - Remove user and all associated data

## License

MIT
