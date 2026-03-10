import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ToastProvider } from './components/ui/ToastProvider.jsx'
import './index.css'
import App from './App.jsx'
import { store } from './store/store.js'

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
        <Provider store={store}>
          <ToastProvider>
            <App />
          </ToastProvider>
        </Provider>
      </StrictMode>,
    )
  }
