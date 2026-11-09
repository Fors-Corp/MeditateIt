import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export interface ModalDialogFocusOptions {
  /** Prefer `.btn-primary` when present (alertdialog confirm). */
  initialFocus?: 'first' | 'primary'
}

/**
 * Focus management for modal dialogs: move focus in on open, trap Tab,
 * close on Escape, restore focus on close/unmount.
 */
export function useModalDialogFocus(
  open: boolean,
  onClose: () => void,
  options: ModalDialogFocusOptions = {},
) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const initialFocus = options.initialFocus ?? 'first'

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    if (!panel) return

    const focusables = () =>
      [...panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
        (el) => el.getClientRects().length > 0,
      )

    if (!panel.hasAttribute('tabindex')) {
      panel.tabIndex = -1
    }

    const nodes = focusables()
    const primary = panel.querySelector<HTMLElement>('.btn-primary')
    const target =
      initialFocus === 'primary' && primary
        ? primary
        : (nodes[0] ?? panel)
    target.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const list = focusables()
      if (list.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      const previous = previousFocusRef.current
      if (previous && typeof previous.focus === 'function') {
        previous.focus()
      }
    }
  }, [open, onClose, initialFocus])

  return panelRef
}
