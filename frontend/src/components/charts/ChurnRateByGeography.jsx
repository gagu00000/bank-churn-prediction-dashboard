import React, { useState } from 'react'
import { ComposedChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine, Line } from 'recharts'
import { MapPin, Target } from 'lucide-react'
import InsightDropdown from '../InsightDropdown'
import { useTheme } from '../../context/ThemeContext'
import { useLiveData } from '../../context/LiveDataContext'

const ChurnRateByGeography = () => {
  const { isDark, chartColors } = useTheme()
  const { geographyLive, liveStats } = useLiveData()
  const [selectedRegion, setSelectedRegion] = useState(null)

  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#1f2937',
    padding: '12px'
  }

  const data = Object.entries(geographyLive).map(([geo, v]) => {
    const churnRate = v.total > 0 ? (v.churned / v.total) * 100 : 0
    return {
      name: geo,
      customers: v.total,
      churnRate,
      retentionRate: 100 - churnRate,
      churned: v.churned,
      retained: v.total - v.churned,
      revenueAtRisk: v.churned * 1000,
      customerShare: 0,
      flag: geo === 'France' ? '🇫🇷' : geo === 'Germany' ? '🇩🇪' : '🇪🇸',
      color: churnRate >= 30 ? '#dc2626' : churnRate >= 25 ? '#f97316' : churnRate >= 20 ? '#facc15' : '#22c55e'
    }
  }).sort((a, b) => b.churnRate - a.churnRate)

  const total = data.reduce((s, g) => s + g.customers, 0)
  const totalChurned = data.reduce((s, g) => s + g.churned, 0)
  const avgChurn = total > 0 ? (totalChurned / total) * 100 : 0
  data.forEach(g => { g.customerShare = total > 0 ? (g.customers / total) * 100 : 0 })

  if (data.length === 0) return <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} py-8`}>Waiting for stream data...</div>

  return (
    <div className="card glow-effect">
      <div className="card-header p-4 flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🎯 Regional Risk & Impact Analysis</h3>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Low</span>
          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>Med</span>
          <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>High</span>
        </div>
      </div>
      <div className="card-content p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {data.map((geo) => (
            <div key={geo.name}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedRegion === geo.name ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-102'} ${isDark ? 'bg-gray-800/80' : 'bg-gray-100'}`}
              style={{ borderTop: `4px solid ${geo.color}` }}
              onClick={() => setSelectedRegion(selectedRegion === geo.name ? null : geo.name)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{geo.flag}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${geo.color}30`, color: geo.color }}>
                  {geo.churnRate >= 30 ? '⚠️ CRITICAL' : geo.churnRate >= 25 ? '⚠️ HIGH' : geo.churnRate >= 20 ? 'MEDIUM' : '✓ LOW'}
                </span>
              </div>
              <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{geo.name}</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold" style={{ color: geo.color }}>{geo.churnRate.toFixed(1)}%</span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>churn</span>
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>{geo.customers.toLocaleString()} customers</div>
            </div>
          ))}
          <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>BENCHMARK</span>
            </div>
            <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Average</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-blue-400">{avgChurn.toFixed(1)}%</span>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>churn</span>
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>{total.toLocaleString()} total</div>
          </div>
        </div>

        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Churn Rate Comparison (vs Average: {avgChurn.toFixed(1)}%)
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
              <XAxis type="number" domain={[0, 'auto']} tickFormatter={(v) => `${v}%`}
                tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 11 }} axisLine={{ stroke: isDark ? '#374151' : '#d1d5db' }} />
              <YAxis type="category" dataKey="name" width={80}
                tick={({ x, y, payload }) => {
                  const geo = data.find(d => d.name === payload.value)
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-10} y={0} dy={4} textAnchor="end" fill={isDark ? '#f3f4f6' : '#1f2937'} fontSize={13} fontWeight={600}>
                        {geo?.flag} {payload.value}
                      </text>
                    </g>
                  )
                }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v.toFixed(1)}%`, 'Churn Rate']} />
              <ReferenceLine x={avgChurn} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Avg', fill: '#3b82f6', fontSize: 10 }} />
              <Bar dataKey="churnRate" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <InsightDropdown title="Understanding Regional Risk" interpretation="Live data from stream — bars show churn rate per region vs average."
          insights={["Bars exceeding the blue dashed line are above average churn","Focus retention on highest-risk regions"]} />
      </div>
    </div>
  )
}

export default ChurnRateByGeography
