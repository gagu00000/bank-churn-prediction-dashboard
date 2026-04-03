import React from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts'
import { TrendingUp, TrendingDown, Users } from 'lucide-react'
import InsightDropdown from '../InsightDropdown'
import { useTheme } from '../../context/ThemeContext'
import { useLiveData } from '../../context/LiveDataContext'

const CustomerLTVSunburst = () => {
  const { isDark, chartColors } = useTheme()
  const { geographyLive, liveStats } = useLiveData()

  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#1f2937',
    padding: '12px'
  }

  const geoAnalysis = Object.entries(geographyLive).map(([geo, v]) => {
    const churnRate = v.total > 0 ? (v.churned / v.total) * 100 : 0
    return {
      name: geo,
      customers: v.total,
      churnRate,
      retentionRate: 100 - churnRate,
      churned: v.churned,
      retained: v.total - v.churned,
      riskLevel: churnRate >= 30 ? 'Critical' : churnRate >= 25 ? 'High' : churnRate >= 20 ? 'Medium' : 'Low',
      color: geo === 'France' ? '#10b981' : geo === 'Germany' ? '#ef4444' : '#f59e0b'
    }
  }).sort((a, b) => b.churnRate - a.churnRate)

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'Critical': return '#dc2626'
      case 'High': return '#f97316'
      case 'Medium': return '#facc15'
      default: return '#22c55e'
    }
  }

  const barData = geoAnalysis.map(geo => ({
    name: geo.name,
    'Churn Rate': geo.churnRate,
    'Retention Rate': geo.retentionRate,
    customers: geo.customers,
    color: geo.color
  }))

  if (geoAnalysis.length === 0) return <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} py-8`}>Waiting for stream data...</div>

  const highestChurn = geoAnalysis[0]
  const lowestChurn = geoAnalysis[geoAnalysis.length - 1]

  return (
    <div className="card glow-effect">
      <div className="card-header"><h3 className="card-title">📊 Geographic Churn Analysis</h3></div>
      <div className="card-content">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>Highest Risk</span>
            </div>
            <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{highestChurn?.name}</div>
            <div className="text-red-400 text-lg font-bold">{highestChurn?.churnRate.toFixed(1)}% churn</div>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-green-400" />
              <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Lowest Risk</span>
            </div>
            <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{lowestChurn?.name}</div>
            <div className="text-green-400 text-lg font-bold">{lowestChurn?.churnRate.toFixed(1)}% churn</div>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Churn Gap</span>
            </div>
            <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {(highestChurn?.churnRate - lowestChurn?.churnRate).toFixed(1)}%
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>difference in rates</div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Churn vs Retention Rate by Region</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 40 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`}
                tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={70}
                tick={{ fill: isDark ? '#f3f4f6' : '#1f2937', fontSize: 12, fontWeight: 500 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value.toFixed(1)}%`, name]} />
              <Bar dataKey="Retention Rate" stackId="a" fill="#22c55e">
                <LabelList dataKey="Retention Rate" position="center" formatter={(v) => `${v.toFixed(0)}%`} fill="#fff" fontSize={11} fontWeight="bold" />
              </Bar>
              <Bar dataKey="Churn Rate" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="Churn Rate" position="center" formatter={(v) => `${v.toFixed(0)}%`} fill="#fff" fontSize={11} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {geoAnalysis.map((geo) => (
            <div key={geo.name} className={`p-3 rounded-lg border-l-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`} style={{ borderLeftColor: geo.color }}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{geo.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${getRiskColor(geo.riskLevel)}20`, color: getRiskColor(geo.riskLevel) }}>
                  {geo.riskLevel}
                </span>
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                <div className="flex justify-between"><span>Customers:</span><span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{geo.customers.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Churned:</span><span className="font-medium text-red-400">{geo.churned.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Retained:</span><span className="font-medium text-green-400">{geo.retained.toLocaleString()}</span></div>
              </div>
              <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${geo.retentionRate}%` }} />
              </div>
            </div>
          ))}
        </div>
        <InsightDropdown title="Understanding Geographic Churn Analysis"
          interpretation="Compare churn & retention across regions from live stream. Stacked bars show the split."
          insights={["Highest churn region needs immediate intervention","Data updates in real-time from the live stream"]} />
      </div>
    </div>
  )
}

export default CustomerLTVSunburst
