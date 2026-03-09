import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const applyInitialTheme = () => {
  const storedPreference = window.localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const shouldUseDark = storedPreference === 'dark' || (storedPreference !== 'light' && prefersDark)

  window.document.documentElement.classList.toggle('dark', shouldUseDark)
}

const rootElement = document.getElementById('root')

if (rootElement) {
  applyInitialTheme()

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
