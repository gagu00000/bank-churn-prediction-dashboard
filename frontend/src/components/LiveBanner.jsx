import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Activity, Users, AlertTriangle, TrendingUp, Zap } from 'lucide-react'
import { useLiveData } from '../context/LiveDataContext'
import { useTheme } from '../context/ThemeContext'

const LiveBanner = ({ compact = false }) => {
  const { isDark } = useTheme()
  const { isStreaming, streamStats, currentPrediction, liveChurnCount, liveRetainedCount } = useLiveData()

  if (!isStreaming && streamStats.total === 0) return null

  const riskColors = {
    CRITICAL: 'text-red-400',
    HIGH: 'text-orange-400',
    MEDIUM: 'text-yellow-400',
    LOW: 'text-green-400'
  }

  if (compact) {
    return (
      <AnimatePresence>
        {(isStreaming || streamStats.total > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-xl mb-4 px-4 py-2 flex items-center gap-4 text-sm ${
              isDark 
                ? 'bg-surface-900/80 border border-primary-500/30' 
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            {isStreaming && (
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>LIVE</span>
              </span>
            )}
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <Activity className="w-3.5 h-3.5 inline mr-1" />
              {streamStats.total} processed
            </span>
            {streamStats.critical > 0 && (
              <span className="text-red-400">
                <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                {streamStats.critical} critical
              </span>
            )}
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Avg: {(streamStats.avgProbability * 100).toFixed(1)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {(isStreaming || streamStats.total > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`rounded-2xl mb-6 overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-r from-surface-900/90 via-surface-900/70 to-surface-900/90 border border-primary-500/20' 
              : 'bg-gradient-to-r from-blue-50 via-white to-blue-50 border border-blue-200 shadow-sm'
          }`}
        >
          {/* Streaming indicator bar */}
          {isStreaming && (
            <div className="h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}
          
          <div className="px-5 py-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>LIVE STREAM ACTIVE</span>
                  </span>
                ) : (
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Radio className="w-4 h-4 inline mr-1" /> Stream Session Data
                  </span>
                )}
              </div>
              {currentPrediction && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-surface-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  Latest: Customer {currentPrediction.customer?.CustomerId}
                  <span className={`ml-1 font-medium ${riskColors[currentPrediction.prediction?.risk_level] || 'text-gray-400'}`}>
                    {currentPrediction.prediction?.risk_level}
                  </span>
                </span>
              )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <KPICard
                icon={Users}
                label="Processed"
                value={streamStats.total}
                color="blue"
                isDark={isDark}
              />
              <KPICard
                icon={AlertTriangle}
                label="Critical"
                value={streamStats.critical}
                color="red"
                isDark={isDark}
                pulse={streamStats.critical > 0}
              />
              <KPICard
                icon={Zap}
                label="High Risk"
                value={streamStats.high}
                color="orange"
                isDark={isDark}
              />
              <KPICard
                icon={TrendingUp}
                label="Avg Churn %"
                value={`${(streamStats.avgProbability * 100).toFixed(1)}%`}
                color="yellow"
                isDark={isDark}
              />
              <KPICard
                icon={Users}
                label="Predicted Churn"
                value={liveChurnCount}
                color="red"
                isDark={isDark}
              />
              <KPICard
                icon={Users}
                label="Retained"
                value={liveRetainedCount}
                color="green"
                isDark={isDark}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const KPICard = ({ icon: Icon, label, value, color, isDark, pulse }) => {
  const colorMap = {
    blue: { text: 'text-blue-400', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50', border: isDark ? 'border-blue-500/20' : 'border-blue-200' },
    red: { text: 'text-red-400', bg: isDark ? 'bg-red-500/10' : 'bg-red-50', border: isDark ? 'border-red-500/20' : 'border-red-200' },
    orange: { text: 'text-orange-400', bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50', border: isDark ? 'border-orange-500/20' : 'border-orange-200' },
    yellow: { text: 'text-yellow-400', bg: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50', border: isDark ? 'border-yellow-500/20' : 'border-yellow-200' },
    green: { text: 'text-green-400', bg: isDark ? 'bg-green-500/10' : 'bg-green-50', border: isDark ? 'border-green-500/20' : 'border-green-200' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={`rounded-lg px-3 py-2 border ${c.bg} ${c.border} transition-all`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className={`w-3.5 h-3.5 ${c.text}`} />
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{label}</span>
      </div>
      <p className={`text-lg font-bold ${c.text} ${pulse ? 'animate-pulse' : ''}`}>
        {value}
      </p>
    </div>
  )
}

export default LiveBanner
