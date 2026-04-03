import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, default to dark
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    // Update document class and localStorage
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  // Chart colors for both themes
  const chartColors = {
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    background: isDark ? '#1f2937' : '#ffffff',
    border: isDark ? '#374151' : '#d1d5db',
    tooltip: {
      bg: isDark ? '#1f2937' : '#ffffff',
      border: isDark ? '#374151' : '#e5e7eb',
      text: isDark ? '#e5e7eb' : '#374151'
    }
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, chartColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext
