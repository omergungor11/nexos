# Tech Stack

## Runtime
- Node.js 20 LTS
- Package manager: pnpm 9+

## Frontend
- Framework: Next.js 15 (App Router, Server Components)
- UI Library: shadcn/ui + Radix UI primitives
- Styling: Tailwind CSS v4
- State: TanStack Query v5 (server state) + Zustand (client state)
- Forms: react-hook-form + zod validation
- Maps: Leaflet (react-leaflet) — dynamic import, no SSR
- Rich Text Editor: TipTap (admin only)
- Carousel: embla-carousel-react
- DnD: dnd-kit (image reorder)
- Icons: Lucide React

## Backend / BaaS
- Supabase (PostgreSQL 15+, Auth, Storage, Realtime, Edge Functions)
- Language: TypeScript 5.x (strict mode)
- Validation: zod
- Email: Resend (via Supabase Edge Functions)
- Rate Limiting: Upstash Redis (contact form)

## Database
- Primary: PostgreSQL 15+ (via Supabase)
- Full-text search: Turkish tsvector
- Cache: Upstash Redis (rate limiting, currency rates)

## SEO
- Next.js Metadata API (generateMetadata)
- next-sitemap
- @vercel/og (dynamic OG images)
- JSON-LD structured data

## Infrastructure
- Hosting: Vercel (Edge Network, fra1 region)
- Database: Supabase Cloud
- Storage: Supabase Storage (public buckets)
- CI/CD: Vercel Git Integration
- Analytics: Vercel Analytics + Speed Insights

## Testing
- E2E: Playwright
- Linting: ESLint (next/core-web-vitals)
- Formatting: Prettier
- Git Hooks: Husky + lint-staged
