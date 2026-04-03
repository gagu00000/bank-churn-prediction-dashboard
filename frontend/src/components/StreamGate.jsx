import React from 'react'
import { motion } from 'framer-motion'
import { Radio, Play, Activity } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLiveData } from '../context/LiveDataContext'

const StreamGate = ({ children, pageName = 'this page' }) => {
  const { isDark } = useTheme()
  const { hasData, isStreaming, toggleStream } = useLiveData()

  if (hasData) return children

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-24 px-8 rounded-2xl border-2 border-dashed ${
        isDark
          ? 'bg-surface-900/50 border-surface-700'
          : 'bg-gray-50 border-gray-300'
      }`}
    >
      {/* Animated pulse ring */}
      <div className="relative mb-8">
        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
          isStreaming ? 'bg-green-500' : 'bg-blue-500'
        }`} style={{ animationDuration: '2s' }} />
        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
          isStreaming
            ? isDark ? 'bg-green-500/20 border-2 border-green-500/50' : 'bg-green-100 border-2 border-green-300'
            : isDark ? 'bg-blue-500/20 border-2 border-blue-500/50' : 'bg-blue-100 border-2 border-blue-300'
        }`}>
          {isStreaming ? (
            <Activity className="w-10 h-10 text-green-400 animate-pulse" />
          ) : (
            <Radio className="w-10 h-10 text-blue-400" />
          )}
        </div>
      </div>

      <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {isStreaming ? 'Waiting for Data...' : 'Real-Time Stream Required'}
      </h3>
      
      <p className={`text-center max-w-md mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {isStreaming
          ? `The live stream is active. Charts on ${pageName} will populate as customer predictions arrive in real-time.`
          : `All charts on ${pageName} are powered by live streaming data. Start the real-time stream from the Live Monitor to populate charts across all pages.`
        }
      </p>

      {!isStreaming && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleStream}
          className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
        >
          <Play className="w-5 h-5" />
          Start Live Stream
        </motion.button>
      )}

      {isStreaming && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Stream active — data incoming...
        </div>
      )}
    </motion.div>
  )
}

export default StreamGate
