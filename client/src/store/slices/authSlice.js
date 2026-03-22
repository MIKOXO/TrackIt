import { createSlice } from '@reduxjs/toolkit'

const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null }
  }

  const userRaw = window.localStorage.getItem('trackitUser')
  if (!userRaw) {
    return { user: null }
  }

  try {
    return { user: JSON.parse(userRaw) }
  } catch {
    return { user: null }
  }
}

const persistAuth = (user) => {
  if (typeof window === 'undefined') {
    return
  }

  if (user) {
    window.localStorage.setItem('trackitUser', JSON.stringify(user))
  } else {
    window.localStorage.removeItem('trackitUser')
  }
}

const stored = getStoredAuth()

const initialState = {
  user: stored.user,
  isAuthenticated: Boolean(stored.user),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const user = action.payload?.user ?? action.payload
      state.user = user
      state.isAuthenticated = Boolean(user)
      state.error = null
      state.loading = false
      persistAuth(user)
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.loading = false
      persistAuth(null)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const { setUser, clearUser, setLoading, setError } = authSlice.actions
export default authSlice.reducer
