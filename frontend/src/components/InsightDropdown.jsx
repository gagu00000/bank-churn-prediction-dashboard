import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const InsightDropdown = ({ title = "How to interpret this chart", insights, interpretation }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { isDark } = useTheme()

  return (
    <div className={`mt-3 border-t pt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full text-left text-sm transition-colors ${
          isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="text-blue-400">💡</span>
          <span>{title}</span>
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className={`mt-3 p-4 rounded-lg border text-sm animate-fadeIn ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          {interpretation && (
            <div className="mb-3">
              <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{interpretation}</p>
            </div>
          )}
          
          {insights && insights.length > 0 && (
            <div className="space-y-2">
              <p className={`font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Key Takeaways:</p>
              <ul className="space-y-2">
                {insights.map((insight, idx) => (
                  <li key={idx} className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InsightDropdown
