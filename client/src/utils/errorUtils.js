export const getServerMessage = (error, fallback = 'Something went wrong. Try again later.') => {
  if (!error) return fallback
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallback
  )
}
