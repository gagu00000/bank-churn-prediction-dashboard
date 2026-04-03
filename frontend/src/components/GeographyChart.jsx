import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTheme } from '../context/ThemeContext'

const GeographyChart = ({ data }) => {
  const { isDark, chartColors } = useTheme()
  
  const chartData = Object.entries(data).map(([country, count]) => ({
    country,
    customers: count
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{payload[0].payload.country}</p>
          <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            Customers: <span className="font-bold text-blue-500">
              {payload[0].value.toLocaleString()}
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis
          dataKey="country"
          stroke={chartColors.text}
          style={{ fontSize: '14px', fontWeight: 'bold' }}
        />
        <YAxis
          stroke={chartColors.text}
          style={{ fontSize: '14px' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
        <Legend />
        <Bar
          dataKey="customers"
          fill="#3b82f6"
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default GeographyChart
