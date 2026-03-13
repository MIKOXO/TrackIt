# Redux Architecture Documentation

## Overview

This application uses Redux Toolkit for centralized state management, ensuring a clean, scalable, and maintainable codebase.

## Store Structure

```
store/
├── slices/
│   ├── authSlice.js          # Authentication state
│   ├── layoutSlice.js        # UI layout state (sidebar)
│   ├── transactionSlice.js   # Transaction data & operations
│   └── themeSlice.js         # Theme preferences
├── selectors.js              # Reusable memoized selectors
└── store.js                  # Redux store configuration
```

## State Slices

### 1. Auth Slice (`authSlice.js`)

**Purpose:** Manages user authentication state and session persistence.

**State:**
```javascript
{
  user: Object | null,
  token: String | null,
  isAuthenticated: Boolean,
  loading: Boolean,
  error: String | null
}
```

**Actions:**
- `setUser(payload)` - Set authenticated user and token
- `clearUser()` - Clear user session (logout)
- `setLoading(payload)` - Set loading state
- `setError(payload)` - Set error message

**Persistence:** Automatically syncs with localStorage (`trackitToken`, `trackitUser`)

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { setUser, clearUser } from '../store/slices/authSlice'

const { user, token, isAuthenticated } = useSelector((state) => state.auth)
dispatch(setUser({ user: userData, token: authToken }))
```

---

### 2. Transaction Slice (`transactionSlice.js`)

**Purpose:** Manages transaction data with async operations for API calls.

**State:**
```javascript
{
  transactions: Array,
  loading: Boolean,
  error: String | null
}
```

**Async Thunks:**
- `fetchTransactions(token)` - Fetch all user transactions
- `addTransaction({ payload, token })` - Create new transaction

**Actions:**
- `clearTransactions()` - Clear all transactions (on logout)

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { fetchTransactions, addTransaction } from '../store/slices/transactionSlice'

const { transactions, loading } = useSelector((state) => state.transactions)

// Fetch transactions
dispatch(fetchTransactions(token))

// Add transaction
dispatch(addTransaction({ payload: transactionData, token }))
  .unwrap()
  .then(() => console.log('Success'))
  .catch((error) => console.error(error))
```

---

### 3. Theme Slice (`themeSlice.js`)

**Purpose:** Manages dark/light theme with localStorage persistence.

**State:**
```javascript
{
  mode: 'dark' | 'light'
}
```

**Actions:**
- `setTheme(mode)` - Set specific theme mode
- `toggleTheme()` - Toggle between dark and light

**Persistence:** Automatically syncs with localStorage and applies to DOM

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../store/slices/themeSlice'

const theme = useSelector((state) => state.theme.mode)
dispatch(toggleTheme())
```

---

### 4. Layout Slice (`layoutSlice.js`)

**Purpose:** Manages UI layout state (sidebar open/closed).

**State:**
```javascript
{
  sidebarOpen: Boolean
}
```

**Actions:**
- `setSidebarOpen(value)` - Set sidebar state
- `toggleSidebar()` - Toggle sidebar

**Persistence:** Automatically syncs with localStorage

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar } from '../store/slices/layoutSlice'

const sidebarOpen = useSelector((state) => state.layout.sidebarOpen)
dispatch(toggleSidebar())
```

---

## Selectors (`selectors.js`)

Reusable, memoized selectors for efficient state access and derived data.

**Available Selectors:**

```javascript
// Auth
selectUser(state)
selectToken(state)
selectIsAuthenticated(state)

// Transactions
selectTransactions(state)
selectTransactionsLoading(state)
selectIncomeTransactions(state)        // Memoized
selectExpenseTransactions(state)       // Memoized
selectTotalIncome(state)               // Memoized
selectTotalExpenses(state)             // Memoized
selectTotalBalance(state)              // Memoized
selectExpensesByCategory(state)        // Memoized

// Theme
selectTheme(state)
selectIsDarkMode(state)

// Layout
selectSidebarOpen(state)
```

**Usage:**
```javascript
import { useSelector } from 'react-redux'
import { selectTotalBalance, selectExpensesByCategory } from '../store/selectors'

const totalBalance = useSelector(selectTotalBalance)
const categoryData = useSelector(selectExpensesByCategory)
```

---

## Best Practices

### 1. Use Selectors for Derived Data
❌ **Bad:**
```javascript
const { transactions } = useSelector((state) => state.transactions)
const totalIncome = transactions
  .filter((t) => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0)
```

✅ **Good:**
```javascript
import { selectTotalIncome } from '../store/selectors'
const totalIncome = useSelector(selectTotalIncome)
```

