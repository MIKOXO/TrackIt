import React, { useEffect, useRef, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

const BUTTON_BASE =
  'w-full rounded-xl border border-slate-200/60 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/40 dark:text-slate-50'

const BUTTON_OPEN = 'border-emerald-400 ring-2 ring-emerald-500/20'

const MENU_BASE =
  'absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200/70 bg-white shadow-2xl shadow-black/10 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-950'

const OPTION_BASE = 'w-full cursor-pointer px-4 py-2 text-left text-sm transition focus:outline-none'
const OPTION_ACTIVE =
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100'
const OPTION_INACTIVE =
  'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10'

export default function DropdownSelect({ value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const selected = options.find((opt) => opt.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (containerRef.current?.contains(event.target)) return
      setOpen(false)
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={`${BUTTON_BASE} ${open ? BUTTON_OPEN : ''} flex items-center justify-between gap-3`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="truncate">{selected?.label ?? 'Select'}</span>
        <FiChevronDown className={`h-4 w-4 flex-shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div role="listbox" aria-label={ariaLabel} className={MENU_BASE}>
          {options.map((opt) => {
            const isActive = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`${OPTION_BASE} ${isActive ? OPTION_ACTIVE : OPTION_INACTIVE}`}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

