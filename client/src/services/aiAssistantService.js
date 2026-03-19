import apiClient from './apiClient.js'

const withAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export const askAssistant = (question, token, conversationId) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to access the AI assistant.'))
  }

  if (!question?.trim()) {
    return Promise.reject(new Error('A question is required to consult the AI assistant.'))
  }

  const payload = {
    question: question.trim(),
  }
  if (conversationId) {
    payload.conversationId = conversationId
  }

  return apiClient.post('/api/assistant', payload, withAuthHeader(token))
}

export const fetchAssistantConversations = (token) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to access the AI assistant.'))
  }
  return apiClient.get('/api/assistant/conversations', withAuthHeader(token))
}

export const createAssistantConversation = (token, title = 'Chat') => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to access the AI assistant.'))
  }
  return apiClient.post('/api/assistant/conversations', { title }, withAuthHeader(token))
}

export const getAssistantConversation = (conversationId, token) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to access the AI assistant.'))
  }
  return apiClient.get(`/api/assistant/conversations/${conversationId}`, withAuthHeader(token))
}
