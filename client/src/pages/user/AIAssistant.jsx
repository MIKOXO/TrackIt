import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiPlus, FiChevronDown, FiClock } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../../components/ui/ToastProvider.jsx'
import {
  selectAssistantConversations,
  selectAssistantConversationLoading,
  selectAssistantError,
  selectAssistantHistoryError,
  selectAssistantHistoryLoaded,
  selectAssistantHistoryLoading,
  selectAssistantLoadedConversationId,
  selectAssistantLoading,
  selectAssistantMessages,
  selectActiveAssistantConversationId,
  selectToken,
} from '../../store/selectors.js'
import {
  fetchAssistantConversations,
  loadAssistantConversation,
  sendAssistantQuestion,
  startNewConversation,
  setActiveConversationId,
} from '../../store/slices/assistantSlice.js'

const truncateText = (value = '', max = 80) => {
  if (!value) return ''
  if (value.length <= max) return value
  return `${value.slice(0, max).trim()}…`
}

const getConversationPreview = (conversation) => {
  const candidate = conversation.lastMessage
  if (!candidate) {
    return 'No messages yet.'
  }
  return truncateText(candidate, 90)
}

const AIAssistant = () => {
  const [inputValue, setInputValue] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const conversations = useSelector(selectAssistantConversations)
  const activeConversationId = useSelector(selectActiveAssistantConversationId)
  const loadedConversationId = useSelector(selectAssistantLoadedConversationId)
  const messages = useSelector(selectAssistantMessages)
  const isLoading = useSelector(selectAssistantLoading)
  const isConversationLoading = useSelector(selectAssistantConversationLoading)
  const historyLoading = useSelector(selectAssistantHistoryLoading)
  const historyLoaded = useSelector(selectAssistantHistoryLoaded)
  const error = useSelector(selectAssistantError)
  const historyError = useSelector(selectAssistantHistoryError)
  const token = useSelector(selectToken)

  useEffect(() => {
    if (error) {
      showToast(error, { type: 'error' })
    }
  }, [error, showToast])

  useEffect(() => {
    if (historyError) {
      showToast(historyError, { type: 'error' })
    }
  }, [historyError, showToast])

  useEffect(() => {
    if (token) {
      dispatch(fetchAssistantConversations({ token }))
    }
  }, [dispatch, token])

  useEffect(() => {
    if (token && historyLoaded && !historyError && conversations.length === 0) {
      dispatch(startNewConversation({ token }))
    }
  }, [dispatch, token, historyLoaded, historyError, conversations.length])

  useEffect(() => {
    if (token && activeConversationId && activeConversationId !== loadedConversationId) {
      dispatch(loadAssistantConversation({ token, conversationId: activeConversationId }))
    }
  }, [dispatch, token, activeConversationId, loadedConversationId])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    if (!token) {
      showToast('Please sign in to use the AI assistant.', { type: 'error' })
      return
    }
    if (!activeConversationId) {
      showToast('Start a new chat to continue.', { type: 'error' })
      return
    }

    dispatch(
      sendAssistantQuestion({
        question: inputValue.trim(),
        token,
        conversationId: activeConversationId,
      })
    )
    setInputValue('')
  }

  const handleStartNewChat = () => {
    if (!token) {
      showToast('Please sign in to use the AI assistant.', { type: 'error' })
      return
    }

    dispatch(startNewConversation({ token }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSelectConversation = (conversationId) => {
    if (conversationId === activeConversationId) return
    dispatch(setActiveConversationId(conversationId))
    setIsHistoryOpen(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 80px)', minHeight: 'calc(100vh - 80px)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-400 dark:text-slate-400">AI Assistant</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Get personalized AI guidance</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Ask questions about your finances and keep the conversation going.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Chat History Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/50"
              >
                <FiClock className="h-4 w-4" />
                Chat History
                <FiChevronDown className={`h-4 w-4 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isHistoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200/60 bg-white shadow-xl dark:border-trackit-border/60 dark:bg-slate-900"
                  >
                    <div className="p-4">
                      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">Recent Conversations</h3>
                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {historyLoading ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">Loading...</p>
                        ) : conversations.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">No conversations yet</p>
                        ) : (
                          conversations.map((conversation) => (
                            <button
                              key={conversation.id}
                              onClick={() => handleSelectConversation(conversation.id)}
                              className={`w-full rounded-xl border p-3 text-left transition ${
                                conversation.id === activeConversationId
                                  ? 'border-emerald-400/80 bg-emerald-50 dark:border-emerald-400/60 dark:bg-emerald-500/10'
                                  : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100 dark:border-trackit-border/60 dark:bg-slate-800/40 dark:hover:bg-slate-700/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                                  {conversation.title || 'Chat'}
                                </p>
                                {conversation.id === activeConversationId && (
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400">Active</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                {getConversationPreview(conversation)}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleStartNewChat}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-trackit-accent to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-xl"
            >
              <FiPlus className="h-4 w-4" />
              New Chat
            </button>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col overflow-hidden pb-6 pt-4"
      >
        <div
          className="flex flex-1 flex-col min-h-0 w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-lg shadow-slate-900/5 dark:border-trackit-border/60 dark:bg-slate-900/60"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          <div className="flex h-full flex-col">
            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 chat-scrollbar">
              {isConversationLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading conversation...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-trackit-accent/10 to-emerald-500/10">
                      <HiOutlineSparkles className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">Start a conversation to get personalized financial advice!</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const timestamp = new Date(message.timestamp ?? Date.now())
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-3 lg:max-w-md ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-trackit-accent to-emerald-500 text-white'
                            : 'border border-slate-200/60 bg-white text-slate-900 dark:border-trackit-border/60 dark:bg-slate-800/50 dark:text-slate-50'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p
                          className={`mt-2 text-xs ${
                            message.type === 'user'
                              ? 'text-emerald-100'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}

              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-trackit-border/60 dark:bg-slate-800/50">
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 dark:border-trackit-border/60 dark:bg-slate-900/80">
              <div className="flex gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your finances..."
                  rows="2"
                  className="flex-1 resize-none rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:placeholder-slate-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-trackit-accent to-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AIAssistant
