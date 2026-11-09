import { STORAGE_KEYS } from './keys.ts'
import { removeKey } from './local.ts'

export type EraseAllOptions = {
  /**
   * Also clear Cache Storage entries and unregister service workers.
   * Useful for a full “forget this install” wipe; default off so a
   * prefs/history erase does not drop the PWA shell unexpectedly.
   */
  clearCaches?: boolean
}

export type EraseAllResult = {
  removedKeys: string[]
  cachesCleared: boolean
  serviceWorkersUnregistered: number
}

/**
 * Wipe every MeditateIt localStorage key (prefs, presets, sequences,
 * history, retention). Optionally clears Cache Storage and unregisters
 * service workers.
 */
export async function eraseAllLocalData(
  options?: EraseAllOptions,
): Promise<EraseAllResult> {
  const removedKeys: string[] = []
  for (const key of Object.values(STORAGE_KEYS)) {
    await removeKey(key)
    removedKeys.push(key)
  }

  let cachesCleared = false
  let serviceWorkersUnregistered = 0

  if (options?.clearCaches) {
    if (typeof caches !== 'undefined') {
      try {
        const names = await caches.keys()
        await Promise.all(names.map((name) => caches.delete(name)))
        cachesCleared = true
      } catch {
        cachesCleared = false
      }
    }

    if (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      navigator.serviceWorker
    ) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((reg) => reg.unregister()))
        serviceWorkersUnregistered = regs.length
      } catch {
        serviceWorkersUnregistered = 0
      }
    }
  }

  return { removedKeys, cachesCleared, serviceWorkersUnregistered }
}
