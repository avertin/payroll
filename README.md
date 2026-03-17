# Payroll

A Next.js app with TypeScript, App Router, shadcn/ui, Prisma (SQLite), ESLint, Prettier, and Jest.

## Getting started

### Prerequisites

- Node.js 22.5+
- npm

### First-time setup (after clone)

```bash
npm install
npm run db:generate   # generate Prisma client
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Install and run (later)

```bash
npm install
npm run dev
```

If you add or change models, run `npm run db:generate` then `npm run db:push`; run `npm run db:seed` to bootstrap data. See [Database (Prisma)](#database-prisma) below.

### Scripts

| Script                | Description                      |
| --------------------- | -------------------------------- |
| `npm run dev`         | Start dev server (Turbopack)     |
| `npm run build`       | Build for production             |
| `npm run start`       | Start production server          |
| `npm run lint`        | Run ESLint                       |
| `npm run format`      | Format code with Prettier        |
| `npm run test`        | Run Jest unit tests              |
| `npm run test:watch`  | Run Jest in watch mode           |
| `npm run db:generate` | Generate Prisma client           |
| `npm run db:push`     | Push schema to SQLite DB         |
| `npm run db:seed`     | Run seed script (bootstrap data) |
| `npm run db:studio`   | Open Prisma Studio               |

### Database (Prisma)

- **Schema and models**: `prisma/schema.prisma` (generator + datasource) and model files in `prisma/models/*.prisma`. After schema changes: `npm run db:generate` then `npm run db:push`.
- **Seeds**: Entrypoint is `prisma/seeds/seed.ts`. Add modules in `prisma/seeds/*.ts` (e.g. `users.ts` with `seedUsers()`), import and call them from `seed.ts` in dependency order. Run with `npm run db:seed`. Use upsert for idempotency; seed is blocked in production unless `ALLOW_SEED_IN_PRODUCTION=true`.
- **Backfills**: One-off scripts in `prisma/backfills/`. Run with `npx tsx prisma/backfills/<script>.ts`. Use `@/shared/db` (or relative path to `src/shared/db`). Prefer idempotent scripts; support `--dry-run` where useful.

### Tech stack

- **Next.js** (App Router), **TypeScript** (strict + `strictNullChecks`)
- **shadcn/ui** + **Tailwind CSS** for UI
- **Prisma** + **SQLite** for data (`DATABASE_URL` in `.env`; uses `@prisma/adapter-better-sqlite3`)
- **ESLint** (Next.js + extra rules to avoid functional mistakes)
- **Prettier** for formatting
- **Jest** + **React Testing Library** for unit tests

### Implementation notes

As you build features, you can keep notes in:

- **[docs/implementation.md](docs/implementation.md)** — implementation log and decisions (fill in as you go)

## Learn more

- [Next.js docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/docs)
- [Jest](https://jestjs.io/docs/getting-started)
