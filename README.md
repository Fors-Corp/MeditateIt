# MeditateIt

Local-first generative meditation soundscapes (noise, solfeggio, binaural/isochronic). Web MVP on Vite + React + TypeScript with PWA install support.

## Run

```bash
cd ~/Documents/MeditateIt
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

Other scripts:

```bash
npm run build    # typecheck + production build
npm run preview  # serve the production build (needed to verify the service worker)
npm run lint     # oxlint
```

## PWA

Production builds register a service worker via `vite-plugin-pwa` (`registerType: autoUpdate`).

To verify installability locally:

1. `npm run build && npm run preview`
2. Open the preview URL over `http://localhost…` (Chromium treats localhost as a secure context)
3. DevTools → Application → Manifest / Service Workers
4. Chrome/Edge address bar → Install app (or App menu → Install MeditateIt)

Name: **MeditateIt**. Icons live in `public/icons/` (192 / 512).

## App routes

- `/` — home with quick start, custom, system sequences, system + saved user presets
- `/session` and `/session/:presetId` — live session player (save preset from the session header)
- `/sequence/:sequenceId` — multi-stage sequence player (auto-advance + crossfade; pause freezes the stage timer)

## Notes

- Prefs and user presets persist in `localStorage` only (no accounts).
- No GitHub remote is required for local MVP work. Do not push unless a remote is added on purpose.
- Product plan lives in the MeditateIt Project store (`docs/meditation-app-plan.md`).
