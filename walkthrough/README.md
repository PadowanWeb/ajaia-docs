# Walkthrough video

## Deliverable

`walkthrough/Ajaia-Docs-Walkthrough.mp4` (~3:53)

- Screen recording of the live Azure app
- AI voiceover (Windows TTS — Microsoft Zira)
- Covers create/edit/save, import, sharing, prioritization, stack, and AI usage

## Upload for submission

1. Open [YouTube Studio](https://studio.youtube.com) or [Loom](https://www.loom.com)
2. Upload `walkthrough/Ajaia-Docs-Walkthrough.mp4`
3. Set visibility to **Unlisted**
4. Paste the link into `WALKTHROUGH_URL.txt` and `SUBMISSION.md`

## Regenerate locally

```bash
cd "D:\SourceCode\Ajaia Assessment"
node walkthrough/record.mjs
# then remux with ffmpeg using narration.wav (see scripts used in session)
```

Script text: `WALKTHROUGH_SCRIPT.md` and `walkthrough/narration.txt`
