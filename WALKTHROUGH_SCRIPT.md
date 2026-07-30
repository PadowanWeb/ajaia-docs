# Ajaia Docs — Walkthrough narration (target ~4:00)

## 0:00–0:25 — Opening
Hi — this is a short walkthrough of Ajaia Docs, a lightweight collaborative document editor I built for the Ajaia AI-native full-stack assignment.

The goal was not to recreate Google Docs. It was to ship a coherent product slice: create and edit rich text, import a file, share with another user, and persist everything across refresh.

## 0:25–1:40 — Create, edit, save
I'm signed in as Alice, one of three seeded demo accounts.

From the dashboard you can see Owned documents versus Shared with me — that distinction is intentional and visible.

I'll open the welcome document. The editor supports bold, italic, underline, headings, and lists. Changes autosave, and you can also save manually.

I'll rename the document, apply a bit of formatting, then refresh the page to show that title and structure persist.

## 1:40–2:20 — File import
Next, file upload. I limited support to .txt and .md — called out in the UI and README — to keep the import path reliable.

I'll import the sample sprint notes markdown file. That creates a new editable document from the file contents, including light heading and list mapping.

## 2:20–3:20 — Sharing
Sharing is owner-based. From this document I'll grant Bob editor access.

Then I'll sign out and sign in as Bob. The document appears under Shared with me, with a clear Shared badge, and Bob can edit.

Charlie has no access to Alice's private notes — that denial path is part of the demo.

## 3:20–3:50 — What I deprioritized
I intentionally cut realtime cursors, comments, version history, and docx or PDF export.

With more time I'd add hosted Postgres hardening, presence indicators, and markdown export — not before the core path was solid.

## 3:50–4:20 — Implementation and AI
Stack is Next.js, TipTap, Prisma with SQLite, and simple JWT cookie auth.

AI helped with scaffolding, TipTap wiring, and first-draft docs. I rejected early realtime work and overbuilt auth, then verified with tests, manual share flows, and the live Azure deployment.

That's the product slice — focused, demoable, and ready for reviewers at ajaia-docs.azurewebsites.net.
