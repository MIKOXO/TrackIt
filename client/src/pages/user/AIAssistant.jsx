import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiPlus, FiMessageSquare, FiTrash2 } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi'

const AIAssistant = () => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue('')
    setIsLoading(true)

    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content:
          "I'm processing your request. This is a demo response. In the future, I'll provide personalized financial insights based on your data.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 flex flex-col gap-1"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">AI Assistant</h1>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:hover:bg-slate-800/50">
            <FiPlus className="h-4 w-4" />
            New Chat
          </button>
        </div>
        <p className="text-slate-600 dark:text-slate-400">Get personalized financial advice</p>
      </motion.div>

      <div className="flex flex-col gap-6 overflow-hidden lg:grid lg:grid-cols-[260px_1fr] lg:items-start lg:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden flex-col rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30 lg:flex"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">Chat History</h3>
          <div className="flex-1 space-y-2 overflow-y-auto">
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200/60 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:text-slate-400 dark:hover:bg-slate-800/50">
            <FiTrash2 className="h-4 w-4" />
            Clear History
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 lg:max-w-md ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-trackit-accent to-emerald-500 text-white'
                        : 'border border-slate-200/60 bg-slate-50 text-slate-900 dark:border-trackit-border/60 dark:bg-slate-800/50 dark:text-slate-50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        message.type === 'user'
                          ? 'text-emerald-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}

            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-3 dark:border-trackit-border/60 dark:bg-slate-800/50">
                  <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="border-t border-slate-200/60 p-6 dark:border-trackit-border/60">
            <div className="mb-4 flex flex-wrap gap-2">
              {['Budget tips', 'Savings goals', 'Spending analysis', 'Investment advice'].map((action) => (
                <motion.button
                  key={action}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInputValue(action)}
                  className="rounded-full border border-slate-200/60 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800/50"
                >
                  {action}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your finances..."
                rows="3"
                className="flex-1 resize-none rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
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
        </motion.div>
      </div>
    </div>
  )
}

export default AIAssistant
