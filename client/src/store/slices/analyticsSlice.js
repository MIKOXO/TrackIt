import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAnalytics as getAnalyticsAPI } from '../../services/analyticsService'

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async ({ token, months, days }, { rejectWithValue }) => {
    try {
      const response = await getAnalyticsAPI({ token, months, days })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics')
    }
  }
)

const initialState = {
  data: null,
  loading: false,
  error: null,
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer

