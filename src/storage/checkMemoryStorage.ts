/**
 * In-memory window.localStorage for Node *.check.ts scripts.
 * Not used at runtime — check harness only.
 */

type MemoryStore = Map<string, string>

type MemoryLocalStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
  key(index: number): string | null
  readonly length: number
}

export function installMemoryLocalStorage(store: MemoryStore = new Map()): MemoryStore {
  const localStorage: MemoryLocalStorage = {
    getItem(key: string): string | null {
      return store.has(key) ? store.get(key)! : null
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value))
    },
    removeItem(key: string): void {
      store.delete(key)
    },
    clear(): void {
      store.clear()
    },
    key(index: number): string | null {
      return [...store.keys()][index] ?? null
    },
    get length(): number {
      return store.size
    },
  }

  Object.defineProperty(globalThis, 'window', {
    value: { localStorage },
    configurable: true,
    writable: true,
    enumerable: false,
  })
  return store
}

export function uninstallMemoryLocalStorage(): void {
  Reflect.deleteProperty(globalThis, 'window')
}
