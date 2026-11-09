import { BINAURAL_REQUIRES_HEADPHONES } from './bridges'

interface HeadphoneWarningProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function HeadphoneWarning({
  open,
  onConfirm,
  onCancel,
}: HeadphoneWarningProps) {
  if (!open) return null

  return (
    <div
      className="headphone-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="headphone-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="headphone-title"
        aria-describedby="headphone-body"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="headphone-title">Headphones needed</h2>
        <p id="headphone-body">{BINAURAL_REQUIRES_HEADPHONES}</p>
        <div className="headphone-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            I have headphones
          </button>
        </div>
      </div>
    </div>
  )
}
