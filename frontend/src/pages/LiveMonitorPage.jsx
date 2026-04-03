import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, AlertCircle, CheckCircle, AlertTriangle, XCircle,
  Activity, Users, TrendingUp, TrendingDown, Zap, Bell, BellOff,
  Filter, Download, RefreshCw, Eye, Clock, BarChart3, Radio,
  ChevronDown, ChevronUp, Volume2, VolumeX, Maximize2, Settings,
  AlertOctagon, Shield, UserX, UserCheck
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLiveData } from '../context/LiveDataContext'
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const LiveMonitorPage = () => {
  const { isDark } = useTheme()
  const {
    isStreaming,
    predictions,
    currentPrediction,
    streamStats,
    alerts,
    probabilityHistory,
    riskDistribution,
    toggleStream,
    clearSession,
    addAlert
  } = useLiveData()
  const [showAlerts, setShowAlerts] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [filterLevel, setFilterLevel] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [streamSpeed, setStreamSpeed] = useState('normal')
  const audioRef = useRef(null)

  // Risk level colors
  const riskColors = {
    CRITICAL: { primary: '#ef4444', secondary: '#fecaca', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
    HIGH: { primary: '#f97316', secondary: '#fed7aa', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
    MEDIUM: { primary: '#eab308', secondary: '#fef08a', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
    LOW: { primary: '#22c55e', secondary: '#bbf7d0', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' }
  }

  const handleToggleStream = () => {
    toggleStream()
  }

  const handleClearSession = () => {
    clearSession()
  }

  const handleExport = () => {
    const exportData = {
      sessionStart: streamStats.sessionStart,
      exportTime: new Date().toISOString(),
      statistics: streamStats,
      predictions: predictions.map(p => ({
        customerId: p.customer.CustomerId,
        probability: p.prediction.churn_probability,
        riskLevel: p.prediction.risk_level,
        timestamp: p.timestamp,
        customer: p.customer
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `churn-stream-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getFilteredPredictions = () => {
    if (filterLevel === 'all') return predictions
    return predictions.filter(p => p.prediction.risk_level === filterLevel.toUpperCase())
  }

  const getRiskIcon = (riskLevel) => {
    const icons = {
      CRITICAL: XCircle,
      HIGH: AlertTriangle,
      MEDIUM: AlertCircle,
      LOW: CheckCircle
    }
    return icons[riskLevel] || CheckCircle
  }

  const getSessionDuration = () => {
    if (!streamStats.sessionStart) return '00:00:00'
    const diff = new Date() - new Date(streamStats.sessionStart)
    const hours = Math.floor(diff / 3600000).toString().padStart(2, '0')
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  // Update session duration every second
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Hidden audio for alerts */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdHmBg4GDfnp4eXx+" preload="auto" />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-primary-500/20' : 'bg-primary-100'}`}>
            <Radio className="w-8 h-8 text-primary-400" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Live Churn Monitor
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Real-time customer churn prediction stream with alerts and analytics
            </p>
          </div>
        </div>

        {/* Session Timer */}
        {streamStats.sessionStart && (
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Clock className="w-5 h-5 text-primary-400" />
            <span className={`font-mono text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {getSessionDuration()}
            </span>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Main Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleStream}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                isStreaming
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/25'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-6 h-6" />
                  Stop Stream
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Start Stream
                </>
              )}
            </button>
            
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500 rounded-full"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold">LIVE</span>
              </motion.div>
            )}
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-xl transition-all ${
                soundEnabled 
                  ? 'bg-primary-500/20 text-primary-400' 
                  : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}
              title={soundEnabled ? 'Disable sound alerts' : 'Enable sound alerts'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`p-3 rounded-xl transition-all ${
                showAlerts 
                  ? 'bg-primary-500/20 text-primary-400' 
                  : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}
              title={showAlerts ? 'Hide alerts panel' : 'Show alerts panel'}
            >
              {showAlerts ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-all ${
                showFilters || filterLevel !== 'all'
                  ? 'bg-primary-500/20 text-primary-400' 
                  : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}
              title="Filter predictions"
            >
              <Filter className="w-5 h-5" />
            </button>

            <button
              onClick={handleClearSession}
              className={`p-3 rounded-xl transition-all ${isDark ? 'bg-gray-700 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}
              title="Clear session data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={handleExport}
              disabled={predictions.length === 0}
              className={`p-3 rounded-xl transition-all ${
                predictions.length > 0
                  ? isDark ? 'bg-gray-700 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  : 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-500'
              }`}
              title="Export session data"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Filter by risk:</span>
                {['all', 'critical', 'high', 'medium', 'low'].map(level => (
                  <button
                    key={level}
                    onClick={() => setFilterLevel(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterLevel === level
                        ? level === 'all' 
                          ? 'bg-primary-500 text-white'
                          : `${riskColors[level.toUpperCase()]?.bg} ${riskColors[level.toUpperCase()]?.text} ${riskColors[level.toUpperCase()]?.border} border`
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary-400" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</span>
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{streamStats.total}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Critical</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{streamStats.critical}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>High</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">{streamStats.high}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Medium</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{streamStats.medium}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Low</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{streamStats.low}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Prob</span>
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {(streamStats.avgProbability * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Probability Chart */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <BarChart3 className="w-5 h-5 text-primary-400" />
              Real-time Churn Probability
            </h3>
            <div className="h-64">
              {probabilityHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={probabilityHistory}>
                    <defs>
                      <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value}%`, 'Probability']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="probability" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      fill="url(#probGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Start streaming to see real-time data</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Prediction Highlight */}
          <AnimatePresence>
            {currentPrediction && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={`border-2 p-6 rounded-2xl ${
                  riskColors[currentPrediction.prediction.risk_level]?.border || 'border-primary-500'
                } ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${riskColors[currentPrediction.prediction.risk_level]?.bg}`}>
                      <Zap className={`w-6 h-6 ${riskColors[currentPrediction.prediction.risk_level]?.text}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Latest Prediction</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(currentPrediction.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <RiskBadge level={currentPrediction.prediction.risk_level} isDark={isDark} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <InfoCard 
                    label="Customer ID" 
                    value={currentPrediction.customer.CustomerId}
                    isDark={isDark}
                  />
                  <InfoCard 
                    label="Churn Probability" 
                    value={`${(currentPrediction.prediction.churn_probability * 100).toFixed(1)}%`}
                    valueClass="text-warning-400"
                    isDark={isDark}
                  />
                  <InfoCard 
                    label="Credit Score" 
                    value={currentPrediction.customer.CreditScore}
                    isDark={isDark}
                  />
                  <InfoCard 
                    label="Geography" 
                    value={currentPrediction.customer.Geography}
                    isDark={isDark}
                  />
                </div>

                {/* Enhanced Probability Bar */}
                <div className="relative">
                  <div className={`flex justify-between text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Churn Risk</span>
                    <span className="font-bold">{(currentPrediction.prediction.churn_probability * 100).toFixed(2)}%</span>
                  </div>
                  <div className={`w-full rounded-full h-4 overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentPrediction.prediction.churn_probability * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full relative ${
                        currentPrediction.prediction.churn_probability >= 0.75 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        currentPrediction.prediction.churn_probability >= 0.50 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        currentPrediction.prediction.churn_probability >= 0.30 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        'bg-gradient-to-r from-green-400 to-green-600'
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                  </div>
                  {/* Risk thresholds */}
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-green-400">Low</span>
                    <span className="text-xs text-yellow-400">Medium</span>
                    <span className="text-xs text-orange-400">High</span>
                    <span className="text-xs text-red-400">Critical</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => setSelectedCustomer(currentPrediction)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Predictions List */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Users className="w-5 h-5 text-primary-400" />
                Recent Predictions
                <span className={`text-sm font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  ({getFilteredPredictions().length})
                </span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              <AnimatePresence>
                {getFilteredPredictions().length > 0 ? (
                  getFilteredPredictions().map((pred, index) => {
                    const RiskIcon = getRiskIcon(pred.prediction.risk_level)
                    return (
                      <motion.div
                        key={pred.timestamp + index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedCustomer(pred)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-primary-500/50 ${
                          isDark ? 'bg-gray-900/50 border-gray-700 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${riskColors[pred.prediction.risk_level]?.bg}`}>
                              <RiskIcon className={`w-4 h-4 ${riskColors[pred.prediction.risk_level]?.text}`} />
                            </div>
                            <div className="grid grid-cols-4 gap-6">
                              <div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ID</div>
                                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {pred.customer.CustomerId}
                                </div>
                              </div>
                              <div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Age</div>
                                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {pred.customer.Age}
                                </div>
                              </div>
                              <div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Location</div>
                                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {pred.customer.Geography}
                                </div>
                              </div>
                              <div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Probability</div>
                                <div className={`text-sm font-bold ${riskColors[pred.prediction.risk_level]?.text}`}>
                                  {(pred.prediction.churn_probability * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                          <RiskBadge level={pred.prediction.risk_level} isDark={isDark} small />
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <Activity className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                      {!isStreaming ? 'Start streaming to see predictions' : 'Waiting for predictions...'}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column - Alerts & Distribution */}
        <div className="space-y-6">
          {/* Risk Distribution */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Shield className="w-5 h-5 text-primary-400" />
              Risk Distribution
            </h3>
            <div className="h-48">
              {riskDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={riskColors[entry.name]?.primary || '#8b5cf6'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No data yet</p>
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
                const count = riskDistribution.find(r => r.name === level)?.value || 0
                return (
                  <div key={level} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: riskColors[level]?.primary }}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {level} ({count})
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Alerts Panel */}
          {showAlerts && (
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <AlertOctagon className="w-5 h-5 text-red-400" />
                Alerts
                {alerts.length > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
                    {alerts.length}
                  </span>
                )}
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <AnimatePresence>
                  {alerts.length > 0 ? (
                    alerts.map(alert => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-3 rounded-lg text-sm ${
                          alert.type === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                          alert.type === 'warning' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                          alert.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {alert.type === 'critical' && <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                          {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                          <div className="flex-1">
                            <p>{alert.message}</p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {alert.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No alerts yet</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <TrendingUp className="w-5 h-5 text-primary-400" />
              Session Stats
            </h3>
            <div className="space-y-4">
              <StatRow 
                label="Peak Probability" 
                value={`${(streamStats.peakProbability * 100).toFixed(1)}%`}
                isDark={isDark}
              />
              <StatRow 
                label="High Risk Rate" 
                value={streamStats.total > 0 
                  ? `${(((streamStats.critical + streamStats.high) / streamStats.total) * 100).toFixed(1)}%`
                  : '0%'
                }
                isDark={isDark}
              />
              <StatRow 
                label="Predictions/min" 
                value={streamStats.sessionStart && streamStats.total > 0
                  ? ((streamStats.total / ((Date.now() - new Date(streamStats.sessionStart)) / 60000)) || 0).toFixed(1)
                  : '0'
                }
                isDark={isDark}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailModal 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomer(null)}
            isDark={isDark}
            riskColors={riskColors}
          />
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isStreaming && predictions.length === 0 && (
        <div className={`text-center py-16 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <Radio className={`w-20 h-20 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ready to Monitor</h3>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Click "Start Stream" to begin real-time churn predictions
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Real-time WebSocket</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Live Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Risk Alerts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
const RiskBadge = ({ level, isDark, small = false }) => {
  const config = {
    CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500', icon: XCircle },
    HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500', icon: AlertTriangle },
    MEDIUM: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500', icon: AlertCircle },
    LOW: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500', icon: CheckCircle }
  }
  
  const badge = config[level] || config.LOW
  const Icon = badge.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border} ${
      small ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm font-bold'
    }`}>
      <Icon className={small ? 'w-3 h-3' : 'w-4 h-4'} />
      {level}
    </span>
  )
}

const InfoCard = ({ label, value, valueClass = '', isDark }) => (
  <div>
    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
    <div className={`text-lg font-bold ${valueClass || (isDark ? 'text-white' : 'text-gray-900')}`}>{value}</div>
  </div>
)

const StatRow = ({ label, value, isDark }) => (
  <div className="flex items-center justify-between">
    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{label}</span>
    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
  </div>
)

const CustomerDetailModal = ({ customer, onClose, isDark, riskColors }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`w-full max-w-2xl p-6 rounded-2xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Customer Details
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            ID: {customer.customer.CustomerId}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <DetailItem label="Credit Score" value={customer.customer.CreditScore} isDark={isDark} />
        <DetailItem label="Geography" value={customer.customer.Geography} isDark={isDark} />
        <DetailItem label="Gender" value={customer.customer.Gender} isDark={isDark} />
        <DetailItem label="Age" value={customer.customer.Age} isDark={isDark} />
        <DetailItem label="Tenure" value={`${customer.customer.Tenure} years`} isDark={isDark} />
        <DetailItem label="Balance" value={`$${customer.customer.Balance?.toLocaleString() || 0}`} isDark={isDark} />
        <DetailItem label="Products" value={customer.customer.NumOfProducts} isDark={isDark} />
        <DetailItem label="Has Credit Card" value={customer.customer.HasCrCard ? 'Yes' : 'No'} isDark={isDark} />
        <DetailItem label="Active Member" value={customer.customer.IsActiveMember ? 'Yes' : 'No'} isDark={isDark} />
        <DetailItem label="Est. Salary" value={`$${customer.customer.EstimatedSalary?.toLocaleString() || 0}`} isDark={isDark} />
      </div>

      <div className={`p-4 rounded-xl ${riskColors[customer.prediction.risk_level]?.bg} border ${riskColors[customer.prediction.risk_level]?.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Churn Prediction</div>
            <div className={`text-3xl font-bold ${riskColors[customer.prediction.risk_level]?.text}`}>
              {(customer.prediction.churn_probability * 100).toFixed(2)}%
            </div>
          </div>
          <RiskBadge level={customer.prediction.risk_level} isDark={isDark} />
        </div>
      </div>
    </motion.div>
  </motion.div>
)

const DetailItem = ({ label, value, isDark }) => (
  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
  </div>
)

export default LiveMonitorPage
