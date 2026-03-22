import apiClient from './apiClient.js'

export const askAssistant = (question, conversationId) => {
  if (!question?.trim()) {
    return Promise.reject(new Error('A question is required to consult the AI assistant.'))
  }

  const payload = {
    question: question.trim(),
  }
  if (conversationId) {
    payload.conversationId = conversationId
  }

  return apiClient.post('/api/assistant', payload)
}

export const fetchAssistantConversations = () => {
  return apiClient.get('/api/assistant/conversations')
}

export const createAssistantConversation = (title = 'Chat') => {
  return apiClient.post('/api/assistant/conversations', { title })
}

export const getAssistantConversation = (conversationId) => {
  return apiClient.get(`/api/assistant/conversations/${conversationId}`)
}

export const deleteAssistantConversation = (conversationId) => {
  if (!conversationId) {
    return Promise.reject(new Error('Conversation ID is required to delete a conversation.'))
  }
  return apiClient.delete(`/api/assistant/conversations/${conversationId}`)
}
