import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import InsightDropdown from '../InsightDropdown'
import { useTheme } from '../../context/ThemeContext'
import { useLiveData } from '../../context/LiveDataContext'

const ActivityGauges = () => {
  const { isDark, chartColors } = useTheme()
  const { liveStats } = useLiveData()

  if (!liveStats || !liveStats.total_customers) {
    return <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} py-8`}>Waiting for stream data...</div>
  }

  const churnRate = liveStats.churn_rate || 0
  const avgCredit = liveStats.avg_credit_score || 0
  const retentionRate = 100 - churnRate
  const avgBalance = liveStats.avg_balance || 0

  const gauges = [
    { label: 'Churn Risk', value: churnRate, max: 100, color: '#ef4444', suffix: '%' },
    { label: 'Credit Health', value: Math.min(avgCredit / 850 * 100, 100), max: 100, color: '#3b82f6', suffix: '%', display: Math.round(avgCredit) },
    { label: 'Customer Retention', value: retentionRate, max: 100, color: '#10b981', suffix: '%' },
    { label: 'Avg Balance', value: Math.min(avgBalance / 250000 * 100, 100), max: 100, color: '#f59e0b', suffix: '', display: `$${Math.round(avgBalance).toLocaleString()}` }
  ]

  return (
    <div className="card glow-effect">
      <div className="card-header"><h3 className="card-title">Activity Gauges</h3></div>
      <div className="card-content">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gauges.map((g, idx) => {
            const data = [{ value: g.value }, { value: g.max - g.value }]
            const displayVal = g.display || `${g.value.toFixed(1)}${g.suffix}`
            return (
              <div key={idx} className="flex flex-col items-center">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={50}
                      startAngle={180} endAngle={0} dataKey="value" stroke="none">
                      <Cell fill={g.color} />
                      <Cell fill={isDark ? '#374151' : '#e5e7eb'} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className={`text-lg font-bold mt-[-20px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{displayVal}</div>
                <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{g.label}</div>
              </div>
            )
          })}
        </div>
        <InsightDropdown title="Understanding Activity Gauges"
          interpretation="Four semi-circular gauges summarizing key live metrics from the WebSocket stream."
          insights={["Churn Risk: percentage of streamed customers predicted to churn","Credit Health: average credit score relative to 850 max","Retention: percentage of customers predicted to stay","Balance: average balance of streamed customers"]} />
      </div>
    </div>
  )
}

export default ActivityGauges
