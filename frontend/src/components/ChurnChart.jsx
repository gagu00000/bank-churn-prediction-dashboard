import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useTheme } from '../context/ThemeContext'

const ChurnChart = ({ data }) => {
  const { isDark, chartColors } = useTheme()
  
  const chartData = [
    {
      name: 'Active Customers',
      value: data.total_customers - data.churned_customers,
      color: '#00e600'
    },
    {
      name: 'Churned Customers',
      value: data.churned_customers,
      color: '#ff4444'
    }
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{payload[0].name}</p>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Count: <span className="font-bold">{payload[0].value.toLocaleString()}</span>
          </p>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Percentage: <span className="font-bold">
              {((payload[0].value / data.total_customers) * 100).toFixed(2)}%
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: chartColors.text }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default ChurnChart
