import { messages } from '../../i18n'
import { useModalDialogFocus } from './useModalDialogFocus'

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
  const panelRef = useModalDialogFocus(open, onCancel, {
    initialFocus: 'primary',
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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="headphone-title"
        aria-describedby="headphone-body"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="headphone-title">{messages.dialogs.headphonesTitle}</h2>
        <p id="headphone-body">{messages.dialogs.headphonesBody}</p>
        <div className="headphone-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {messages.dialogs.cancel}
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            {messages.dialogs.headphonesConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}
