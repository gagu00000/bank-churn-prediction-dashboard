import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { getWsUrl } from '../api'

const LiveStream = () => {
  const { isDark } = useTheme()
  const [isStreaming, setIsStreaming] = useState(false)
  const [predictions, setPredictions] = useState([])
  const [currentPrediction, setCurrentPrediction] = useState(null)
  const wsRef = useRef(null)
  const maxPredictions = 10

  const connectWebSocket = () => {
    // Use relative path which will be proxied through Vite
    const wsUrl = getWsUrl()
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      console.log('WebSocket connected')
      wsRef.current.send(JSON.stringify({ action: 'start_stream' }))
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCurrentPrediction(data)
      
      setPredictions(prev => {
        const newPredictions = [data, ...prev]
        return newPredictions.slice(0, maxPredictions)
      })
    }

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected')
      setIsStreaming(false)
    }
  }

  const handleToggleStream = () => {
    if (isStreaming) {
      if (wsRef.current) {
        wsRef.current.close()
      }
      setIsStreaming(false)
    } else {
      connectWebSocket()
      setIsStreaming(true)
    }
  }

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const getRiskBadge = (riskLevel) => {
    const badges = {
      CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500', icon: XCircle },
      HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500', icon: AlertTriangle },
      MEDIUM: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500', icon: AlertCircle },
      LOW: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500', icon: CheckCircle }
    }
    
    const badge = badges[riskLevel] || badges.LOW
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide border ${badge.bg} ${badge.text} ${badge.border}`}>
        <Icon className="w-4 h-4" />
        {riskLevel}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className={`flex items-center justify-between p-6 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleStream}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              isStreaming
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
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

        <div className="text-right">
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Predictions</div>
          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{predictions.length}</div>
        </div>
      </div>

      {/* Current Prediction Highlight */}
      <AnimatePresence>
        {currentPrediction && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`border-2 border-primary-500 p-8 rounded-2xl ${isDark ? 'bg-gradient-to-br from-primary-900/50 to-primary-800/50' : 'bg-gradient-to-br from-primary-50 to-primary-100'}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Latest Prediction</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{new Date(currentPrediction.timestamp).toLocaleString()}</p>
              </div>
              {getRiskBadge(currentPrediction.prediction.risk_level)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Customer ID</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentPrediction.customer.CustomerId}</div>
              </div>
              <div className="space-y-1">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Churn Probability</div>
                <div className="text-xl font-bold text-warning-400">
                  {(currentPrediction.prediction.churn_probability * 100).toFixed(1)}%
                </div>
              </div>
              <div className="space-y-1">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Credit Score</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentPrediction.customer.CreditScore}</div>
              </div>
              <div className="space-y-1">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Geography</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentPrediction.customer.Geography}</div>
              </div>
            </div>

            {/* Probability Bar */}
            <div className="mt-6">
              <div className={`flex justify-between text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>Churn Probability</span>
                <span>{(currentPrediction.prediction.churn_probability * 100).toFixed(2)}%</span>
              </div>
              <div className={`w-full rounded-full h-4 overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentPrediction.prediction.churn_probability * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    currentPrediction.prediction.churn_probability >= 0.75 ? 'bg-red-500' :
                    currentPrediction.prediction.churn_probability >= 0.50 ? 'bg-orange-500' :
                    currentPrediction.prediction.churn_probability >= 0.30 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                ></motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predictions History */}
      {predictions.length > 0 && (
        <div className="space-y-3">
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Predictions</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {predictions.map((pred, index) => (
              <motion.div
                key={pred.timestamp + index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 rounded-xl border transition-all hover:border-primary-500/50 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`font-mono text-sm w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>#{index + 1}</div>
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ID</div>
                        <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pred.customer.CustomerId}</div>
                      </div>
                      <div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Age</div>
                        <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pred.customer.Age}</div>
                      </div>
                      <div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Geography</div>
                        <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pred.customer.Geography}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Probability</div>
                        <div className="text-sm font-bold text-warning-400">
                          {(pred.prediction.churn_probability * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getRiskBadge(pred.prediction.risk_level)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isStreaming && predictions.length === 0 && (
        <div className="text-center py-16">
          <Play className={`w-20 h-20 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Click "Start Stream" to begin live predictions</p>
        </div>
      )}
    </div>
  )
}

export default LiveStream
