import { createSlice } from '@reduxjs/toolkit'

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedPreference = window.localStorage.getItem('theme')
  if (storedPreference === 'light' || storedPreference === 'dark') {
    return storedPreference
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme) => {
  if (typeof window === 'undefined') return

  const root = window.document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  window.localStorage.setItem('theme', theme)
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme,
  },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload
      applyTheme(action.payload)
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      applyTheme(state.mode)
    },
  },
})

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer
