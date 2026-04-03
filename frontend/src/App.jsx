import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getApiUrl } from './api'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import Navigation from './components/Navigation'
import ErrorBoundary from './components/ErrorBoundary'
import OverviewPage from './pages/OverviewPage'
import LiveMonitorPage from './pages/LiveMonitorPage'
import CustomerAnalysisPage from './pages/CustomerAnalysisPage'
import MLPredictionsPage from './pages/MLPredictionsPage'
import ModelPerformancePage from './pages/ModelPerformancePage'
import BusinessImpactPage from './pages/BusinessImpactPage'
import RetentionStrategyPage from './pages/RetentionStrategyPage'
import AdvancedAnalyticsPage from './pages/AdvancedAnalyticsPage'
import ChatBot from './components/ChatBot'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { LiveDataProvider } from './context/LiveDataContext'

function AppContent() {
  const [apiStatus, setApiStatus] = useState('connecting')
  const [activePage, setActivePage] = useState('overview')
  const { isDark } = useTheme()

  useEffect(() => {
    checkApiHealth()
  }, [])

  const checkApiHealth = async () => {
    try {
      const response = await fetch(getApiUrl('/api/'))
      if (response.ok) {
        setApiStatus('connected')
      } else {
        setApiStatus('error')
      }
    } catch (error) {
      setApiStatus('error')
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ErrorBoundary>
            <Dashboard />
            <OverviewPage />
          </ErrorBoundary>
        )
      case 'live-monitor':
        return <ErrorBoundary><LiveMonitorPage /></ErrorBoundary>
      case 'customer-analysis':
        return <ErrorBoundary><CustomerAnalysisPage /></ErrorBoundary>
      case 'ml-predictions':
        return <ErrorBoundary><MLPredictionsPage /></ErrorBoundary>
      case 'advanced-analytics':
        return <ErrorBoundary><AdvancedAnalyticsPage /></ErrorBoundary>
      case 'retention-strategy':
        return <ErrorBoundary><RetentionStrategyPage /></ErrorBoundary>
      case 'model-performance':
        return <ErrorBoundary><ModelPerformancePage /></ErrorBoundary>
      case 'business-impact':
        return <ErrorBoundary><BusinessImpactPage /></ErrorBoundary>
      default:
        return (
          <ErrorBoundary>
            <Dashboard />
            <OverviewPage />
          </ErrorBoundary>
        )
    }
  }

  return (
    <div className="min-h-screen gradient-bg transition-colors duration-300">
      {/* Header */}
      <Header apiStatus={apiStatus} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Navigation */}
          <Navigation activePage={activePage} setActivePage={setActivePage} />

          {/* Page Content */}
          {renderPage()}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`mt-16 py-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto px-6 text-center">
          <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>
            Bank Customer Churn Prediction Dashboard © 2026
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            Powered by Machine Learning & Real-time Analytics
          </p>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LiveDataProvider>
        <AppContent />
      </LiveDataProvider>
    </ThemeProvider>
  )
}

export default App
