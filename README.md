# Ajaia Docs

Lightweight collaborative document editor built for the Ajaia AI-Native Full Stack Developer assignment.

Users can create and rename documents, edit rich text in the browser, import `.txt` / `.md` files, share documents with seeded teammates, and reopen everything after refresh.

## Live product URL

**https://ajaia-docs.azurewebsites.net**

Deployed on Azure App Service (`ajaia-docs` / `ajaia-docs-rg`, West Europe).

## Source repository

**https://github.com/PadowanWeb/ajaia-docs**

## Seeded demo accounts

| Email | Password | Notes |
|-------|----------|-------|
| `alice@demo.com` | `demo1234` | Owns the welcome doc; good starting owner |
| `bob@demo.com` | `demo1234` | Already has editor access to Alice's welcome doc |
| `charlie@demo.com` | `demo1234` | No shares by default — use to test access denial |

## What works

- Create / rename / rich-text edit / autosave / reopen
- Formatting: bold, italic, underline, H1/H2, bullet & numbered lists
- Import `.txt` or `.md` (max 1 MB) into a new editable document
- Owner / editor / viewer sharing with Owned vs Shared lists
- SQLite persistence via Prisma
- Validation and basic error handling
- Automated access + import helper tests (`npm test`)

## Intentionally deprioritized

- Real-time multiplayer cursors / CRDTs
- Comments / suggestion mode
- Version history
- `.docx` import / PDF export
- Enterprise SSO or email invites to non-seeded users

## Local setup

Requirements: Node.js 20+ and npm.

```bash
cd "D:\SourceCode\Ajaia Assessment"
npm run setup
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (port **3001** by default so it does not clash with other local apps on 3000).

### Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run setup` | Install, generate Prisma client, push schema, seed users |
| `npm run db:setup` | Reset schema + seed only |
| `npm run dev` | Start Next.js locally |
| `npm test` | Run Vitest suite |
| `npm run build` | Production build |

### Environment

Copy `.env.example` to `.env` if needed:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-long-random-string"
```

SQLite file is created at `prisma/dev.db` (path is relative to the `prisma` folder when using `file:./dev.db`).

## Demo flow (5 minutes)

1. Sign in as Alice.
2. Open **Welcome to Ajaia Docs**, edit formatting, rename, refresh — content persists.
3. Import `samples/sprint-notes.md`.
4. Share that doc with `bob@demo.com` as editor.
5. Sign out, sign in as Bob — see it under **Shared with you**.
6. Sign in as Charlie and confirm a private Alice doc is inaccessible.

## Deployment notes

This local build uses SQLite. Serverless hosts like Vercel need a remote DB (Neon Postgres free tier works well):

1. Create a Neon database and set `DATABASE_URL` + `AUTH_SECRET` in the host env.
2. Change Prisma `provider` to `postgresql` in `prisma/schema.prisma` (or keep a Postgres branch).
3. Run `npx prisma db push && npm run db:seed` against the remote DB.
4. Deploy the Next.js app.

For a same-day SQLite-friendly host, Railway or Render with a persistent disk also works without schema changes.

## Docs in this repo

- `ARCHITECTURE.md` — stack, model, prioritization
- `AI_WORKFLOW.md` — how AI was used
- `SUBMISSION.md` — deliverables checklist
- `WALKTHROUGH_URL.txt` — video link placeholder
- `samples/sprint-notes.md` — sample import file
