import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import InsightDropdown from '../InsightDropdown'
import { useTheme } from '../../context/ThemeContext'
import { useLiveData } from '../../context/LiveDataContext'

const geoColors = { France: '#3b82f6', Germany: '#ef4444', Spain: '#f59e0b' }

const CustomerJourneySankey = () => {
  const { isDark, chartColors } = useTheme()
  const { geoProductCross } = useLiveData()

  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#1f2937'
  }

  // Build flow data from cross-tabulation
  // geoProductCross shape: { "France → 2 Products": { value: 5, geo: "France" }, ... }
  const flows = []
  Object.entries(geoProductCross).forEach(([key, data]) => {
    if (data.value > 0) flows.push({ name: key, value: data.value, geo: data.geo })
  })

  if (flows.length === 0) {
    return <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} py-8`}>Waiting for stream data...</div>
  }

  flows.sort((a, b) => b.value - a.value)
  const chartData = flows

  return (
    <div className="card glow-effect">
      <div className="card-header"><h3 className="card-title">Customer Journey: Geography → Products</h3></div>
      <div className="card-content">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis type="number" stroke={chartColors.text} />
            <YAxis type="category" dataKey="name" stroke={chartColors.text} width={160} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="value" name="Customers">
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={geoColors[entry.geo] || '#8b5cf6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <InsightDropdown title="Understanding Customer Journey"
          interpretation="Horizontal bars show how customers flow from geographies to product tiers. Bar color = geography."
          insights={["Longer bars mean more customers in that geography-product combination","Useful for spotting product preferences by region in real-time"]} />
      </div>
    </div>
  )
}

export default CustomerJourneySankey
