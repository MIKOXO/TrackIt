import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
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
    },
    clearUser: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.loading = false
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
