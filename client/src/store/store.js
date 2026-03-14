import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import analyticsReducer from './slices/analyticsSlice'
import layoutReducer from './slices/layoutSlice'
import transactionReducer from './slices/transactionSlice'
import themeReducer from './slices/themeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analytics: analyticsReducer,
    layout: layoutReducer,
    transactions: transactionReducer,
    theme: themeReducer,
  },
})
