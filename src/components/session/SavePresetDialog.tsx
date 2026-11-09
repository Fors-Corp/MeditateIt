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
        <h2 id="save-preset-title">Save preset</h2>
        <p id="save-preset-body">
          Store this soundscape locally on this device. No account needed.
        </p>
        <label className="save-preset-field">
          Name
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
            Cancel
          </button>
          {canOverwrite ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onOverwrite}
              disabled={saving || !name.trim()}
            >
              Update
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSaveNew}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Saving…' : canOverwrite ? 'Save as new' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
