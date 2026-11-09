import { messages } from '../../i18n'
import { useModalDialogFocus } from './useModalDialogFocus'

interface SavePresetDialogProps {
  open: boolean
  name: string
  canOverwrite: boolean
  saving: boolean
  error: string | null
  onNameChange: (name: string) => void
  onCancel: () => void
  onSaveNew: () => void
  onOverwrite: () => void
  /** Defaults to preset copy so sequence save can reuse the same dialog. */
  title?: string
  description?: string
}

export function SavePresetDialog({
  open,
  name,
  canOverwrite,
  saving,
  error,
  onNameChange,
  onCancel,
  onSaveNew,
  onOverwrite,
  title = messages.dialogs.savePresetTitle,
  description = messages.dialogs.savePresetBody,
}: SavePresetDialogProps) {
  const panelRef = useModalDialogFocus(open, onCancel, {
    initialFocus: 'first',
  })

  if (!open) return null

  return (
    <div
      className="headphone-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        ref={panelRef}
        className="headphone-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-preset-title"
        aria-describedby="save-preset-body"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="save-preset-title">{title}</h2>
        <p id="save-preset-body">{description}</p>
        <label className="save-preset-field">
          {messages.dialogs.name}
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={60}
            disabled={saving}
            aria-invalid={Boolean(error)}
          />
        </label>
        {error ? (
          <p className="save-preset-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="headphone-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={saving}
          >
            {messages.dialogs.cancel}
          </button>
          {canOverwrite ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onOverwrite}
              disabled={saving || !name.trim()}
            >
              {messages.dialogs.update}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSaveNew}
            disabled={saving || !name.trim()}
          >
            {saving
              ? messages.dialogs.saving
              : canOverwrite
                ? messages.dialogs.saveAsNew
                : messages.dialogs.save}
          </button>
        </div>
      </div>
    </div>
  )
}
