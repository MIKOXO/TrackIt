import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createTransaction as createTransactionAPI, getTransactions as getTransactionsAPI } from '../../services/transactionService'

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (token, { rejectWithValue }) => {
    try {
      const response = await getTransactionsAPI(token)
      return response.data.transactions ?? []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

export const addTransaction = createAsyncThunk(
  'transactions/addTransaction',
  async ({ payload, token }, { rejectWithValue }) => {
    try {
      const response = await createTransactionAPI(payload, token)
      return response.data.transaction
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create transaction')
    }
  }
)

const initialState = {
  transactions: [],
  loading: false,
  error: null,
}

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.transactions = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addTransaction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = [action.payload, ...state.transactions]
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearTransactions } = transactionSlice.actions
export default transactionSlice.reducer
