import React, { useEffect, useRef } from 'react'

const OtpInput = ({
  value = '',
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = false,
  hasError = false,
  label = 'Verification code',
}) => {
  const inputsRef = useRef([])
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')

  useEffect(() => {
    if (autoFocus) {
      inputsRef.current[0]?.focus()
    }
  }, [autoFocus])

  const focusInput = (index) => {
    const nextIndex = Math.max(0, Math.min(index, length - 1))
    inputsRef.current[nextIndex]?.focus()
  }

  const commitDigits = (nextDigits, previousLength) => {
    const nextValue = nextDigits.join('').slice(0, length)
    onChange?.(nextValue)
    if (previousLength < length && nextValue.length === length) {
      onComplete?.(nextValue)
    }
    return nextValue
  }

  const handleChange = (index, event) => {
    const raw = event.target.value.replace(/\D/g, '')
    const nextDigits = [...digits]
    const previousLength = digits.join('').length

    if (!raw) {
      nextDigits[index] = ''
      commitDigits(nextDigits, previousLength)
      return
    }

    const characters = raw.slice(0, length - index).split('')
    characters.forEach((character, offset) => {
      nextDigits[index + offset] = character
    })

    commitDigits(nextDigits, previousLength)
    focusInput(index + characters.length)
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const nextDigits = [...digits]
      const previousLength = digits.join('').length

      if (nextDigits[index]) {
        nextDigits[index] = ''
        commitDigits(nextDigits, previousLength)
        return
      }

      if (index > 0) {
        nextDigits[index - 1] = ''
        commitDigits(nextDigits, previousLength)
        focusInput(index - 1)
      }
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusInput(index - 1)
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusInput(index + 1)
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusInput(0)
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusInput(length - 1)
    }
  }

  const handlePaste = (index, event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) {
      return
    }

    event.preventDefault()
    const previousLength = digits.join('').length
    const startIndex = pasted.length === length ? 0 : index
    const nextDigits = Array.from({ length }, (_, position) =>
      startIndex === 0 ? '' : digits[position] ?? '',
    )

    pasted
      .slice(0, length - startIndex)
      .split('')
      .forEach((character, offset) => {
        nextDigits[startIndex + offset] = character
      })

    commitDigits(nextDigits, previousLength)
    focusInput(Math.min(startIndex + pasted.length, length - 1))
  }

  const inputClasses = hasError
    ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/60 dark:border-rose-500 dark:focus:border-rose-400'
    : 'border-slate-200/60 focus:border-emerald-400 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:focus:border-emerald-400'

  return (
    <div className='flex items-center justify-center gap-2 sm:gap-3' role='group' aria-label={label}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element
          }}
          type='text'
          inputMode='numeric'
          pattern='[0-9]*'
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          disabled={disabled}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`${label} digit ${index + 1}`}
          aria-invalid={hasError}
          className={`h-12 w-11 rounded-xl border bg-white/80 text-center text-xl font-semibold text-slate-900 shadow-sm shadow-black/5 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900/60 dark:text-slate-50 sm:h-14 sm:w-12 ${inputClasses}`}
        />
      ))}
    </div>
  )
}

export default OtpInput
