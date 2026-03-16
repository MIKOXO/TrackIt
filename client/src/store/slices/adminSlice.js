import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getDashboardStats,
  getUserStats,
  getAllUsers,
  updateUserStatus,
  deleteUserAccount,
} from '../../services/adminService'

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await getDashboardStats({ token })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats')
    }
  }
)

export const fetchUserStats = createAsyncThunk(
  'admin/fetchUserStats',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await getUserStats({ token })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user stats')
    }
  }
)

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await getAllUsers({ token })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const updateUserStatusAsync = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ token, userId, status }, { rejectWithValue }) => {
    try {
      const response = await updateUserStatus({ token, userId, status })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status')
    }
  }
)

export const deleteUserAsync = createAsyncThunk(
  'admin/deleteUser',
  async ({ token, userId }, { rejectWithValue }) => {
    try {
      const response = await deleteUserAccount({ token, userId })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  }
)

const initialState = {
  dashboard: {
    data: null,
    loading: false,
    error: null,
  },
  userStats: {
    data: null,
    loading: false,
    error: null,
  },
  users: {
    data: [],
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
  },
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.dashboard.data = null
      state.dashboard.error = null
      state.dashboard.loading = false
    },
    clearUserStats: (state) => {
      state.userStats.data = null
      state.userStats.error = null
      state.userStats.loading = false
    },
    clearUsers: (state) => {
      state.users.data = []
      state.users.error = null
      state.users.loading = false
      state.users.actionLoading = false
      state.users.actionError = null
    },
    clearAllAdmin: (state) => {
      state.dashboard = { data: null, loading: false, error: null }
      state.userStats = { data: null, loading: false, error: null }
      state.users = { data: [], loading: false, error: null }
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.dashboard.loading = true
        state.dashboard.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboard.loading = false
        state.dashboard.data = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.dashboard.loading = false
        state.dashboard.error = action.payload
      })
      // User stats
      .addCase(fetchUserStats.pending, (state) => {
        state.userStats.loading = true
        state.userStats.error = null
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats.loading = false
        state.userStats.data = action.payload
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.userStats.loading = false
        state.userStats.error = action.payload
      })
      // All users
    .addCase(fetchAllUsers.pending, (state) => {
      state.users.loading = true
      state.users.error = null
    })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users.loading = false
        state.users.data = action.payload
      })
    .addCase(fetchAllUsers.rejected, (state, action) => {
      state.users.loading = false
      state.users.error = action.payload
    })
      .addCase(updateUserStatusAsync.pending, (state) => {
        state.users.actionLoading = true
        state.users.actionError = null
      })
      .addCase(updateUserStatusAsync.fulfilled, (state, action) => {
        state.users.actionLoading = false
        const { userId, status } = action.payload
        state.users.data = state.users.data.map((user) =>
          String(user.id) === String(userId) ? { ...user, status } : user
        )
      })
      .addCase(updateUserStatusAsync.rejected, (state, action) => {
        state.users.actionLoading = false
        state.users.actionError = action.payload
      })
      .addCase(deleteUserAsync.pending, (state) => {
        state.users.actionLoading = true
        state.users.actionError = null
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.users.actionLoading = false
        const { userId } = action.payload
        state.users.data = state.users.data.filter((user) => String(user.id) !== String(userId))
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.users.actionLoading = false
        state.users.actionError = action.payload
      })
  },
})

export const { clearDashboard, clearUserStats, clearUsers, clearAllAdmin } = adminSlice.actions
export default adminSlice.reducer
