# Submission checklist

## Included in this folder

- [x] Source code (`src/`, `prisma/`, config)
- [x] `README.md` — local setup and run instructions
- [x] `ARCHITECTURE.md` — prioritization and design
- [x] `AI_WORKFLOW.md` — AI usage note
- [x] `SUBMISSION.md` — this file
- [x] `WALKTHROUGH_URL.txt` — walkthrough video URL (placeholder until recorded)
- [x] `samples/sprint-notes.md` — demo import file
- [x] Automated tests (`tests/access.test.ts`)

## Links to fill before Google Drive handoff

| Item | Value |
|------|-------|
| Live product URL | https://ajaia-docs.azurewebsites.net |
| Walkthrough video | Local MP4 at `walkthrough/Ajaia-Docs-Walkthrough.mp4` — upload unlisted and paste URL in `WALKTHROUGH_URL.txt` |
| Google Drive folder | _TODO_ |

## Reviewer credentials

- `alice@demo.com` / `demo1234`
- `bob@demo.com` / `demo1234`
- `charlie@demo.com` / `demo1234`

## Working vs incomplete

### Working
- Document create, rename, rich-text edit, autosave, reopen
- `.txt` / `.md` import
- Owner + share (viewer/editor), owned vs shared lists
- SQLite persistence
- Basic validation/errors
- Unit tests for access + import helpers

### Incomplete / not started
- Public deployed URL (needs your deploy step)
- Walkthrough video recording
- Realtime collaboration, comments, version history, `.docx`/PDF

### With another 2–4 hours
- Hosted Postgres deployment + seed on host
- Presence indicators
- Markdown export and/or save snapshots
