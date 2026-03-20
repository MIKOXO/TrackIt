import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiPlus, FiChevronDown, FiClock, FiTrash2 } from 'react-icons/fi'
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
  deleteAssistantConversation,
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
  const [pendingDeleteConversation, setPendingDeleteConversation] = useState(null)
  const messagesEndRef = useRef(null)
  const historyDropdownRef = useRef(null)
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

  const handleDeleteConversation = (event, conversation) => {
    event.preventDefault()
    event.stopPropagation()
    if (!token) {
      showToast('Please sign in to use the AI assistant.', { type: 'error' })
      return
    }
    if (!conversation) return
    setPendingDeleteConversation(conversation)
  }

  const closeDeleteModal = () => {
    setPendingDeleteConversation(null)
  }

  const confirmDeleteConversation = async () => {
    if (!pendingDeleteConversation) return
    try {
      await dispatch(
        deleteAssistantConversation({
          token,
          conversationId: pendingDeleteConversation.id,
        })
      ).unwrap()
      showToast('Conversation deleted.', { type: 'success' })
    } catch {
      // Error already surfaced.
    } finally {
      closeDeleteModal()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    if (!isHistoryOpen) return undefined

    const handleDocumentPointerDown = (event) => {
      if (historyDropdownRef.current?.contains(event.target)) return
      setIsHistoryOpen(false)
    }

    document.addEventListener('mousedown', handleDocumentPointerDown)
    document.addEventListener('touchstart', handleDocumentPointerDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown)
      document.removeEventListener('touchstart', handleDocumentPointerDown)
    }
  }, [isHistoryOpen])

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 pb-6 pt-3 sm:gap-6 sm:pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-visible rounded-3xl border border-slate-200/70 bg-white p-4 shadow-lg shadow-slate-900/5 dark:border-trackit-border/70 dark:bg-slate-900/90 sm:p-6"
        >
          <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-slate-200/50 blur-3xl dark:bg-slate-700/20" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600/90 dark:text-emerald-300/90">AI Assistant</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 dark:text-slate-50">Get personalized AI guidance</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ask questions about your finances and keep the conversation going.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:w-auto">
              <div ref={historyDropdownRef} className="relative">
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-trackit-border/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800/80 sm:w-auto sm:justify-start"
                >
                  <FiClock className="h-4 w-4" />
                  Chat History
                  <FiChevronDown className={`h-4 w-4 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isHistoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-0 right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-sm dark:border-trackit-border/70 dark:bg-slate-900/95 sm:left-auto sm:right-0 sm:w-[22rem]"
                    >
                      <div className="p-4">
                        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">Recent Conversations</h3>
                        <div className="chat-scrollbar max-h-72 space-y-2 overflow-y-auto pr-1">
                          {historyLoading ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400">Loading...</p>
                          ) : conversations.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400">No conversations yet</p>
                          ) : (
                            conversations.map((conversation) => (
                              <div key={conversation.id} className="relative">
                                <button
                                  onClick={() => handleSelectConversation(conversation.id)}
                                  className={`w-full rounded-xl border p-3 pr-10 text-left transition ${
                                    conversation.id === activeConversationId
                                      ? 'border-emerald-400/80 bg-emerald-50 dark:border-emerald-400/60 dark:bg-emerald-500/10'
                                      : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100 dark:border-trackit-border/60 dark:bg-slate-800/40 dark:hover:bg-slate-700/50'
                                  }`}
                                >
                                  <p className="mb-1 text-xs font-medium text-slate-900 dark:text-slate-100">{conversation.title || 'Chat'}</p>
                                  <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{getConversationPreview(conversation)}</p>
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => handleDeleteConversation(event, conversation)}
                                  className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent bg-white text-slate-500 transition hover:border-red-100 hover:bg-white/90 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-transparent dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-red-500"
                                  aria-label={`Delete ${conversation.title || 'chat'} conversation`}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-trackit-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 hover:shadow-xl sm:w-auto"
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
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            className="flex w-full flex-1 min-h-0 flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-xl shadow-slate-900/5 dark:border-trackit-border/70 dark:bg-slate-900"
            style={{ height: 'clamp(360px, calc(100dvh - 260px), 820px)' }}
          >
          <div className="flex h-full min-h-0 flex-col">
            {/* Messages */}
            <div className="chat-scrollbar flex-1 min-h-0 space-y-4 overflow-y-auto p-3 sm:p-5 lg:p-6 xl:px-8 dark:bg-slate-950/25">
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
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
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
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:max-w-[76%] md:text-[0.95rem] xl:max-w-[65%] 2xl:max-w-[56rem] ${
                          message.type === 'user'
                            ? 'bg-trackit-accent text-white dark:bg-emerald-600'
                            : 'border border-slate-200/60 bg-white text-slate-900 dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p
                          className={`mt-2 text-xs ${
                            message.type === 'user'
                              ? 'text-emerald-100'
                              : 'text-slate-500 dark:text-slate-300'
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
                  <div className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 dark:border-slate-700/80 dark:bg-slate-800/90">
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

            <div className="mt-auto flex-shrink-0 border-t border-slate-200/60 bg-white/85 p-2.5 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-950/80 sm:p-3 lg:p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about your finances..."
                  rows={2}
                  className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:placeholder-slate-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-12 w-full flex-shrink-0 items-center justify-center gap-2 rounded-2xl bg-trackit-accent px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:w-12 sm:px-0"
                >
                  <FiSend className="h-5 w-5" />
                  <span className="sm:hidden">Send</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
      {pendingDeleteConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-conversation-title"
            className="mx-4 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-trackit-border/70 dark:bg-slate-900/90"
          >
            <h3 id="delete-conversation-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Delete conversation
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Delete&nbsp;
              <span className="font-medium text-slate-900 dark:text-slate-50">
                {pendingDeleteConversation.title || 'this chat'}
              </span>
              ? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-2xl border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-transparent dark:bg-slate-800/60 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteConversation}
                className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
