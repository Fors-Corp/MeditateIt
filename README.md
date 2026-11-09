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

Production builds register a service worker via `vite-plugin-pwa` (`registerType: autoUpdate`). The SW precaches the app shell (HTML/JS/CSS/icons/manifest) and `public/worklets/noise-processor.js`; Google Fonts are runtime-cached after the first online visit.

To verify installability locally:

1. `npm run build && npm run preview`
2. Open the preview URL over `http://localhost…` (Chromium treats localhost as a secure context)
3. DevTools → Application → Manifest / Service Workers
4. Chrome/Edge address bar → Install app (or App menu → Install MeditateIt)

### Offline shell

1. `npm run build && npm run preview`
2. Load the preview URL once while online (lets the SW install + precache)
3. DevTools → Application → Service Workers → check “Offline”, or Network → Offline
4. Hard-reload — `/` and client routes should still render from the precache (`navigateFallback: /index.html`)
5. Start a noise/nature session — audio is generative (no media downloads); worklet JS must come from the precache

Name: **MeditateIt**. Icons live in `public/icons/` (192 / 512).

## Background audio / lock-screen limits

MeditateIt is a web app (installable PWA), not a native player. Expect platform limits:

- **Tab background / screen lock:** many mobile browsers suspend or throttle `AudioContext` when the page is hidden. Installed PWAs + Media Session metadata/handlers improve lock-screen controls where the OS allows them, but they do not guarantee uninterrupted playback (especially iOS Safari / WebKit).
- **Autoplay:** the first `audioEngine.start()` must follow a user gesture.
- **Headphones:** binaural mode needs stereo headphones; isochronic is speaker-safe.
- **Long sessions:** keep the session page open; do not rely on the OS to keep a hidden web tab alive overnight.

Native shells (Capacitor, etc.) are out of scope for this wave.

## App routes

- `/` — home with quick start, custom, system sequences, system + saved user presets, recent sessions
- `/settings` — export/import JSON backup (merge or replace) + full session history
- `/session` and `/session/:presetId` — live session player (save preset from the session header)
- `/sequence/:sequenceId` — multi-stage sequence player (auto-advance + crossfade; pause freezes the stage timer)

## Backup & history

Prefs, user presets, and session history live in `localStorage` only (no accounts).

```ts
import {
  exportBackup,
  importBackup,
  downloadBackup,
  listSessionHistory,
  appendSessionRecord,
  type BackupDocument,
  type SessionRecord,
} from './storage'
```

- **Export** downloads a `meditateit-backup` v1 JSON (prefs + user presets + history; empty `sequences` reserved for Wave 3 sequences).
- **Import** supports `merge` (presets/history by id; prefs fields from file win) or `replace` (overwrite prefs + user presets; history replaced when present in the file).
- **Session history** appends on stop / leave while playing (skips sub-second taps); newest first, capped at 100.

## Notes

- Prefs, user presets, and session history persist in `localStorage` only (no accounts).
- No GitHub remote is required for local MVP work. Do not push unless a remote is added on purpose.
- Product plan lives in the MeditateIt Project store (`docs/meditation-app-plan.md`).
