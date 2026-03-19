import { createSelector } from '@reduxjs/toolkit'

// Auth selectors
export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated

// Transaction selectors
export const selectTransactions = (state) => state.transactions.transactions
export const selectTransactionsLoading = (state) => state.transactions.loading
export const selectTransactionsError = (state) => state.transactions.error

// Memoized transaction selectors
export const selectIncomeTransactions = createSelector(
  [selectTransactions],
  (transactions) => transactions.filter((t) => t.type === 'income')
)

export const selectExpenseTransactions = createSelector(
  [selectTransactions],
  (transactions) => transactions.filter((t) => t.type === 'expense')
)

export const selectTotalIncome = createSelector(
  [selectIncomeTransactions],
  (incomeTransactions) => incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
)

export const selectTotalExpenses = createSelector(
  [selectExpenseTransactions],
  (expenseTransactions) => expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
)

export const selectTotalBalance = createSelector(
  [selectTotalIncome, selectTotalExpenses],
  (income, expenses) => income - expenses
)

export const selectExpensesByCategory = createSelector(
  [selectExpenseTransactions],
  (expenseTransactions) => {
    const categoryTotals = {}
    expenseTransactions.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
    })
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }
)

// Theme selectors
export const selectTheme = (state) => state.theme.mode
export const selectIsDarkMode = (state) => state.theme.mode === 'dark'

// Layout selectors
export const selectSidebarOpen = (state) => state.layout.sidebarOpen

// AI assistant selectors
export const selectAssistantConversations = (state) => state.assistant.conversations
export const selectActiveAssistantConversationId = (state) => state.assistant.activeConversationId
export const selectAssistantLoadedConversationId = (state) => state.assistant.loadedConversationId
export const selectAssistantMessages = (state) => state.assistant.messages
export const selectAssistantLoading = (state) => state.assistant.loading
export const selectAssistantError = (state) => state.assistant.error
export const selectAssistantSummary = (state) => state.assistant.summary
export const selectAssistantHistoryLoading = (state) => state.assistant.historyLoading
export const selectAssistantHistoryError = (state) => state.assistant.historyError
export const selectAssistantHistoryLoaded = (state) => state.assistant.historyLoaded
export const selectAssistantConversationLoading = (state) => state.assistant.conversationLoading
