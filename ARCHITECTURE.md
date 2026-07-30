# Architecture note

## Product slice

Ajaia Docs is a intentionally narrow Google Docs–inspired editor: create and edit rich text, import text files, share with another user, and persist across refresh. Real-time collaboration, comments, and version history were cut so the core path could be deep and demoable within a short timebox.

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| App | Next.js (App Router) + TypeScript | One codebase for UI + API, fast to deploy |
| Editor | TipTap (ProseMirror) | Solid rich-text primitives without building an editor |
| Auth | JWT session cookie (`jose`) + bcrypt | Enough for multi-user sharing demos without OAuth complexity |
| DB | Prisma + SQLite | Zero-cost local persistence; easy to swap to Postgres for hosting |
| Validation | Zod | Clear API input errors |
| Tests | Vitest | Fast unit coverage for access rules and import helpers |

## Data model

- **User** — seeded accounts for Alice, Bob, Charlie
- **Document** — `title`, TipTap JSON `content`, `ownerId`
- **DocumentShare** — unique `(documentId, userId)` with `viewer` or `editor` role

Access resolution:

1. Owner → full read / write / share / delete
2. Shared editor → read / write
3. Shared viewer → read only
4. Otherwise → denied (404 to avoid leaking existence where practical)

## Key flows

1. **Editing** — TipTap JSON is stored as a string. Autosave (~1.2s after changes) plus manual Save.
2. **Import** — `.txt` / `.md` only. File text is lightly mapped into paragraphs, headings, and lists, then stored as TipTap JSON.
3. **Sharing** — owners add access by email against seeded users; dashboard splits **Owned by you** vs **Shared with you**.

## Prioritization

**Done deeply:** editing UX, persistence of formatting, share semantics, clear upload limits, seeded review path.

**Deferred:** realtime CRDT sync, non-user email invites, binary Office formats, offline mode, folders/search.

## What I would build next (2–4 hours)

1. Deployed Postgres-backed URL with CI smoke test
2. Presence indicators (who is viewing) without full CRDT merge
3. Markdown export
4. Simple revision snapshots on each save
