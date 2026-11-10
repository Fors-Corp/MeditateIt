/**
 * Tiny FOUC / lang guard — runs before the module graph.
 * Theme: reads meditateit:prefs:v1.themeId when present; else prefers-color-scheme.
 * Locale: explicit prefs.locale when supported; else navigator.languages → en|es|ca|fr|pt.
 * CSP: external file only (script-src 'self').
 */
;(function () {
  var KNOWN = { light: 1, dark: 1, dusk: 1, mist: 1, forest: 1 }
  var LOCALES = { en: 1, es: 1, ca: 1, fr: 1, pt: 1 }
  var COLORS = {
    light: '#e4efe9',
    dark: '#121a18',
    dusk: '#1a2230',
    mist: '#d8e2e8',
    forest: '#e6ebe4',
  }
  var id = null
  var lang = null
  try {
    var raw = localStorage.getItem('meditateit:prefs:v1')
    if (raw) {
      var prefs = JSON.parse(raw)
      if (prefs && typeof prefs.themeId === 'string' && KNOWN[prefs.themeId]) {
        id = prefs.themeId
      }
      if (prefs && typeof prefs.locale === 'string' && LOCALES[prefs.locale]) {
        lang = prefs.locale
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
  if (!lang) {
    var list =
      (navigator.languages && navigator.languages.length
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : []) || []
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i] || '')
        .trim()
        .toLowerCase()
        .replace('_', '-')
      if (!tag) continue
      if (LOCALES[tag]) {
        lang = tag
        break
      }
      var base = tag.split('-')[0]
      if (LOCALES[base]) {
        lang = base
        break
      }
    }
  }
  document.documentElement.setAttribute('data-theme', id)
  document.documentElement.lang = lang || 'en'
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', COLORS[id] || COLORS.light)
})()
