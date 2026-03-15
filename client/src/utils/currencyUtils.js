const formatterCache = new Map()

const getCurrencyFormatter = (currency, locale) => {
  const normalizedCurrency = (currency || 'ETB').toUpperCase()
  const normalizedLocale = locale || 'en-US'
  const key = `${normalizedLocale}:${normalizedCurrency}`

  const cached = formatterCache.get(key)
  if (cached) return cached

  const formatter = new Intl.NumberFormat(normalizedLocale, {
    style: 'currency',
    currency: normalizedCurrency,
  })
  formatterCache.set(key, formatter)
  return formatter
}

export const formatCurrency = (value, currency, locale) => {
  const formatter = getCurrencyFormatter(currency, locale)
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return formatter.format(0)
  }
  return formatter.format(Number(value))
}
