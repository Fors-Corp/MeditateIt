import type { Messages } from './en.ts'

/** Spanish (es) catalog — full key coverage mirroring en. */
export const es: Messages = {
  app: {
    brand: 'MeditateIt',
    skipToMain: 'Saltar al contenido principal',
    taglineHome: 'Paisajes sonoros generativos',
    taglineSettings: 'Ajustes',
    taglinePrivacy: 'Privacidad',
    taglineTerms: 'Términos',
    backHome: '← Volver al inicio',
    backHomeShort: 'Volver al inicio',
    homeLink: '← Inicio',
    privacy: 'Privacidad',
    terms: 'Términos',
    settings: 'Ajustes',
    disclaimer:
      'MeditateIt es una herramienta de sonido generativo para el bienestar personal y la concentración. No es un dispositivo médico y no está destinada a diagnosticar, tratar, curar ni prevenir ninguna afección.',
  },

  home: {
    eyebrow: 'Paisajes sonoros generativos',
    lede: 'Moldea ruido rosa, tonos y pulsos en vivo — empieza en calma en menos de treinta segundos.',
    quickStart: 'Inicio rápido',
    custom: 'Personalizado',
    settings: 'Ajustes',
    sequences: 'Secuencias',
    sequencesAside: 'Recorridos por etapas',
    yourSequences: 'Tus secuencias',
    recentSessions: 'Sesiones recientes',
    allAndBackup: 'Todo y copia',
    yourPresets: 'Tus preajustes',
    systemPresets: 'Preajustes del sistema',
    savedOnDevice: 'Guardado en este dispositivo',
    openEnded: 'Sin límite',
    delete: 'Eliminar',
    deleteConfirm: (name: string) =>
      `¿Eliminar el preajuste «${name}»? Esta acción no se puede deshacer.`,
    deleteSequenceConfirm: (name: string) =>
      `¿Eliminar la secuencia «${name}»? Esta acción no se puede deshacer.`,
    deleteAria: (name: string) => `Eliminar ${name}`,
    minutes: (m: number) => `${m} min`,
    replay: 'Repetir',
    sequenceTag: 'Secuencia',
    sequenceDuration: (m: number, stages: number) =>
      `${m} min · ${stages} etapas`,
    historySeconds: (s: number) => `${s}s`,
    historyMinutes: (m: number, s: number) =>
      s > 0 ? `${m}m ${s}s` : `${m}m`,
    historyHours: (h: number, m: number) =>
      m > 0 ? `${h}h ${m}m` : `${h}h`,
  },

  blurbs: {
    'daily-calm': 'Rosa apto para altavoz + 528 + pulso suave',
    sleep: 'Cama marrón profunda, lluvia suave, pulso ~2 Hz lento',
    focus: 'Rosa + 528 con pulso medio ~16 Hz',
    'anxiety-softener': 'Rosa suave + tono 396 Hz + pulso suave ~10 Hz',
    'deep-rest': 'Marrón sin límite + oleaje + tono bajo',
  },

  systemPresets: {
    'daily-calm': 'Calma diaria',
    sleep: 'Sueño',
    focus: 'Enfoque',
    'anxiety-softener': 'Calma suave',
    'deep-rest': 'Descanso profundo',
  },

  systemSequences: {
    'wind-down': {
      name: 'Bajar el ritmo',
      summary: 'Calma suave → cama rosa → sueño',
      stages: {
        'wd-1': 'Aterrizaje suave',
        'wd-2': 'Asentamiento rosa',
        'wd-3': 'Asentarse',
      },
    },
    'focus-block': {
      name: 'Bloque de enfoque',
      summary: 'Llegar en calma → enfoque → cierre suave',
      stages: {
        'fb-1': 'Llegar',
        'fb-2': 'Trabajo enfocado',
        'fb-3': 'Cierre suave',
      },
    },
    'deep-sleep-ramp': {
      name: 'Relajación nocturna',
      summary: 'Rosa → deslizamiento ~5 Hz → cama nocturna',
      stages: {
        'ds-1': 'Desenredo rosa',
        'ds-2': 'Deslizamiento ~5 Hz',
        'ds-3': 'Cama nocturna',
      },
    },
  },

  settings: {
    languageHeading: 'Idioma',
    languageLede:
      'Elige el idioma de MeditateIt en este dispositivo. Las fechas y horas siguen este idioma.',
    backupHeading: 'Copia de seguridad',
    backupLede:
      'Descarga o restaura preferencias, preajustes, secuencias e historial de sesiones como JSON. La exportación incluye escuchas terminadas por defecto. Sin cuenta: el archivo permanece en este dispositivo.',
    exportJson: 'Exportar JSON',
    importModeLegend: 'Modo de importación',
    mergeTitle: 'Combinar',
    mergeDetail:
      ' — conservar preajustes y secuencias existentes; los mismos ids se actualizan desde el archivo',
    replaceTitle: 'Reemplazar',
    replaceDetail:
      ' — sobrescribir preferencias, preajustes y secuencias; borrar el historial si el archivo no lo trae',
    keepHistoryWhenOmitted:
      'Conservar el historial existente si el archivo omite el historial',
    importJson: 'Importar JSON…',
    historyHeading: 'Historial de sesiones',
    clear: 'Vaciar',
    historyLede:
      'Escuchas terminadas en este dispositivo (se escriben al parar o salir de una sesión). Como máximo 100 entradas, más el límite de tiempo de abajo.',
    retention: 'Retención',
    historyEmpty: 'Aún no hay sesiones. Reproduce algo y luego para.',
    clearHistoryConfirm:
      '¿Vaciar todo el historial de sesiones en este dispositivo? Preferencias y preajustes se conservan.',
    historyCleared: 'Historial de sesiones vaciado.',
    eraseHeading: 'Borrar todos los datos',
    eraseLede:
      'Elimina preferencias, preajustes, secuencias, historial y la retención de este navegador. Exporta una copia antes si puedes necesitarla.',
    clearCachesToo:
      'También vaciar cachés sin conexión y anular el registro del service worker',
    eraseButton: 'Borrar todos los datos locales…',
    eraseConfirm:
      '¿Borrar todos los datos de MeditateIt en este dispositivo (preferencias, preajustes, secuencias, historial y retención)? Esta acción no se puede deshacer.',
    eraseConfirmWithCaches:
      '¿Borrar todos los datos de MeditateIt en este dispositivo (preferencias, preajustes, secuencias, historial y retención)? También vacía las cachés sin conexión y anula el service worker. Esta acción no se puede deshacer.',
    aboutHeading: 'Acerca de y legal',
    aboutLede:
      'MeditateIt es una herramienta de sonido generativo para el bienestar personal y la concentración. No es un dispositivo médico y no está destinada a diagnosticar, tratar, curar ni prevenir ninguna afección. Si tienes dudas de salud, consulta a un profesional cualificado.',
    exported: (presetCount, sequenceCount, sessionCount) =>
      `Exportados ${presetCount} preajuste${presetCount === 1 ? '' : 's'}, ${sequenceCount} secuencia${sequenceCount === 1 ? '' : 's'} y ${sessionCount} sesión${sessionCount === 1 ? '' : 'es'}.`,
    imported: (mode, presetCount, sequenceCount, historyCount) =>
      `Importación (${mode}): ${presetCount} preajuste${presetCount === 1 ? '' : 's'}, ${sequenceCount} secuencia${sequenceCount === 1 ? '' : 's'}, ${historyCount} entrada${historyCount === 1 ? '' : 's'} de historial.`,
    retentionUpdated: (label, kept) =>
      `Retención del historial: ${label.toLowerCase()}. ${kept} entrada${kept === 1 ? '' : 's'} conservada${kept === 1 ? '' : 's'}.`,
    erased: (keyCount) =>
      `Todos los datos locales de MeditateIt borrados (${keyCount} claves).`,
    erasedCaches: (swCount) =>
      ` Cachés vaciadas; ${swCount} service worker${swCount === 1 ? '' : 's'} anulado${swCount === 1 ? '' : 's'}.`,
    retentionForever: 'Conservar hasta el límite de cantidad (100)',
    retentionDays: (days) => `${days} días`,
  },

  dialogs: {
    savePresetTitle: 'Guardar preajuste',
    savePresetBody:
      'Guarda este paisaje sonoro en este dispositivo. No hace falta una cuenta.',
    saveSequenceTitle: 'Guardar secuencia',
    saveSequenceBody:
      'Guarda esta secuencia de varias etapas en este dispositivo. Las etapas conservan sus recetas para que la restauración sea autosuficiente.',
    name: 'Nombre',
    cancel: 'Cancelar',
    update: 'Actualizar',
    save: 'Guardar',
    saveAsNew: 'Guardar como nuevo',
    saving: 'Guardando…',
    headphonesTitle: 'Se necesitan auriculares',
    headphonesBody:
      'El modo binaural reproduce tonos ligeramente distintos en cada oído para que oigas un pulso. Se necesitan auriculares estéreo; usa el modo isócrono con altavoces. Es un efecto de escucha, no un tratamiento médico.',
    headphonesConfirm: 'Tengo auriculares',
  },

  session: {
    heading: 'Sesión',
    preparing: 'Preparando sesión…',
    play: 'Reproducir',
    pause: 'Pausa',
    continueAudio: 'Toca para continuar el audio',
    saveAsPreset: 'Guardar como preajuste',
    unavailable: 'Audio no disponible en este navegador',
    pausedByBrowser: 'Audio pausado por el navegador',
    crossfading: 'Fundiendo preajustes…',
    running: 'Paisaje sonoro en marcha',
    ready: 'Listo cuando quieras',
    exploreHeading: 'Explorar',
    exploreNote:
      '¿Prefieres un recorrido guiado por etapas? Las secuencias están en la pantalla de inicio.',
    browseSequences: 'Ver secuencias',
    customName: 'Personalizado',
    myPreset: 'Mi preajuste',
    mineSuffix: (name) => `${name} (mío)`,
  },

  controls: {
    preset: 'Preajuste',
    fadingHint: 'Fundido ~2s',
    switchWhilePlaying:
      'Al cambiar mientras suena se hace un fundido de ~2 segundos.',
    pickThenPlay: 'Elige una receta inicial y pulsa Reproducir.',
    master: 'General',
    duration: 'Duración',
    openEnded: 'Sin límite',
    openTimer: 'Libre',
    remainingAria: (time) => `Quedan ${time}`,
    fade: 'Fundido',
    fadeIn: (s) => `Entrada ${s}s`,
    fadeOut: (s) => `Salida ${s}s`,
    layers: 'Capas',
    layersNote:
      'Activa una capa para dar forma a su sonido — cada una incluye un EQ sencillo.',
    noise: 'Ruido',
    noiseColor: 'Color del ruido',
    tone: 'Tono',
    toneHz: 'Tono (Hz)',
    toneNote:
      'Frecuencias con nombre habituales como tonos puros — por preferencia de escucha, no por efectos de salud demostrados.',
    beat: 'Pulso',
    beatMode: 'Modo de pulso',
    beatRate: (hz) => `Ritmo ${hz} Hz`,
    nature: 'Naturaleza',
    natureSound: 'Sonido de naturaleza',
    natureBrightness: 'Brillo de naturaleza',
    brightness: (pct) => `Brillo ${pct}%`,
    volumeAria: (name) => `Volumen de ${name}`,
    eq: 'EQ',
    eqGroup: (name) => `EQ de ${name}`,
    eqBandAria: (layer, band) => `EQ ${band} de ${layer}`,
    flat: 'Plano',
    eqLow: 'Graves',
    eqMid: 'Medios',
    eqHigh: 'Agudos',
    beatOff: 'Apagado',
    beatIsochronic: 'Isócrono',
    beatBinaural: 'Binaural',
    minutesShort: (m) => `${m}m`,
    noisePink: 'rosa',
    noiseBrown: 'marrón',
    noiseWhite: 'blanco',
    natureRain: 'lluvia',
    natureShore: 'orilla',
    natureWind: 'viento',
    natureForest: 'bosque',
  },

  sequence: {
    heading: 'Secuencia',
    preparing: 'Preparando secuencia…',
    missing: 'No se encontró esa secuencia.',
    complete: 'Secuencia completa',
    doneTitle: 'Secuencia terminada',
    finished: 'Secuencia finalizada',
    stageOf: (n, total) => `Etapa ${n} de ${total}`,
    crossfading: 'Fundiendo a la siguiente etapa…',
    crossfadingTo: (stage) => `Fundiendo a ${stage}…`,
    nextStage: 'siguiente etapa',
    ready: 'Listo cuando quieras',
    unavailable: 'Audio no disponible en este navegador',
    pausedByBrowser: 'Audio pausado por el navegador',
    playAgain: 'Reproducir de nuevo',
    endSequence: 'Terminar secuencia',
    skipStage: 'Saltar etapa',
    stageRemaining: (time) => `Quedan ${time} de la etapa`,
    done: 'Hecho',
    allStagesComplete: (n) => `Las ${n} etapas están completas`,
    stageProgress: (name, remaining, duration, index, total, fading) =>
      `${name} · ${remaining} de ${duration} · etapa ${index} / ${total}${fading ? ' · fundiendo' : ''}`,
    stageProgressAria: (name) => `Progreso de ${name}`,
    saveSequence: 'Guardar secuencia',
    saveACopy: 'Guardar una copia',
    master: 'General',
    skippedTo: (name) => `Saltado a ${name}`,
    nowPlaying: (name) => `Reproduciendo ${name}`,
    playingStage: (name, n, total) =>
      `Reproduciendo ${name} · etapa ${n} de ${total}`,
    stageOfNamed: (n, total, name) => `Etapa ${n} de ${total} · ${name}`,
    mineSuffix: (name) => `${name} (mía)`,
    paused: 'En pausa',
    savedOnDevice: (name) => `Guardado «${name}» en este dispositivo`,
    savedFrom: (name) => `Guardado desde ${name}`,
    stagesCount: (n) => `${n} etapas`,
    saveFailed: 'No se pudo guardar la secuencia',
  },

  pwa: {
    updateAvailable: 'Actualización disponible',
    reload: 'Recargar',
    later: 'Más tarde',
    installPrompt: 'Instalar MeditateIt en este dispositivo',
    install: 'Instalar',
    dismiss: 'Descartar',
  },

  legal: {
    privacyTitle: 'Privacidad',
    termsTitle: 'Términos',
  },

  errors: {
    storage: {
      tooLarge: 'El archivo de copia es demasiado grande.',
      invalidJson: 'El archivo de copia no es JSON válido.',
      notObject: 'El archivo de copia debe ser un objeto JSON.',
      forbiddenKey: 'El archivo de copia contiene claves prohibidas.',
      badFormat: 'Este archivo no es una copia de MeditateIt.',
      badVersion: 'Esta versión de copia no es compatible.',
      badPresets: 'Los preajustes de la copia no son válidos.',
      presetsTooMany: 'La copia tiene demasiados preajustes.',
      exportFailed: 'No se pudo exportar la copia.',
      importFailed: 'No se pudo importar la copia.',
      eraseFailed: 'No se pudieron borrar los datos locales.',
      retentionFailed: 'No se pudo actualizar la retención del historial.',
      storageUnavailable: 'El almacenamiento local no está disponible.',
    },
    preset: {
      nameRequired: 'El nombre es obligatorio.',
      nameRequiredStrict: 'El nombre del preajuste es obligatorio.',
      invalidRecipe: 'Receta de sesión no válida.',
      idRequired: 'El id del preajuste es obligatorio.',
      cannotOverwriteSystem:
        'No se puede sobrescribir un preajuste del sistema.',
      tooMany: (max) => `Como máximo ${max} preajustes de usuario.`,
      saveFailed: 'No se pudo guardar el preajuste.',
    },
  },
}
