# Krishiseva

Krishiseva is a React, TypeScript, Vite, Supabase, and Firebase web app for finding and booking local workers.

## Features

- Worker discovery by service and location
- Booking flow with dashboard views for users and workers
- Worker registration and admin verification
- Firebase authentication with Supabase-backed app data
- Location search and map views with Leaflet
- Responsive Tailwind CSS interface

## Tech Stack

- React 18, TypeScript, Vite
- Tailwind CSS and Radix UI primitives
- Firebase Auth
- Supabase database
- React Query
- Leaflet and React-Leaflet
- Zod validation

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Add your Supabase values to `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

4. Start development:

```bash
npm run dev
```

The app runs locally at the URL printed by Vite.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest |

## Supabase Seed Data

The optional seed script loads demo services, workers, bookings, and an admin account.

Set a service role key locally before running it:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/seedSupabase.mjs
```

Default demo admin:

- Email: `admin@krishiseva.local`
- Password: `Admin@12345!`

You can override it:

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=YourPassword123 node scripts/seedSupabase.mjs
```

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the GitHub repository in Vercel.
3. Use the default Vite settings:
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output directory: `dist`
4. Add these Vercel environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy.

`vercel.json` includes SPA rewrites so direct links such as `/workers` and `/dashboard` work after deployment.

## Project Structure

```text
src/
  components/      Reusable React components
  contexts/        Auth context
  data/            Demo and fallback data
  hooks/           Custom hooks
  integrations/    Firebase and Supabase clients
  lib/             Utilities, constants, validation, helpers
  pages/           Route pages
public/            Static assets
scripts/           Supabase seed script
```

## Git Notes

The repository should commit `package-lock.json` for reproducible Vercel installs. Do not commit `.env`, `node_modules`, or `dist`.
