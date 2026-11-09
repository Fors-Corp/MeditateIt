import type { Messages } from './en.ts'

/** Catalan (ca) catalog — full key coverage mirroring en. */
export const ca: Messages = {
  app: {
    brand: 'MeditateIt',
    skipToMain: 'Salta al contingut principal',
    taglineHome: 'Paisatges sonors generatius',
    taglineSettings: 'Configuració',
    taglinePrivacy: 'Privadesa',
    taglineTerms: 'Termes',
    backHome: '← Torna a l’inici',
    backHomeShort: 'Torna a l’inici',
    homeLink: '← Inici',
    privacy: 'Privadesa',
    terms: 'Termes',
    settings: 'Configuració',
    disclaimer:
      'MeditateIt és una eina de so generatiu per al benestar personal i la concentració. No és un dispositiu mèdic i no està pensada per diagnosticar, tractar, curar ni prevenir cap afecció.',
  },

  home: {
    eyebrow: 'Paisatges sonors generatius',
    lede: 'Modela soroll rosa, tons i pulsacions en directe — comença amb calma en menys de trenta segons.',
    quickStart: 'Inici ràpid',
    custom: 'Personalitzat',
    settings: 'Configuració',
    sequences: 'Seqüències',
    sequencesAside: 'Recorreguts per etapes',
    yourSequences: 'Les teves seqüències',
    recentSessions: 'Sessions recents',
    allAndBackup: 'Tot i còpia',
    yourPresets: 'Els teus preajustos',
    systemPresets: 'Preajustos del sistema',
    savedOnDevice: 'Desat en aquest dispositiu',
    openEnded: 'Sense límit',
    delete: 'Suprimeix',
    deleteConfirm: (name: string) =>
      `Vols suprimir el preajust «${name}»? Aquesta acció no es pot desfer.`,
    deleteSequenceConfirm: (name: string) =>
      `Vols suprimir la seqüència «${name}»? Aquesta acció no es pot desfer.`,
    deleteAria: (name: string) => `Suprimeix ${name}`,
    minutes: (m: number) => `${m} min`,
    replay: 'Torna a reproduir',
    sequenceTag: 'Seqüència',
    sequenceDuration: (m: number, stages: number) =>
      `${m} min · ${stages} etapes`,
    historySeconds: (s: number) => `${s}s`,
    historyMinutes: (m: number, s: number) =>
      s > 0 ? `${m}m ${s}s` : `${m}m`,
    historyHours: (h: number, m: number) =>
      m > 0 ? `${h}h ${m}m` : `${h}h`,
  },

  blurbs: {
    'daily-calm': 'Rosa apta per a altaveu + 528 + pols suau',
    sleep: 'Llit marró profund, pluja suau, pols ~2 Hz lent',
    focus: 'Rosa + 528 amb pols mitjà ~16 Hz',
    'anxiety-softener': 'Rosa suau + to 396 Hz + pols suau ~10 Hz',
    'deep-rest': 'Marró sense límit + onatge + to baix',
  },

  systemPresets: {
    'daily-calm': 'Calma diària',
    sleep: 'Son',
    focus: 'Enfocament',
    'anxiety-softener': 'Calma suau',
    'deep-rest': 'Descans profund',
  },

  systemSequences: {
    'wind-down': {
      name: 'Abaixada de ritme',
      summary: 'Calma suau → llit rosa → son',
      stages: {
        'wd-1': 'Aterratge suau',
        'wd-2': 'Assentament rosa',
        'wd-3': 'Assentar-se',
      },
    },
    'focus-block': {
      name: 'Bloc d’enfocament',
      summary: 'Arribar amb calma → enfocament → tancament suau',
      stages: {
        'fb-1': 'Arribar',
        'fb-2': 'Treball enfocat',
        'fb-3': 'Tancament suau',
      },
    },
    'deep-sleep-ramp': {
      name: 'Relaxació nocturna',
      summary: 'Rosa → lliscament ~5 Hz → llit nocturn',
      stages: {
        'ds-1': 'Desenredament rosa',
        'ds-2': 'Lliscament ~5 Hz',
        'ds-3': 'Llit nocturn',
      },
    },
  },

  settings: {
    themeHeading: 'Tema',
    themeLede:
      'Tria una paleta calmada. Sistema segueix el mode clar o fosc del dispositiu.',
    themeSystem: 'Sistema',
    themes: {
      light: 'Clar',
      dark: 'Fosc',
      dusk: 'Capvespre',
      mist: 'Boira',
      forest: 'Bosc',
    },
    languageHeading: 'Idioma',
    languageLede:
      'Tria l’idioma de MeditateIt en aquest dispositiu. Les dates i hores segueixen aquest idioma.',
    backupHeading: 'Còpia de seguretat',
    backupLede:
      'Descarrega o restaura preferències, preajustos, seqüències i historial de sessions com a JSON. L’exportació inclou escoltes acabades per defecte. Sense compte: el fitxer roman en aquest dispositiu.',
    exportJson: 'Exporta JSON',
    importModeLegend: 'Mode d’importació',
    mergeTitle: 'Combina',
    mergeDetail:
      ' — conserva preajustos i seqüències existents; els mateixos ids s’actualitzen des del fitxer',
    replaceTitle: 'Reemplaça',
    replaceDetail:
      ' — sobrescriu preferències, preajustos i seqüències; esborra l’historial si el fitxer no en porta',
    keepHistoryWhenOmitted:
      'Conserva l’historial existent si el fitxer omet l’historial',
    importJson: 'Importa JSON…',
    historyHeading: 'Historial de sessions',
    clear: 'Buida',
    historyLede:
      'Escoltes acabades en aquest dispositiu (s’escriuen en parar o sortir d’una sessió). Com a màxim 100 entrades, més el límit de temps de sota.',
    retention: 'Retenció',
    historyEmpty: 'Encara no hi ha sessions. Reprodueix alguna cosa i després para.',
    clearHistoryConfirm:
      'Vols buidar tot l’historial de sessions en aquest dispositiu? Les preferències i els preajustos es conserven.',
    historyCleared: 'Historial de sessions buidat.',
    eraseHeading: 'Esborra totes les dades',
    eraseLede:
      'Elimina preferències, preajustos, seqüències, historial i la retenció d’aquest navegador. Exporta una còpia abans si la pots necessitar.',
    clearCachesToo:
      'També buida les memòries cau fora de línia i anul·la el registre del service worker',
    eraseButton: 'Esborra totes les dades locals…',
    eraseConfirm:
      'Vols esborrar totes les dades de MeditateIt en aquest dispositiu (preferències, preajustos, seqüències, historial i retenció)? Aquesta acció no es pot desfer.',
    eraseConfirmWithCaches:
      'Vols esborrar totes les dades de MeditateIt en aquest dispositiu (preferències, preajustos, seqüències, historial i retenció)? També buida les memòries cau fora de línia i anul·la el service worker. Aquesta acció no es pot desfer.',
    aboutHeading: 'Quant a i legal',
    aboutLede:
      'MeditateIt és una eina de so generatiu per al benestar personal i la concentració. No és un dispositiu mèdic i no està pensada per diagnosticar, tractar, curar ni prevenir cap afecció. Si tens dubtes de salut, parla amb un professional qualificat.',
    exported: (presetCount, sequenceCount, sessionCount) =>
      `S’han exportat ${presetCount} preajust${presetCount === 1 ? '' : 'os'}, ${sequenceCount} seqüència${sequenceCount === 1 ? '' : 's'} i ${sessionCount} sessió${sessionCount === 1 ? '' : 'ns'}.`,
    imported: (mode, presetCount, sequenceCount, historyCount) =>
      `Importació (${mode}): ${presetCount} preajust${presetCount === 1 ? '' : 'os'}, ${sequenceCount} seqüència${sequenceCount === 1 ? '' : 's'}, ${historyCount} entrada${historyCount === 1 ? '' : 'es'} d’historial.`,
    retentionUpdated: (label, kept) =>
      `Retenció de l’historial: ${label.toLowerCase()}. ${kept} entrada${kept === 1 ? '' : 'es'} conservada${kept === 1 ? '' : 'es'}.`,
    erased: (keyCount) =>
      `Totes les dades locals de MeditateIt s’han esborrat (${keyCount} claus).`,
    erasedCaches: (swCount) =>
      ` Memòries cau buidades; ${swCount} service worker${swCount === 1 ? '' : 's'} anul·lat${swCount === 1 ? '' : 's'}.`,
    retentionForever: 'Conserva fins al límit de quantitat (100)',
    retentionDays: (days) => `${days} dies`,
  },

  dialogs: {
    savePresetTitle: 'Desa el preajust',
    savePresetBody:
      'Desa aquest paisatge sonor en aquest dispositiu. No cal cap compte.',
    saveSequenceTitle: 'Desa la seqüència',
    saveSequenceBody:
      'Desa aquesta seqüència de diverses etapes en aquest dispositiu. Les etapes conserven les receptes perquè la restauració sigui autosuficient.',
    name: 'Nom',
    cancel: 'Cancel·la',
    update: 'Actualitza',
    save: 'Desa',
    saveAsNew: 'Desa com a nou',
    saving: 'Desant…',
    headphonesTitle: 'Calen auriculars',
    headphonesBody:
      'El mode binaural reprodueix tons lleugerament diferents a cada orella perquè sentis un pols. Calen auriculars estèreo; usa el mode isòcron amb altaveus. És un efecte d’escolta, no un tractament mèdic.',
    headphonesConfirm: 'Tinc auriculars',
  },

  session: {
    heading: 'Sessió',
    preparing: 'Preparant la sessió…',
    play: 'Reprodueix',
    pause: 'Pausa',
    continueAudio: 'Toca per continuar l’àudio',
    saveAsPreset: 'Desa com a preajust',
    unavailable: 'Àudio no disponible en aquest navegador',
    pausedByBrowser: 'Àudio en pausa pel navegador',
    crossfading: 'Fonent preajustos…',
    running: 'Paisatge sonor en marxa',
    ready: 'A punt quan vulguis',
    exploreHeading: 'Explora',
    exploreNote:
      'Prefereixes un recorregut guiat per etapes? Les seqüències són a la pantalla d’inici.',
    browseSequences: 'Veure seqüències',
    customName: 'Personalitzat',
    myPreset: 'El meu preajust',
    mineSuffix: (name) => `${name} (meu)`,
  },

  controls: {
    preset: 'Preajust',
    fadingHint: 'Fosa ~2s',
    switchWhilePlaying:
      'Canviar mentre sona fa una fosa d’uns ~2 segons.',
    pickThenPlay: 'Tria una recepta inicial i prem Reprodueix.',
    master: 'General',
    duration: 'Durada',
    openEnded: 'Sense límit',
    openTimer: 'Lliure',
    remainingAria: (time) => `Queden ${time}`,
    fade: 'Fosa',
    fadeIn: (s) => `Entrada ${s}s`,
    fadeOut: (s) => `Sortida ${s}s`,
    layers: 'Capes',
    layersNote:
      'Activa una capa per donar forma al seu so — cadascuna inclou un EQ senzill.',
    noise: 'Soroll',
    noiseColor: 'Color del soroll',
    tone: 'To',
    toneHz: 'To (Hz)',
    toneNote:
      'Freqüències amb nom habituals com a tons purs — per preferència d’escolta, no per efectes de salut demostrats.',
    beat: 'Pols',
    beatMode: 'Mode de pols',
    beatRate: (hz) => `Ritme ${hz} Hz`,
    nature: 'Natura',
    natureSound: 'So de natura',
    natureBrightness: 'Brillantor de natura',
    brightness: (pct) => `Brillantor ${pct}%`,
    volumeAria: (name) => `Volum de ${name}`,
    eq: 'EQ',
    eqGroup: (name) => `EQ de ${name}`,
    eqBandAria: (layer, band) => `EQ ${band} de ${layer}`,
    flat: 'Pla',
    eqLow: 'Greus',
    eqMid: 'Mitjans',
    eqHigh: 'Aguts',
    beatOff: 'Apagat',
    beatIsochronic: 'Isòcron',
    beatBinaural: 'Binaural',
    minutesShort: (m) => `${m}m`,
    noisePink: 'rosa',
    noiseBrown: 'marró',
    noiseWhite: 'blanc',
    natureRain: 'pluja',
    natureShore: 'riba',
    natureWind: 'vent',
    natureForest: 'bosc',
  },

  sequence: {
    heading: 'Seqüència',
    preparing: 'Preparant la seqüència…',
    missing: 'No s’ha trobat aquesta seqüència.',
    complete: 'Seqüència completa',
    doneTitle: 'Seqüència acabada',
    finished: 'Seqüència finalitzada',
    stageOf: (n, total) => `Etapa ${n} de ${total}`,
    crossfading: 'Fonent a la següent etapa…',
    crossfadingTo: (stage) => `Fonent a ${stage}…`,
    nextStage: 'següent etapa',
    ready: 'A punt quan vulguis',
    unavailable: 'Àudio no disponible en aquest navegador',
    pausedByBrowser: 'Àudio en pausa pel navegador',
    playAgain: 'Torna a reproduir',
    endSequence: 'Acaba la seqüència',
    skipStage: 'Salta l’etapa',
    stageRemaining: (time) => `Queden ${time} de l’etapa`,
    done: 'Fet',
    allStagesComplete: (n) => `Les ${n} etapes estan completes`,
    stageProgress: (name, remaining, duration, index, total, fading) =>
      `${name} · ${remaining} de ${duration} · etapa ${index} / ${total}${fading ? ' · fonent' : ''}`,
    stageProgressAria: (name) => `Progrés de ${name}`,
    saveSequence: 'Desa la seqüència',
    saveACopy: 'Desa una còpia',
    master: 'General',
    skippedTo: (name) => `S’ha saltat a ${name}`,
    nowPlaying: (name) => `S’està reproduint ${name}`,
    playingStage: (name, n, total) =>
      `S’està reproduint ${name} · etapa ${n} de ${total}`,
    stageOfNamed: (n, total, name) => `Etapa ${n} de ${total} · ${name}`,
    mineSuffix: (name) => `${name} (meva)`,
    paused: 'En pausa',
    savedOnDevice: (name) => `Desat «${name}» en aquest dispositiu`,
    savedFrom: (name) => `Desat des de ${name}`,
    stagesCount: (n) => `${n} etapes`,
    saveFailed: 'No s’ha pogut desar la seqüència',
  },

  pwa: {
    updateAvailable: 'Actualització disponible',
    reload: 'Torna a carregar',
    later: 'Més tard',
    installPrompt: 'Instal·la MeditateIt en aquest dispositiu',
    install: 'Instal·la',
    dismiss: 'Descarta',
  },

  legal: {
    privacyTitle: 'Privadesa',
    termsTitle: 'Termes',
  },

  errors: {
    storage: {
      tooLarge: 'El fitxer de còpia és massa gran.',
      invalidJson: 'El fitxer de còpia no és JSON vàlid.',
      notObject: 'El fitxer de còpia ha de ser un objecte JSON.',
      forbiddenKey: 'El fitxer de còpia conté claus prohibides.',
      badFormat: 'Aquest fitxer no és una còpia de MeditateIt.',
      badVersion: 'Aquesta versió de còpia no és compatible.',
      badPresets: 'Els preajustos de la còpia no són vàlids.',
      presetsTooMany: 'La còpia té massa preajustos.',
      exportFailed: 'No s’ha pogut exportar la còpia.',
      importFailed: 'No s’ha pogut importar la còpia.',
      eraseFailed: 'No s’han pogut esborrar les dades locals.',
      retentionFailed: 'No s’ha pogut actualitzar la retenció de l’historial.',
      storageUnavailable: 'L’emmagatzematge local no està disponible.',
    },
    preset: {
      nameRequired: 'El nom és obligatori.',
      nameRequiredStrict: 'El nom del preajust és obligatori.',
      invalidRecipe: 'Recepta de sessió no vàlida.',
      idRequired: 'L’id del preajust és obligatori.',
      cannotOverwriteSystem:
        'No es pot sobrescriure un preajust del sistema.',
      tooMany: (max) => `Com a màxim ${max} preajustos d’usuari.`,
      saveFailed: 'No s’ha pogut desar el preajust.',
    },
  },
}
