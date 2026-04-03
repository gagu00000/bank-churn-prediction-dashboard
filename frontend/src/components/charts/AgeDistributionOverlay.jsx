import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import InsightDropdown from '../InsightDropdown'
import { useTheme } from '../../context/ThemeContext'
import { useLiveData } from '../../context/LiveDataContext'

const AgeDistributionOverlay = () => {
  const { isDark, chartColors } = useTheme()
  const { churnedAges, retainedAges } = useLiveData()

  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#1f2937'
  }

  if (churnedAges.length === 0 && retainedAges.length === 0) {
    return <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} py-8`}>Waiting for stream data...</div>
  }

  const ageBins = ['18-25', '26-30', '31-35', '36-40', '41-45', '46-50', '51-55', '56-60', '61-70', '70+']
  const getBinIndex = (age) => {
    if (age < 26) return 0; if (age < 31) return 1; if (age < 36) return 2; if (age < 41) return 3
    if (age < 46) return 4; if (age < 51) return 5; if (age < 56) return 6; if (age < 61) return 7
    if (age < 71) return 8; return 9
  }

  const churnedCounts = new Array(10).fill(0)
  const retainedCounts = new Array(10).fill(0)
  churnedAges.forEach(age => { churnedCounts[getBinIndex(age)]++ })
  retainedAges.forEach(age => { retainedCounts[getBinIndex(age)]++ })

  const chartData = ageBins.map((bin, idx) => ({ ageGroup: bin, churned: churnedCounts[idx], retained: retainedCounts[idx] }))

  return (
    <div className="card glow-effect">
      <div className="card-header"><h3 className="card-title">Age Distribution: Churned vs Retained</h3></div>
      <div className="card-content">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="ageGroup" stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: chartColors.text }} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: isDark ? '#fff' : '#1f2937' }} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="churned" fill="#ef4444" name="Churned" />
            <Bar dataKey="retained" fill="#10b981" name="Retained" />
          </BarChart>
        </ResponsiveContainer>
        <InsightDropdown title="Understanding Age Distribution"
          interpretation="Grouped bar chart comparing churned (red) vs retained (green) across age brackets from live stream."
          insights={["Age groups with disproportionately tall red bars indicate higher churn risk","Data updates in real-time as predictions stream in"]} />
      </div>
    </div>
  )
}

export default AgeDistributionOverlay
