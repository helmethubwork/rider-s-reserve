# Helmet Hub

E-commerce platform for premium motorcycle gear.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Storage)

## Development

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

## Production Build

```sh
npm run build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

Deployed via Vercel with GitHub integration.

Required environment variables in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
