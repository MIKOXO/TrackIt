import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  verifyEmail as verifyEmailAPI,
  resendOtp as resendOtpAPI,
  requestPasswordReset as requestPasswordResetAPI,
  resetPassword as resetPasswordAPI,
} from '../../services/authService.js'

const toAuthError = (error, fallback) => {
  const data = error?.response?.data ?? {}
  return {
    message: data.message || error?.message || fallback,
    code: data.code ?? null,
    retryAfter: data.retryAfter ?? null,
    attemptsRemaining: data.attemptsRemaining ?? null,
  }
}

export const verifyEmailCode = createAsyncThunk(
  'auth/verifyEmailCode',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await verifyEmailAPI(payload)
      return response.data
    } catch (error) {
      return rejectWithValue(toAuthError(error, 'Unable to verify that code.'))
    }
  },
)

export const resendOtpCode = createAsyncThunk(
  'auth/resendOtpCode',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await resendOtpAPI(payload)
      return response.data
    } catch (error) {
      return rejectWithValue(toAuthError(error, 'Unable to send a new code.'))
    }
  },
)

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await requestPasswordResetAPI(payload)
      return response.data
    } catch (error) {
      return rejectWithValue(toAuthError(error, 'Unable to start password reset.'))
    }
  },
)

export const resetPasswordWithOtp = createAsyncThunk(
  'auth/resetPasswordWithOtp',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await resetPasswordAPI(payload)
      return response.data
    } catch (error) {
      return rejectWithValue(toAuthError(error, 'Unable to reset your password.'))
    }
  },
)

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
  verificationLoading: false,
  verificationError: null,
  resendLoading: false,
  resendError: null,
  resetRequestLoading: false,
  resetRequestError: null,
  passwordResetLoading: false,
  passwordResetError: null,
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
    clearAuthFeedback: (state) => {
      state.verificationError = null
      state.resendError = null
      state.resetRequestError = null
      state.passwordResetError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyEmailCode.pending, (state) => {
        state.verificationLoading = true
        state.verificationError = null
      })
      .addCase(verifyEmailCode.fulfilled, (state, action) => {
        const user = action.payload?.user ?? null
        state.verificationLoading = false
        state.verificationError = null
        state.user = user
        state.isAuthenticated = Boolean(user)
        state.error = null
        state.loading = false
        persistAuth(user)
      })
      .addCase(verifyEmailCode.rejected, (state, action) => {
        state.verificationLoading = false
        state.verificationError = action.payload
      })
      .addCase(resendOtpCode.pending, (state) => {
        state.resendLoading = true
        state.resendError = null
      })
      .addCase(resendOtpCode.fulfilled, (state) => {
        state.resendLoading = false
        state.resendError = null
      })
      .addCase(resendOtpCode.rejected, (state, action) => {
        state.resendLoading = false
        state.resendError = action.payload
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.resetRequestLoading = true
        state.resetRequestError = null
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.resetRequestLoading = false
        state.resetRequestError = null
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.resetRequestLoading = false
        state.resetRequestError = action.payload
      })
      .addCase(resetPasswordWithOtp.pending, (state) => {
        state.passwordResetLoading = true
        state.passwordResetError = null
      })
      .addCase(resetPasswordWithOtp.fulfilled, (state) => {
        state.passwordResetLoading = false
        state.passwordResetError = null
      })
      .addCase(resetPasswordWithOtp.rejected, (state, action) => {
        state.passwordResetLoading = false
        state.passwordResetError = action.payload
      })
  },
})

export const { setUser, clearUser, setLoading, setError, clearAuthFeedback } =
  authSlice.actions
export default authSlice.reducer
