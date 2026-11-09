import type { Messages } from './en.ts'

/** Portuguese (pt) catalog — full key coverage mirroring en. */
export const pt: Messages = {
  app: {
    brand: 'MeditateIt',
    skipToMain: 'Saltar para o conteúdo principal',
    taglineHome: 'Paisagens sonoras generativas',
    taglineSettings: 'Definições',
    taglinePrivacy: 'Privacidade',
    taglineTerms: 'Termos',
    backHome: '← Voltar ao início',
    backHomeShort: 'Voltar ao início',
    homeLink: '← Início',
    privacy: 'Privacidade',
    terms: 'Termos',
    settings: 'Definições',
    disclaimer:
      'O MeditateIt é uma ferramenta de som generativo para bem-estar pessoal e concentração. Não é um dispositivo médico e não se destina a diagnosticar, tratar, curar ou prevenir qualquer condição.',
  },

  home: {
    eyebrow: 'Paisagens sonoras generativas',
    lede: 'Molda ruído rosa, tons e batidas em direto — começa em calma em menos de trinta segundos.',
    quickStart: 'Início rápido',
    custom: 'Personalizado',
    settings: 'Definições',
    sequences: 'Sequências',
    sequencesAside: 'Percursos por etapas',
    yourSequences: 'As tuas sequências',
    recentSessions: 'Sessões recentes',
    allAndBackup: 'Tudo e cópia',
    yourPresets: 'As tuas predefinições',
    systemPresets: 'Predefinições do sistema',
    savedOnDevice: 'Guardado neste dispositivo',
    openEnded: 'Sem limite',
    delete: 'Eliminar',
    deleteConfirm: (name: string) =>
      `Eliminar a predefinição “${name}”? Esta ação não pode ser anulada.`,
    deleteSequenceConfirm: (name: string) =>
      `Eliminar a sequência “${name}”? Esta ação não pode ser anulada.`,
    deleteAria: (name: string) => `Eliminar ${name}`,
    minutes: (m: number) => `${m} min`,
    replay: 'Repetir',
    sequenceTag: 'Sequência',
    sequenceDuration: (m: number, stages: number) =>
      `${m} min · ${stages} etapas`,
    historySeconds: (s: number) => `${s}s`,
    historyMinutes: (m: number, s: number) =>
      s > 0 ? `${m}m ${s}s` : `${m}m`,
    historyHours: (h: number, m: number) =>
      m > 0 ? `${h}h ${m}m` : `${h}h`,
  },

  blurbs: {
    'daily-calm': 'Rosa adequada a altifalante + 528 + pulso suave',
    sleep: 'Leito castanho profundo, chuva suave, batida lenta ~2 Hz',
    focus: 'Rosa + 528 com batida média ~16 Hz',
    'anxiety-softener': 'Rosa suave + tom 396 Hz + pulso suave ~10 Hz',
    'deep-rest': 'Castanho sem limite + rebentação + tom grave',
  },

  systemPresets: {
    'daily-calm': 'Calma diária',
    sleep: 'Sono',
    focus: 'Foco',
    'anxiety-softener': 'Calma suave',
    'deep-rest': 'Descanso profundo',
  },

  systemSequences: {
    'wind-down': {
      name: 'Desacelerar',
      summary: 'Calma suave → leito rosa → sono',
      stages: {
        'wd-1': 'Aterragem suave',
        'wd-2': 'Assentamento rosa',
        'wd-3': 'Assentar',
      },
    },
    'focus-block': {
      name: 'Bloco de foco',
      summary: 'Chegar em calma → foco → fecho suave',
      stages: {
        'fb-1': 'Chegar',
        'fb-2': 'Trabalho focado',
        'fb-3': 'Fecho suave',
      },
    },
    'deep-sleep-ramp': {
      name: 'Relaxamento noturno',
      summary: 'Rosa → deslize ~5 Hz → leito noturno',
      stages: {
        'ds-1': 'Desenrolar rosa',
        'ds-2': 'Deslize ~5 Hz',
        'ds-3': 'Leito noturno',
      },
    },
  },

  settings: {
    languageHeading: 'Idioma',
    languageLede:
      'Escolhe o idioma do MeditateIt neste dispositivo. As datas e horas seguem este idioma.',
    backupHeading: 'Cópia de segurança',
    backupLede:
      'Descarrega ou restaura preferências, predefinições, sequências e histórico de sessões em JSON. A exportação inclui escutas terminadas por predefinição. Sem conta — o ficheiro fica neste dispositivo.',
    exportJson: 'Exportar JSON',
    importModeLegend: 'Modo de importação',
    mergeTitle: 'Fundir',
    mergeDetail:
      ' — manter predefinições e sequências existentes; os mesmos ids atualizam-se a partir do ficheiro',
    replaceTitle: 'Substituir',
    replaceDetail:
      ' — substituir preferências, predefinições e sequências; limpar o histórico quando o ficheiro não o tiver',
    keepHistoryWhenOmitted:
      'Manter o histórico existente se o ficheiro omitir o histórico',
    importJson: 'Importar JSON…',
    historyHeading: 'Histórico de sessões',
    clear: 'Limpar',
    historyLede:
      'Escutas terminadas neste dispositivo (escritas quando paras ou sais de uma sessão). No máximo 100 entradas, mais o limite de tempo abaixo.',
    retention: 'Retenção',
    historyEmpty: 'Ainda sem sessões. Reproduz algo e depois para.',
    clearHistoryConfirm:
      'Limpar todo o histórico de sessões neste dispositivo? Preferências e predefinições ficam.',
    historyCleared: 'Histórico de sessões limpo.',
    eraseHeading: 'Apagar todos os dados',
    eraseLede:
      'Remove preferências, predefinições, sequências, histórico e a retenção deste navegador. Exporta uma cópia primeiro se puderes precisar dela.',
    clearCachesToo:
      'Também limpar caches offline e anular o registo do service worker',
    eraseButton: 'Apagar todos os dados locais…',
    eraseConfirm:
      'Apagar todos os dados do MeditateIt neste dispositivo (preferências, predefinições, sequências, histórico e retenção)? Esta ação não pode ser anulada.',
    eraseConfirmWithCaches:
      'Apagar todos os dados do MeditateIt neste dispositivo (preferências, predefinições, sequências, histórico e retenção)? Isto também limpa caches offline e anula o service worker. Esta ação não pode ser anulada.',
    aboutHeading: 'Sobre e legal',
    aboutLede:
      'O MeditateIt é uma ferramenta de som generativo para bem-estar pessoal e concentração. Não é um dispositivo médico e não se destina a diagnosticar, tratar, curar ou prevenir qualquer condição. Se tiveres preocupações de saúde, fala com um profissional qualificado.',
    exported: (presetCount, sequenceCount, sessionCount) =>
      `Exportadas ${presetCount} predefiniç${presetCount === 1 ? 'ão' : 'ões'}, ${sequenceCount} sequênci${sequenceCount === 1 ? 'a' : 'as'} e ${sessionCount} sess${sessionCount === 1 ? 'ão' : 'ões'}.`,
    imported: (mode, presetCount, sequenceCount, historyCount) =>
      `Importação (${mode}): ${presetCount} predefiniç${presetCount === 1 ? 'ão' : 'ões'}, ${sequenceCount} sequênci${sequenceCount === 1 ? 'a' : 'as'}, ${historyCount} entrada${historyCount === 1 ? '' : 's'} de histórico.`,
    retentionUpdated: (label, kept) =>
      `Retenção do histórico definida para ${label.toLowerCase()}. ${kept} entrada${kept === 1 ? '' : 's'} mantida${kept === 1 ? '' : 's'}.`,
    erased: (keyCount) =>
      `Todos os dados locais do MeditateIt apagados (${keyCount} chaves).`,
    erasedCaches: (swCount) =>
      ` Caches limpas; ${swCount} service worker${swCount === 1 ? '' : 's'} anulado${swCount === 1 ? '' : 's'}.`,
    retentionForever: 'Manter até ao limite de quantidade (100)',
    retentionDays: (days) => `${days} dias`,
  },

  dialogs: {
    savePresetTitle: 'Guardar predefinição',
    savePresetBody:
      'Guarda esta paisagem sonora localmente neste dispositivo. Não é necessária uma conta.',
    saveSequenceTitle: 'Guardar sequência',
    saveSequenceBody:
      'Guarda esta sequência de várias etapas localmente neste dispositivo. As etapas mantêm as receitas para que o restauro seja autónomo.',
    name: 'Nome',
    cancel: 'Cancelar',
    update: 'Atualizar',
    save: 'Guardar',
    saveAsNew: 'Guardar como nova',
    saving: 'A guardar…',
    headphonesTitle: 'São precisos auscultadores',
    headphonesBody:
      'O modo binaural reproduz tons ligeiramente diferentes em cada ouvido para ouvires um pulso. São precisos auscultadores estéreo; usa o modo isócrono com altifalantes. Isto é um efeito de escuta, não um tratamento médico.',
    headphonesConfirm: 'Tenho auscultadores',
  },

  session: {
    heading: 'Sessão',
    preparing: 'A preparar a sessão…',
    play: 'Reproduzir',
    pause: 'Pausa',
    continueAudio: 'Toca para continuar o áudio',
    saveAsPreset: 'Guardar como predefinição',
    unavailable: 'Áudio indisponível neste navegador',
    pausedByBrowser: 'Áudio pausado pelo navegador',
    crossfading: 'A cruzar predefinições…',
    running: 'Paisagem sonora a decorrer',
    ready: 'Pronto quando quiseres',
    exploreHeading: 'Explorar',
    exploreNote:
      'Preferes um percurso guiado por etapas? As sequências estão no ecrã inicial.',
    browseSequences: 'Ver sequências',
    customName: 'Personalizado',
    myPreset: 'A minha predefinição',
    mineSuffix: (name) => `${name} (meu)`,
  },

  controls: {
    preset: 'Predefinição',
    fadingHint: 'Cruzamento ~2s',
    switchWhilePlaying:
      'Mudar durante a reprodução faz um cruzamento de ~2 segundos.',
    pickThenPlay: 'Escolhe uma receita inicial e carrega em Reproduzir.',
    master: 'Geral',
    duration: 'Duração',
    openEnded: 'Sem limite',
    openTimer: 'Livre',
    remainingAria: (time) => `Restam ${time}`,
    fade: 'Fade',
    fadeIn: (s) => `Entrada ${s}s`,
    fadeOut: (s) => `Saída ${s}s`,
    layers: 'Camadas',
    layersNote:
      'Liga uma camada para moldar o seu som — cada uma inclui um EQ simples.',
    noise: 'Ruído',
    noiseColor: 'Cor do ruído',
    tone: 'Tom',
    toneHz: 'Tom (Hz)',
    toneNote:
      'Frequências com nome comuns como tons puros — por preferência de escuta, não por efeitos de saúde comprovados.',
    beat: 'Batida',
    beatMode: 'Modo de batida',
    beatRate: (hz) => `Ritmo ${hz} Hz`,
    nature: 'Natureza',
    natureSound: 'Som de natureza',
    natureBrightness: 'Brilho da natureza',
    brightness: (pct) => `Brilho ${pct}%`,
    volumeAria: (name) => `Volume de ${name}`,
    eq: 'EQ',
    eqGroup: (name) => `EQ de ${name}`,
    eqBandAria: (layer, band) => `EQ ${band} de ${layer}`,
    flat: 'Plano',
    eqLow: 'Graves',
    eqMid: 'Médios',
    eqHigh: 'Agudos',
    beatOff: 'Desligado',
    beatIsochronic: 'Isócrono',
    beatBinaural: 'Binaural',
    minutesShort: (m) => `${m}m`,
    noisePink: 'rosa',
    noiseBrown: 'castanho',
    noiseWhite: 'branco',
    natureRain: 'chuva',
    natureShore: 'costa',
    natureWind: 'vento',
    natureForest: 'floresta',
  },

  sequence: {
    heading: 'Sequência',
    preparing: 'A preparar a sequência…',
    missing: 'Essa sequência não foi encontrada.',
    complete: 'Sequência completa',
    doneTitle: 'Sequência concluída',
    finished: 'Sequência terminada',
    stageOf: (n, total) => `Etapa ${n} de ${total}`,
    crossfading: 'A cruzar para a etapa seguinte…',
    crossfadingTo: (stage) => `A cruzar para ${stage}…`,
    nextStage: 'etapa seguinte',
    ready: 'Pronto quando quiseres',
    unavailable: 'Áudio indisponível neste navegador',
    pausedByBrowser: 'Áudio pausado pelo navegador',
    playAgain: 'Reproduzir de novo',
    endSequence: 'Terminar sequência',
    skipStage: 'Saltar etapa',
    stageRemaining: (time) => `Restam ${time} da etapa`,
    done: 'Concluído',
    allStagesComplete: (n) => `Todas as ${n} etapas concluídas`,
    stageProgress: (name, remaining, duration, index, total, fading) =>
      `${name} · ${remaining} de ${duration} · etapa ${index} / ${total}${fading ? ' · a cruzar' : ''}`,
    stageProgressAria: (name) => `Progresso de ${name}`,
    saveSequence: 'Guardar sequência',
    saveACopy: 'Guardar uma cópia',
    master: 'Geral',
    skippedTo: (name) => `Saltado para ${name}`,
    nowPlaying: (name) => `A reproduzir ${name}`,
    playingStage: (name, n, total) =>
      `A reproduzir ${name} · etapa ${n} de ${total}`,
    stageOfNamed: (n, total, name) => `Etapa ${n} de ${total} · ${name}`,
    mineSuffix: (name) => `${name} (minha)`,
    paused: 'Em pausa',
    savedOnDevice: (name) => `Guardado “${name}” neste dispositivo`,
    savedFrom: (name) => `Guardado a partir de ${name}`,
    stagesCount: (n) => `${n} etapas`,
    saveFailed: 'Não foi possível guardar a sequência',
  },

  pwa: {
    updateAvailable: 'Atualização disponível',
    reload: 'Recarregar',
    later: 'Mais tarde',
    installPrompt: 'Instalar o MeditateIt neste dispositivo',
    install: 'Instalar',
    dismiss: 'Dispensar',
  },

  legal: {
    privacyTitle: 'Privacidade',
    termsTitle: 'Termos',
  },

  errors: {
    storage: {
      tooLarge: 'O ficheiro de cópia é demasiado grande.',
      invalidJson: 'O ficheiro de cópia não é JSON válido.',
      notObject: 'O ficheiro de cópia deve ser um objeto JSON.',
      forbiddenKey: 'O ficheiro de cópia contém chaves proibidas.',
      badFormat: 'Este ficheiro não é uma cópia do MeditateIt.',
      badVersion: 'Esta versão de cópia não é suportada.',
      badPresets: 'As predefinições da cópia são inválidas.',
      presetsTooMany: 'A cópia tem demasiadas predefinições.',
      exportFailed: 'Não foi possível exportar a cópia.',
      importFailed: 'Não foi possível importar a cópia.',
      eraseFailed: 'Não foi possível apagar os dados locais.',
      retentionFailed: 'Não foi possível atualizar a retenção do histórico.',
      storageUnavailable: 'O armazenamento local está indisponível.',
    },
    preset: {
      nameRequired: 'O nome é obrigatório.',
      nameRequiredStrict: 'O nome da predefinição é obrigatório.',
      invalidRecipe: 'Receita de sessão inválida.',
      idRequired: 'O id da predefinição é obrigatório.',
      cannotOverwriteSystem:
        'Não é possível substituir uma predefinição do sistema.',
      tooMany: (max) => `No máximo ${max} predefinições de utilizador.`,
      saveFailed: 'Não foi possível guardar a predefinição.',
    },
  },
}
