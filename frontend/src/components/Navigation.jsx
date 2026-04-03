import React from 'react'
import { LayoutDashboard, Users, Brain, LineChart, DollarSign, Target, FlaskConical, Radio } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const Navigation = ({ activePage, setActivePage }) => {
  const { isDark } = useTheme()
  
  const pages = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, color: 'primary' },
    { id: 'live-monitor', name: 'Live Monitor', icon: Radio, color: 'info' },
    { id: 'customer-analysis', name: 'Customers', icon: Users, color: 'primary' },
    { id: 'ml-predictions', name: 'Predictions', icon: Brain, color: 'info' },
    { id: 'advanced-analytics', name: 'Analytics', icon: FlaskConical, color: 'primary' },
    { id: 'retention-strategy', name: 'Retention', icon: Target, color: 'retention' },
    { id: 'model-performance', name: 'Performance', icon: LineChart, color: 'primary' },
    { id: 'business-impact', name: 'Business', icon: DollarSign, color: 'retention' }
  ]

  return (
    <nav className={`rounded-2xl mb-8 transition-all duration-300 ${
      isDark 
        ? 'bg-surface-900/50 border border-surface-800' 
        : 'bg-white/80 border border-gray-200 shadow-sm'
    }`}>
      <div className="px-2 py-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {pages.map((page) => {
            const Icon = page.icon
            const isActive = activePage === page.id
            return (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap group
                  ${isActive 
                    ? isDark
                      ? 'text-white bg-gradient-to-r from-primary-600/80 to-primary-500/80 shadow-lg shadow-primary-500/20'
                      : 'text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-md'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-surface-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                <span className="text-sm">{page.name}</span>
                {isActive && (
                  <span className="absolute inset-0 rounded-xl ring-1 ring-primary-400/50"></span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
