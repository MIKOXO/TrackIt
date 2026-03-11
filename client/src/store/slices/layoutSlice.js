import { createSlice } from '@reduxjs/toolkit'

const getInitialSidebarState = () => {
  if (typeof window === 'undefined') {
    return true
  }

  const stored = window.localStorage.getItem('trackitSidebarOpen')
  if (stored === 'false') {
    return false
  }
  if (stored === 'true') {
    return true
  }

  return true
}

const persistSidebarState = (value) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem('trackitSidebarOpen', value ? 'true' : 'false')
}

const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    sidebarOpen: getInitialSidebarState(),
  },
  reducers: {
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
      persistSidebarState(action.payload)
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
      persistSidebarState(state.sidebarOpen)
    },
  },
})

export const { setSidebarOpen, toggleSidebar } = layoutSlice.actions
export default layoutSlice.reducer
