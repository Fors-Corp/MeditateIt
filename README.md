# MeditateIt

Local-first generative meditation soundscapes (noise, solfeggio, binaural/isochronic). Web MVP on Vite + React + TypeScript; PWA later.

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
npm run preview  # serve the production build
npm run lint     # oxlint
```

## App shell (this scaffold)

- `/` — home with quick start / custom links
- `/session` and `/session/:presetId` — session route stubs
- Calm misty-lagoon CSS variables in `src/index.css` (no purple-on-white defaults)

## Ownership — do not deepen these as shell work

Sibling agents own the product guts. The scaffold only leaves stubs/exports:

| Path | Owner | Fill in |
|------|--------|---------|
| `src/audio/**` | audio sibling | Web Audio engine, layers, limiter |
| `src/components/session/**` + session page | session UI sibling | live controls, timer, fades |
| `src/presets/**` | presets sibling | system + user recipes |
| `src/storage/**` | storage sibling | prefs / presets persistence |

Shell / routing / global styles stay with the app scaffold unless ownership moves.

## Notes

- No GitHub remote is configured by this scaffold. Do not push unless a remote is added on purpose.
- Product plan lives in the MeditateIt Project store (`docs/meditation-app-plan.md`).
