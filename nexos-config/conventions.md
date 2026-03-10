# Code Conventions

## TypeScript
- Strict mode always enabled (`strict: true` in tsconfig)
- No `any` types — use `unknown` + type guards
- Interfaces for object shapes, types for unions/intersections
- Explicit return types on exported functions
- Use `satisfies` operator for type-safe object literals

## File Naming
- `kebab-case` for all files: `property-card.tsx`, `use-property-filters.ts`
- Component files: `PascalCase` export, `kebab-case` filename
- Hooks: `use-` prefix (`use-property-filters.ts`)
- Server Actions: `actions/` dizininde, fonksiyon adı verb ile başlar (`createProperty`, `deleteAgent`)
- Types: `types/` dizininde, dosya adı domain'e göre (`property.ts`, `agent.ts`)

## Component Rules
- Server Components varsayılan — `'use client'` sadece interaktif component'lerde
- Props interface'i component dosyasında tanımlanır, dışa export edilmez (gerekmedikçe)
- shadcn/ui primitives `components/ui/` altında
- Proje component'leri `components/{domain}/` altında

## API Design
- Response format: `{ data, meta? }` (meta = pagination bilgisi)
- Error format: `{ error: { code: string, message: string } }`
- HTTP status codes: 200, 201, 400, 401, 403, 404, 429, 500
- Rate limiting: 429 Too Many Requests

## Database
- Table names: snake_case, plural (`properties`, `blog_posts`)
- Column names: snake_case (`created_at`, `is_active`)
- Enum types: snake_case suffix `_enum` (`property_type_enum`)
- UUID for primary keys (except location tables: SERIAL)
- Soft delete yok — hard delete + RLS ile koruma

## Frontend Patterns
- Data fetching: Server Components'te doğrudan Supabase query, Client'ta TanStack Query
- URL state: useSearchParams ile filter sync (emlak sayfası)
- Optimistic updates: TanStack Query mutation with onMutate
- Loading states: Suspense + loading.tsx skeletons
- Error handling: error.tsx error boundaries

## Git
- Branch: `feat/TASK-XXX-description`, `fix/TASK-XXX-description`
- Commit: `feat(TASK-XXX): description` + `Co-Authored-By: Claude <noreply@anthropic.com>`
- PR'sız doğrudan main'e commit (tek geliştirici)
