import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Sun, Moon, Sparkles } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const Header = ({ apiStatus }) => {
  const { isDark, toggleTheme } = useTheme()
  
  const statusColors = {
    connected: 'bg-emerald-500',
    connecting: 'bg-amber-500',
    error: 'bg-rose-500'
  }

  const statusTexts = {
    connected: 'Connected',
    connecting: 'Connecting...',
    error: 'Disconnected'
  }

  return (
    <header className={`border-b sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
      isDark 
        ? 'border-primary-500/10 bg-surface-950/80' 
        : 'border-gray-200 bg-white/80'
    }`}>
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {/* Animated Logo */}
            <div className="relative group">
              <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-primary-500/40 to-info-500/40 group-hover:from-primary-500/60 group-hover:to-info-500/60' 
                  : 'bg-gradient-to-br from-primary-400/30 to-info-400/30'
              }`}></div>
              <div className={`relative p-3.5 rounded-2xl ${
                isDark 
                  ? 'bg-gradient-to-br from-primary-600 via-primary-500 to-info-500' 
                  : 'bg-gradient-to-br from-primary-500 to-primary-600'
              }`}>
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className="text-gradient">Churn</span>
                  <span className={isDark ? 'text-gray-100' : 'text-gray-800'}> Analytics</span>
                </h1>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  isDark 
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                    : 'bg-primary-100 text-primary-600'
                }`}>
                  Pro
                </span>
              </div>
              <p className={`text-sm flex items-center gap-1.5 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                Real-time ML-Powered Predictions
              </p>
            </div>
          </motion.div>

          {/* Right Side Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isDark 
                  ? 'bg-surface-800 hover:bg-surface-700 text-amber-400 border border-surface-700 hover:border-amber-500/30' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* API Status */}
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all duration-300 ${
              isDark 
                ? 'bg-surface-800/80 border border-surface-700' 
                : 'bg-gray-100 border border-gray-200'
            }`}>
              <div className="relative">
                <div className={`w-2.5 h-2.5 rounded-full ${statusColors[apiStatus]}`}></div>
                {apiStatus === 'connected' && (
                  <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${statusColors[apiStatus]} animate-ping`}></div>
                )}
              </div>
              <span className={`text-sm font-medium ${
                apiStatus === 'connected' 
                  ? 'text-emerald-400' 
                  : apiStatus === 'connecting'
                    ? 'text-amber-400'
                    : 'text-rose-400'
              }`}>
                {statusTexts[apiStatus]}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  )
}

export default Header