### 2. Handle Async Thunks Properly
❌ **Bad:**
```javascript
dispatch(fetchTransactions(token))
// No error handling
```

✅ **Good:**
```javascript
dispatch(fetchTransactions(token))
  .unwrap()
  .then(() => showToast('Success'))
  .catch((error) => showToast(error, { type: 'error' }))
```

### 3. Clear State on Logout
Always clear sensitive data when user logs out:
```javascript
const handleSignOut = () => {
  dispatch(clearUser())
  dispatch(clearTransactions())
  navigate('/')
}
```

### 4. Avoid Prop Drilling
Use Redux for global state, not props:
❌ **Bad:** Passing `user` through 5 component levels
✅ **Good:** `const { user } = useSelector((state) => state.auth)`

### 5. Keep Components Clean
Move business logic to selectors and thunks, not components.

---

## File Organization

### Components Using Redux

**Auth-related:**
- `SignIn.jsx` - Uses auth slice for login
- `SignUp.jsx` - Uses auth slice for registration
- `Sidebar.jsx` - Uses auth for user info, clears state on logout

**Transaction-related:**
- `Transactions.jsx` - Fetches and creates transactions
- `Overview.jsx` - Displays transaction summaries
- `Analytics.jsx` - Shows spending analytics
- `AddTransactionModal.jsx` - Creates transactions

**UI-related:**
- `DashboardNavbar.jsx` - Uses theme slice
- `UserLayout.jsx` - Uses layout slice for sidebar
- `AdminLayout.jsx` - Uses auth and layout slices

---

## Adding New State

To add new state to Redux:

1. **Create a new slice:**
```javascript
// store/slices/newSlice.js
import { createSlice } from '@reduxjs/toolkit'

const newSlice = createSlice({
  name: 'newFeature',
  initialState: { data: [] },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload
    }
  }
})

export const { setData } = newSlice.actions
export default newSlice.reducer
```

2. **Add to store:**
```javascript
// store/store.js
import newReducer from './slices/newSlice'

export const store = configureStore({
  reducer: {
    // ... existing reducers
    newFeature: newReducer,
  },
})
```

3. **Create selectors (optional):**
```javascript
// store/selectors.js
export const selectNewData = (state) => state.newFeature.data
```

4. **Use in components:**
```javascript
import { useSelector, useDispatch } from 'react-redux'
import { setData } from '../store/slices/newSlice'

const data = useSelector((state) => state.newFeature.data)
dispatch(setData(newData))
```

---

## Testing Redux

When testing components with Redux:

```javascript
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
  },
  preloadedState: {
    auth: { user: mockUser, token: 'test-token' },
    transactions: { transactions: [], loading: false },
  },
})

render(
  <Provider store={mockStore}>
    <YourComponent />
  </Provider>
)
```

---

## Migration Checklist

When refactoring components to use Redux:

- [ ] Identify local state that should be global
- [ ] Create/update appropriate slice
- [ ] Replace useState with useSelector
- [ ] Replace direct API calls with thunks
- [ ] Add error handling for async operations
- [ ] Clear state on logout if needed
- [ ] Test all user flows
- [ ] Remove unused local state

---

## Performance Tips

1. **Use memoized selectors** for expensive computations
2. **Avoid inline selectors** - define them outside components
3. **Use `createSelector`** from Redux Toolkit for derived data
4. **Split large slices** if they grow too complex
5. **Normalize nested data** for better performance

---

## Common Patterns

### Pattern 1: Fetch on Mount
```javascript
useEffect(() => {
  if (token) {
    dispatch(fetchTransactions(token))
  }
}, [token, dispatch])
```

### Pattern 2: Optimistic Updates
```javascript
const handleDelete = async (id) => {
  dispatch(removeTransaction(id)) // Optimistic
  try {
    await deleteTransactionAPI(id, token)
  } catch (error) {
    dispatch(addTransaction(originalTransaction)) // Rollback
  }
}
```

### Pattern 3: Conditional Fetching
```javascript
useEffect(() => {
  if (token && transactions.length === 0) {
    dispatch(fetchTransactions(token))
  }
}, [token, dispatch, transactions.length])
```

---

## Troubleshooting

**Issue:** State not updating
- Check if reducer is added to store
- Verify action is dispatched correctly
- Use Redux DevTools to inspect actions

**Issue:** Stale data after logout
- Ensure all slices have clear actions
- Call clear actions in logout handler

**Issue:** Performance issues
- Use memoized selectors
- Avoid creating new objects in selectors
- Consider normalizing state shape

---

## Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux Best Practices](https://redux.js.org/style-guide/style-guide)
- [Reselect (Memoized Selectors)](https://github.com/reduxjs/reselect)
