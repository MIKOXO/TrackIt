import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  askAssistant as askAssistantAPI,
  fetchAssistantConversations as fetchAssistantConversationsAPI,
  createAssistantConversation as createAssistantConversationAPI,
  getAssistantConversation as getAssistantConversationAPI,
} from '../../services/aiAssistantService.js'

const generateMessageId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

const mapServerMessage = (message) => ({
  id: message.id,
  type: message.role === 'user' ? 'user' : 'assistant',
  content: message.content,
  timestamp: message.timestamp ? new Date(message.timestamp).toISOString() : new Date().toISOString(),
})

export const fetchAssistantConversations = createAsyncThunk(
  'assistant/fetchConversations',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await fetchAssistantConversationsAPI(token)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to load conversations')
    }
  }
)

export const startNewConversation = createAsyncThunk(
  'assistant/startConversation',
  async ({ token, title = 'Chat' }, { rejectWithValue }) => {
    try {
      const response = await createAssistantConversationAPI(token, title)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to start a new conversation')
    }
  }
)

export const loadAssistantConversation = createAsyncThunk(
  'assistant/loadConversation',
  async ({ token, conversationId }, { rejectWithValue }) => {
    try {
      const response = await getAssistantConversationAPI(conversationId, token)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to load the conversation')
    }
  }
)

export const sendAssistantQuestion = createAsyncThunk(
  'assistant/sendQuestion',
  async ({ question, token, conversationId }, { rejectWithValue }) => {
    if (!conversationId) {
      return rejectWithValue('No conversation selected.')
    }
    try {
      const response = await askAssistantAPI(question, token, conversationId)
      return {
        conversationId: response.data.conversationId,
        answer: response.data.answer,
        summary: response.data.summary,
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to consult the AI assistant')
    }
  }
)

const initialState = {
  conversations: [],
  activeConversationId: null,
  loadedConversationId: null,
  messages: [],
  summary: null,
  loading: false,
  error: null,
  historyLoading: false,
  historyLoaded: false,
  historyError: null,
  conversationLoading: false,
}

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    setActiveConversationId: (state, action) => {
      state.activeConversationId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssistantConversations.pending, (state) => {
        state.historyLoading = true
        state.historyError = null
        state.historyLoaded = false
      })
      .addCase(fetchAssistantConversations.fulfilled, (state, action) => {
        state.historyLoading = false
        state.historyLoaded = true
        state.conversations = action.payload.conversations
        if (!state.activeConversationId && action.payload.initialConversationId) {
          state.activeConversationId = action.payload.initialConversationId
        }
      })
      .addCase(fetchAssistantConversations.rejected, (state, action) => {
        state.historyLoading = false
        state.historyLoaded = true
        state.historyError = action.payload
      })
      .addCase(startNewConversation.fulfilled, (state, action) => {
        state.conversations = [action.payload, ...state.conversations]
        state.activeConversationId = action.payload.id
        state.loadedConversationId = action.payload.id
        state.messages = []
        state.summary = null
      })
      .addCase(loadAssistantConversation.pending, (state) => {
        state.conversationLoading = true
        state.error = null
      })
      .addCase(loadAssistantConversation.fulfilled, (state, action) => {
        state.conversationLoading = false
        state.messages = action.payload.messages.map(mapServerMessage)
        state.summary = action.payload.summary
        state.activeConversationId = action.payload.id
        state.loadedConversationId = action.payload.id
      })
      .addCase(loadAssistantConversation.rejected, (state, action) => {
        state.conversationLoading = false
        state.error = action.payload
      })
      .addCase(sendAssistantQuestion.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.messages.push({
          id: generateMessageId(),
          type: 'user',
          content: action.meta.arg.question,
          timestamp: new Date().toISOString(),
        })
      })
      .addCase(sendAssistantQuestion.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload.summary
        state.messages.push({
          id: generateMessageId(),
          type: 'assistant',
          content: action.payload.answer,
          timestamp: new Date().toISOString(),
        })
        state.activeConversationId = action.payload.conversationId
        const convoIndex = state.conversations.findIndex((c) => c.id === action.payload.conversationId)
        if (convoIndex >= 0) {
          const updatedConversation = {
            ...state.conversations[convoIndex],
            summary: action.payload.summary,
            lastMessage: action.payload.answer,
            updatedAt: new Date().toISOString(),
          }
          state.conversations.splice(convoIndex, 1)
          state.conversations.unshift(updatedConversation)
        }
      })
      .addCase(sendAssistantQuestion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setActiveConversationId } = assistantSlice.actions
export default assistantSlice.reducer
