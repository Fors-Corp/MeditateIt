/**
 * Stable storage / backup error codes + EN copy mapping.
 * Catalog lives in `src/i18n` (W4-7); this module keeps the storage API surface.
 */

export {
  messageForStorageError,
  STORAGE_ERROR,
  type StorageErrorCode,
} from '../i18n/index.ts'
