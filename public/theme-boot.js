/**
 * Tiny FOUC guard — runs before the module graph.
 * Reads meditateit:prefs:v1.themeId when present; otherwise prefers-color-scheme.
 * CSP: external file only (script-src 'self').
 */
;(function () {
  var KNOWN = { light: 1, dark: 1, dusk: 1, mist: 1, forest: 1 }
  var COLORS = {
    light: '#e4efe9',
    dark: '#121a18',
    dusk: '#1a2230',
    mist: '#d8e2e8',
    forest: '#e6ebe4',
  }
  var id = null
  try {
    var raw = localStorage.getItem('meditateit:prefs:v1')
    if (raw) {
      var prefs = JSON.parse(raw)
      if (prefs && typeof prefs.themeId === 'string' && KNOWN[prefs.themeId]) {
        id = prefs.themeId
      }
    }
  } catch {
    /* ignore corrupt prefs */
  }
  if (!id) {
    id =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
  }
  document.documentElement.setAttribute('data-theme', id)
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', COLORS[id] || COLORS.light)
})()
