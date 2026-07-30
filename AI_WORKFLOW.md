# AI workflow note

## Tools used

- **Cursor (Composer agent)** — scaffolding, API routes, TipTap wiring, docs drafts
- **Manual review** — auth/session details, access control correctness, UX copy, scope cuts

## Where AI materially sped things up

- Next.js + Prisma + TipTap boilerplate and file layout
- Seed script and TipTap JSON sample content
- Share panel / dashboard UI structure
- First draft of README and architecture wording

## What I changed or rejected

- Rejected jumping to realtime/Yjs collaboration early — would burn the timebox without a solid save/share path
- Simplified auth to cookie JWT + seeded users instead of a heavier Auth.js/OAuth setup
- Kept upload limited to `.txt` / `.md` rather than chasing `.docx` parsers
- Tightened access helpers into testable pure functions instead of leaving logic only inside routes
- Adjusted UI toward a calm teal/slate product look rather than a generic purple “AI dashboard” aesthetic

## How correctness was verified

- `npm test` for access matrix + import helpers
- Manual login as Alice → edit → refresh → formatting preserved
- Import `samples/sprint-notes.md`
- Share with Bob → Bob sees under Shared; Charlie cannot open private docs
- Create / rename / delete owner flows
- Production `npm run build` after Prisma generate (run before submit)

AI accelerated scaffolding; product judgment, scope cuts, and verification stayed human-owned.
