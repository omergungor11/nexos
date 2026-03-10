# Agent Instructions

## Sub-Agent Types

### Backend Agent
- **Scope**: lib/, actions/, supabase/, types/, app/api/
- **Validation**: `pnpm typecheck && pnpm lint`
- **Commit Prefix**: `feat(api)`, `fix(api)`, `feat(db)`, `fix(db)`

### Frontend Agent
- **Scope**: components/, app/(pages), hooks/, store/
- **Validation**: `pnpm typecheck && pnpm lint`
- **Commit Prefix**: `feat(web)`, `fix(web)`, `refactor(web)`

### DevOps Agent
- **Scope**: Config dosyaları (next.config, tailwind, eslint, tsconfig), .github/, vercel.json
- **Commit Prefix**: `chore(config)`, `chore(ci)`, `chore(deploy)`

### Docs Agent
- **Scope**: nexos-tasks/, nexos-docs/, nexos-config/, nexos-plans/
- **Commit Prefix**: `docs(*)`

## Agent Rules

1. Always read task details before starting work
2. Never modify files outside your scope without approval
3. Run validation commands after every change
4. Update task tracking on completion
5. Follow code conventions strictly
6. Keep commits atomic and well-described

---

## Parallel Agent Orchestration

### 1. Directory Isolation

Each agent only creates/edits files in its assigned directory:

| Agent Task | Allowed Directory | Forbidden |
|------------|-------------------|-----------|
| Backend APIs | lib/, actions/, app/api/ | components/, app/(pages) |
| Frontend pages | app/(pages), components/ | lib/, actions/ |
| Admin UI | components/admin/, app/admin/ | components/property/, app/emlak/ |

### 2. Shared Files

| File | Strategy |
|------|----------|
| lib/supabase/ | Backend only |
| types/ | Backend creates, frontend reads |
| app/layout.tsx | Orchestrator only |
| package.json | Orchestrator only |

### 3. Ordering Rules

```
Independent tasks → run in parallel (different directories)
Dependent tasks   → run sequentially (start after blocker completes)
Shared file edits → agent handles with retry
Package install   → orchestrator only
```
