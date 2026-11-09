/**
 * English message catalog (EN-only product).
 * Future locales can mirror this module shape; do not add a second locale yet.
 */

export const en = {
  app: {
    brand: 'MeditateIt',
    skipToMain: 'Skip to main content',
    taglineHome: 'Generative soundscapes',
    taglineSettings: 'Settings',
    taglinePrivacy: 'Privacy',
    taglineTerms: 'Terms',
    backHome: '← Back home',
    backHomeShort: 'Back home',
    homeLink: '← Home',
    privacy: 'Privacy',
    terms: 'Terms',
    settings: 'Settings',
    disclaimer:
      'MeditateIt is a generative sound tool for personal wellness and focus. It is not a medical device and is not intended to diagnose, treat, cure, or prevent any condition.',
  },

  home: {
    eyebrow: 'Generative soundscapes',
    lede: 'Shape pink noise, tones, and beats live — start calm in under thirty seconds.',
    quickStart: 'Quick start',
    custom: 'Custom',
    settings: 'Settings',
    sequences: 'Sequences',
    sequencesAside: 'Multi-stage paths',
    yourSequences: 'Your sequences',
    recentSessions: 'Recent sessions',
    allAndBackup: 'All & backup',
    yourPresets: 'Your presets',
    systemPresets: 'System presets',
    savedOnDevice: 'Saved on this device',
    openEnded: 'Open-ended',
    delete: 'Delete',
    deleteConfirm: (name: string) =>
      `Delete preset “${name}”? This cannot be undone.`,
    deleteSequenceConfirm: (name: string) =>
      `Delete sequence “${name}”? This cannot be undone.`,
    deleteAria: (name: string) => `Delete ${name}`,
    minutes: (m: number) => `${m} min`,
    replay: 'Replay',
    sequenceTag: 'Sequence',
  },

  blurbs: {
    'daily-calm': 'Speaker-friendly pink + 528 + soft pulse',
    sleep: 'Deep brown bed, soft rain, slow ~2 Hz beat',
    focus: 'Pink + 528 with mid-rate ~16 Hz beat',
    'anxiety-softener': 'Soft pink + 396 Hz tone + gentle ~10 Hz pulse',
    'deep-rest': 'Open-ended brown + shore wash + low tone',
  } as Record<string, string>,

  settings: {
    backupHeading: 'Backup',
    backupLede:
      'Download or restore prefs, saved presets, sequences, and session history as JSON. Export includes finished listens by default. No account — the file stays on this device.',
    exportJson: 'Export JSON',
    importModeLegend: 'Import mode',
    mergeTitle: 'Merge',
    mergeDetail:
      ' — keep existing presets and sequences; same ids update from the file',
    replaceTitle: 'Replace',
    replaceDetail:
      ' — overwrite prefs, user presets, and sequences; wipe session history when the file has none',
    keepHistoryWhenOmitted:
      'Keep existing session history if the file omits history',
    importJson: 'Import JSON…',
    historyHeading: 'Session history',
    clear: 'Clear',
    historyLede:
      'Finished listens on this device (written when you stop or leave a session). Kept to at most 100 entries, plus any time limit below.',
    retention: 'Retention',
    historyEmpty: 'No sessions yet. Play something, then stop.',
    clearHistoryConfirm:
      'Clear all session history on this device? Prefs and presets stay.',
    historyCleared: 'Session history cleared.',
    eraseHeading: 'Erase all data',
    eraseLede:
      'Remove prefs, saved presets, sequences, session history, and the retention setting from this browser. Export a backup first if you may want it back.',
    clearCachesToo:
      'Also clear offline caches and unregister the service worker',
    eraseButton: 'Erase all local data…',
    eraseConfirm:
      'Erase all MeditateIt data on this device (prefs, saved presets, sequences, session history, and retention setting)? This cannot be undone.',
    eraseConfirmWithCaches:
      'Erase all MeditateIt data on this device (prefs, saved presets, sequences, session history, and retention setting)? This also clears offline caches and unregisters the service worker. This cannot be undone.',
    aboutHeading: 'About & legal',
    aboutLede:
      'MeditateIt is a generative sound tool for personal wellness and focus. It is not a medical device and is not intended to diagnose, treat, cure, or prevent any condition. If you have health concerns, talk to a qualified professional.',
    exported: (
      presetCount: number,
      sequenceCount: number,
      sessionCount: number,
    ) =>
      `Exported ${presetCount} preset${presetCount === 1 ? '' : 's'}, ${sequenceCount} sequence${sequenceCount === 1 ? '' : 's'}, and ${sessionCount} session${sessionCount === 1 ? '' : 's'}.`,
    imported: (
      mode: string,
      presetCount: number,
      sequenceCount: number,
      historyCount: number,
    ) =>
      `Import (${mode}): ${presetCount} preset${presetCount === 1 ? '' : 's'}, ${sequenceCount} sequence${sequenceCount === 1 ? '' : 's'}, ${historyCount} history entr${historyCount === 1 ? 'y' : 'ies'}.`,
    retentionUpdated: (label: string, kept: number) =>
      `History retention set to ${label.toLowerCase()}. ${kept} entr${kept === 1 ? 'y' : 'ies'} kept.`,
    erased: (keyCount: number) =>
      `All local MeditateIt data erased (${keyCount} keys).`,
    erasedCaches: (swCount: number) =>
      ` Caches cleared; ${swCount} service worker${swCount === 1 ? '' : 's'} unregistered.`,
    retentionForever: 'Keep until count limit (100)',
    retentionDays: (days: number) => `${days} days`,
  },

  dialogs: {
    savePresetTitle: 'Save preset',
    savePresetBody:
      'Store this soundscape locally on this device. No account needed.',
    saveSequenceTitle: 'Save sequence',
    saveSequenceBody:
      'Store this multi-stage sequence locally on this device. Stages keep their recipes so a restore stays self-contained.',
    name: 'Name',
    cancel: 'Cancel',
    update: 'Update',
    save: 'Save',
    saveAsNew: 'Save as new',
    saving: 'Saving…',
    headphonesTitle: 'Headphones needed',
    headphonesBody:
      'Binaural mode plays slightly different tones in each ear so you hear a pulse. Stereo headphones are required; use isochronic mode for speakers. This is a listening effect, not a medical treatment.',
    headphonesConfirm: 'I have headphones',
  },

  session: {
    heading: 'Session',
    preparing: 'Preparing session…',
    play: 'Play',
    pause: 'Pause',
    continueAudio: 'Tap to continue audio',
    saveAsPreset: 'Save as preset',
    unavailable: 'Audio unavailable in this browser',
    pausedByBrowser: 'Audio paused by the browser',
    crossfading: 'Crossfading presets…',
    running: 'Soundscape running',
    ready: 'Ready when you are',
    exploreHeading: 'Explore',
    exploreNote:
      'Prefer a guided multi-stage path? Sequences are on the home screen.',
    browseSequences: 'Browse sequences',
  },

  sequence: {
    heading: 'Sequence',
    preparing: 'Preparing sequence…',
    missing: 'That sequence was not found.',
    complete: 'Sequence complete',
    doneTitle: 'Sequence done',
    finished: 'Sequence finished',
    stageOf: (n: number, total: number) => `Stage ${n} of ${total}`,
    crossfading: 'Crossfading to next stage…',
    crossfadingTo: (stage: string) => `Crossfading to ${stage}…`,
    nextStage: 'next stage',
    ready: 'Ready when you are',
    unavailable: 'Audio unavailable in this browser',
    pausedByBrowser: 'Audio paused by the browser',
    playAgain: 'Play again',
    endSequence: 'End sequence',
    skipStage: 'Skip stage',
    stageRemaining: (time: string) => `Stage remaining ${time}`,
    done: 'Done',
    allStagesComplete: (n: number) => `All ${n} stages complete`,
    stageProgress: (
      name: string,
      remaining: string,
      duration: string,
      index: number,
      total: number,
      fading: boolean,
    ) =>
      `${name} · ${remaining} of ${duration} · stage ${index} / ${total}${fading ? ' · fading' : ''}`,
    stageProgressAria: (name: string) => `${name} progress`,
    saveSequence: 'Save sequence',
    saveACopy: 'Save a copy',
    master: 'Master',
  },

  pwa: {
    updateAvailable: 'Update available',
    reload: 'Reload',
    later: 'Later',
    installPrompt: 'Install MeditateIt on this device',
    install: 'Install',
    dismiss: 'Dismiss',
  },

  legal: {
    privacyTitle: 'Privacy',
    termsTitle: 'Terms',
  },

  errors: {
    storage: {
      tooLarge: 'Backup file is too large.',
      invalidJson: 'Backup file is not valid JSON.',
      notObject: 'Backup file must be a JSON object.',
      forbiddenKey: 'Backup file contains forbidden keys.',
      badFormat: 'This file is not a MeditateIt backup.',
      badVersion: 'This backup version is not supported.',
      badPresets: 'Backup presets are invalid.',
      presetsTooMany: 'Backup has too many presets.',
      exportFailed: 'Could not export backup.',
      importFailed: 'Could not import backup.',
      eraseFailed: 'Could not erase local data.',
      retentionFailed: 'Could not update history retention.',
      storageUnavailable: 'Local storage is unavailable.',
    },
    preset: {
      nameRequired: 'Name is required.',
      nameRequiredStrict: 'Preset name is required.',
      invalidRecipe: 'Invalid session recipe.',
      idRequired: 'Preset id is required.',
      cannotOverwriteSystem: 'Cannot overwrite a system preset.',
      tooMany: (max: number) => `At most ${max} user presets.`,
      saveFailed: 'Could not save preset.',
    },
  },
} as const

export type EnMessages = typeof en
