import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { getApiUrl } from '../api'

const SUGGESTED_QUESTIONS = [
  'What is the current churn rate?',
  'What are the top churn factors?',
  'Tell me about the overview page',
  'What is credit score?',
  'How do the models work?',
  'What retention strategies are recommended?',
  'How do I make a prediction?',
]

function MarkdownLite({ text }) {
  // Minimal markdown: bold (**), bullet (•), and newlines
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bold
        const parts = line.split(/(\*\*[^*]+\*\*)/g)
        const rendered = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
          }
          return <span key={j}>{part}</span>
        })
        if (line.trim() === '') return <br key={i} />
        return <p key={i} className="leading-relaxed">{rendered}</p>
      })}
    </div>
  )
}

export default function ChatBot() {
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId] = useState(() => 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8))
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hello! I'm your AI Dashboard Assistant powered by Gemini. Ask me anything about customer churn data, models, predictions, or retention strategies.",
      time: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || loading) return

    const userMsg = { role: 'user', text: trimmed, time: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setShowSuggestions(false)

    try {
      const res = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, session_id: sessionId }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.response, time: new Date(), source: data.source || 'local' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'Sorry, I couldn\'t reach the server. Please try again.',
          time: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Colors
  const bg = isDark ? 'bg-gray-900' : 'bg-white'
  const headerBg = isDark
    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
    : 'bg-gradient-to-r from-blue-500 to-purple-500'
  const inputBg = isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const userBubble = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
  const botBubble = isDark
    ? 'bg-gray-800 text-gray-200'
    : 'bg-gray-100 text-gray-800'
  const subtleText = isDark ? 'text-gray-500' : 'text-gray-400'

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center
          ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}
          text-white transition-colors duration-200`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          // X icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Chat icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`fixed bottom-24 right-6 z-50 w-[380px] max-h-[560px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${borderColor} ${bg}`}
          >
            {/* Header */}
            <div className={`${headerBg} px-5 py-4 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M5 14.5l-1.455.654A1 1 0 003 16.092V19.5a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-3.408a1 1 0 00-.545-.938L19.8 14.5m-14.8 0h14.8" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AI Dashboard Assistant</h3>
                <p className="text-white/70 text-xs">Ask anything about your data</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/70 text-xs">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 360 }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' ? userBubble : botBubble
                  }`}>
                    {msg.role === 'bot' ? <MarkdownLite text={msg.text} /> : msg.text}
                    <p className={`text-[10px] mt-1 flex items-center gap-1.5 ${
                      msg.role === 'user' ? 'text-blue-100' : subtleText
                    }`}>
                      {formatTime(msg.time)}
                      {msg.source && (
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                          msg.source === 'gemini'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {msg.source === 'gemini' ? '✦ Gemini AI' : '⚡ Local Engine'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-4 py-3 ${botBubble}`}>
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {showSuggestions && messages.length <= 1 && (
              <div className={`px-4 pb-2 flex flex-wrap gap-1.5 border-t ${borderColor} pt-2`}>
                {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      isDark
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className={`px-4 py-3 border-t ${borderColor} flex items-center gap-2`}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className={`flex-1 rounded-full px-4 py-2.5 text-sm outline-none ${inputBg} placeholder-gray-400`}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  input.trim() && !loading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : isDark
                      ? 'bg-gray-700 text-gray-500'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
