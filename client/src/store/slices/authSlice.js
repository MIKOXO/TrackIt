import { createSlice } from '@reduxjs/toolkit'

const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null }
  }

  const token = window.localStorage.getItem('trackitToken')
  const userRaw = window.localStorage.getItem('trackitUser')
  let user = null

  if (userRaw) {
    try {
      user = JSON.parse(userRaw)
    } catch {
      user = null
    }
  }

  return { user, token }
}

const persistAuth = (user, token) => {
  if (typeof window === 'undefined') {
    return
  }

  if (token) {
    window.localStorage.setItem('trackitToken', token)
  } else {
    window.localStorage.removeItem('trackitToken')
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
  token: stored.token,
  isAuthenticated: Boolean(stored.token),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = Boolean(action.payload.token)
      state.error = null
      state.loading = false
      persistAuth(action.payload.user, action.payload.token)
    },
    clearUser: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.loading = false
      persistAuth(null, null)
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
