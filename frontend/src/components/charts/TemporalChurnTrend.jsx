import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import InsightDropdown from '../InsightDropdown'
import { useTheme } from '../../context/ThemeContext'
import { useLiveData } from '../../context/LiveDataContext'

const geoColors = { France: '#10b981', Germany: '#ef4444', Spain: '#f59e0b' }

const TemporalChurnTrend = () => {
  const { isDark, chartColors } = useTheme()
  const { temporalByGeo } = useLiveData()

  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#1f2937'
  }

  // Build time-series from temporalByGeo: { geo: { minuteKey: { total, churned } } }
  const allMinutes = new Set()
  Object.values(temporalByGeo).forEach(geoData => {
    Object.keys(geoData).forEach(m => allMinutes.add(m))
  })

  const sortedMinutes = Array.from(allMinutes).sort()

  if (sortedMinutes.length === 0) {
    return <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} py-8`}>Waiting for stream data...</div>
  }

  const chartData = sortedMinutes.map(minute => {
    const point = { time: minute }
    Object.keys(geoColors).forEach(geo => {
      const d = temporalByGeo[geo]?.[minute]
      point[geo] = d ? Math.round((d.churned / d.total) * 100) : null
    })
    return point
  })

  return (
    <div className="card glow-effect">
      <div className="card-header"><h3 className="card-title">Temporal Churn Trend by Geography</h3></div>
      <div className="card-content">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="time" stroke={chartColors.text} tick={{ fontSize: 11 }} />
            <YAxis stroke={chartColors.text} label={{ value: 'Churn Rate %', angle: -90, position: 'insideLeft', fill: chartColors.text }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(val) => val !== null ? `${val}%` : 'N/A'} />
            <Legend />
            {Object.entries(geoColors).map(([geo, color]) => (
              <Line key={geo} type="monotone" dataKey={geo} stroke={color} strokeWidth={2}
                dot={{ r: 3, fill: color }} connectNulls name={geo} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <InsightDropdown title="Understanding Temporal Trends"
          interpretation="Multi-line chart tracking churn rate (%) per minute for each geography as predictions stream in."
          insights={["Each line represents a geography's churn rate over time","Convergence or divergence of lines reveals geographic risk trends","Data accumulates as the live stream runs"]} />
      </div>
    </div>
  )
}

export default TemporalChurnTrend
