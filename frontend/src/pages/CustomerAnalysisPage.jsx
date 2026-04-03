import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, ScatterChart, Scatter, ZAxis, Cell, FunnelChart, Funnel, LabelList } from 'recharts'
import InsightDropdown from '../components/InsightDropdown'
import { useTheme } from '../context/ThemeContext'
import { useLiveData } from '../context/LiveDataContext'
import StreamGate from '../components/StreamGate'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const CustomerAnalysisPage = () => {
  const { isDark, chartColors } = useTheme()
  const { liveStats, liveChurnAnalysis, geographyLive, genderLive, ageLive, productLive, activeMemberLive } = useLiveData()
  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#1f2937'
  }

  const stats = liveStats
  const churnAnalysis = liveChurnAnalysis

  // Prepare geography combo data from live tracking
  const geographyComboData = Object.entries(geographyLive).map(([geo, v]) => ({
    geography: geo,
    retained: v.total - v.churned,
    churned: v.churned,
    churnRate: v.total > 0 ? ((v.churned / v.total) * 100).toFixed(1) : '0'
  }))

  // Gender churn data from live tracking
  const genderChurnData = Object.entries(genderLive).map(([gender, v]) => ({
    gender,
    churnRate: v.total > 0 ? (v.churned / v.total) * 100 : 0,
    total: v.total,
    churned: v.churned
  }))

  // Age group data from live tracking
  const ageOrder = ['0-30', '31-40', '41-50', '51+']
  const avgChurnRate = stats ? stats.churn_rate : 20
  const ageGroupData = ageOrder
    .filter(g => ageLive[g])
    .map(g => ({
      ageGroup: g,
      churnRate: ageLive[g].total > 0 ? (ageLive[g].churned / ageLive[g].total) * 100 : 0,
      baseline: avgChurnRate
    }))

  // Products data from live tracking
  const productsData = Object.entries(productLive).map(([key, v]) => ({
    products: parseInt(key),
    name: `${key} Product${parseInt(key) > 1 ? 's' : ''}`,
    churnRate: v.total > 0 ? (v.churned / v.total) * 100 : 0,
    count: v.total,
    churned: v.churned
  }))

  // Customer funnel from live data
  const funnelData = [
    { name: 'Total Processed', value: stats?.total_customers || 0, fill: '#3b82f6' },
    { name: 'At Risk (Predicted)', value: stats?.churned_customers || 0, fill: '#f59e0b' },
    { name: 'High Risk', value: Math.round((stats?.churned_customers || 0) * 0.4), fill: '#ef4444' },
    { name: 'Critical Risk', value: Math.round((stats?.churned_customers || 0) * 0.15), fill: '#dc2626' }
  ]

  // Activity data from live tracking
  const activityData = [
    {
      status: 'Active Members',
      churnRate: activeMemberLive['1']?.total > 0 ? (activeMemberLive['1'].churned / activeMemberLive['1'].total) * 100 : 0,
      count: activeMemberLive['1']?.total || 0,
      color: '#10b981'
    },
    {
      status: 'Inactive Members',
      churnRate: activeMemberLive['0']?.total > 0 ? (activeMemberLive['0'].churned / activeMemberLive['0'].total) * 100 : 0,
      count: activeMemberLive['0']?.total || 0,
      color: '#ef4444'
    }
  ]

  return (
    <StreamGate pageName="Customer Analysis">
      <div className="space-y-6">
        <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Customer Analysis</h2>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`card glow-effect ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
            <div className="card-content p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Customers</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats?.total_customers?.toLocaleString()}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <div className={`mt-2 h-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-1 bg-blue-500 rounded" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
          <div className={`card glow-effect ${isDark ? 'bg-gradient-to-br from-red-900/50 to-red-800/30' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
            <div className="card-content p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Churned Customers</p>
                  <p className="text-3xl font-bold text-red-500">{stats?.churned_customers?.toLocaleString()}</p>
                </div>
                <div className="text-4xl">📉</div>
              </div>
              <div className={`mt-2 h-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-1 bg-red-500 rounded" style={{ width: `${stats?.churn_rate || 0}%` }}></div>
              </div>
            </div>
          </div>
          <div className={`card glow-effect ${isDark ? 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/30' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'}`}>
            <div className="card-content p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall Churn Rate</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats?.churn_rate?.toFixed(1)}%</p>
                </div>
                <div className="text-4xl">⚠️</div>
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Live stream rate</p>
            </div>
          </div>
          <div className={`card glow-effect ${isDark ? 'bg-gradient-to-br from-green-900/50 to-green-800/30' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
            <div className="card-content p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Credit Score</p>
                  <p className="text-3xl font-bold text-green-500">{stats?.avg_credit_score?.toFixed(0)}</p>
                </div>
                <div className="text-4xl">💳</div>
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Range: 300-850</p>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Geography Combo */}
          <div className="card glow-effect">
            <div className="card-header p-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📍 Geography: Customers & Churn Rate</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Stacked bars show volume, line shows churn rate</p>
            </div>
            <div className="card-content p-4">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={geographyComboData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="geography" stroke={chartColors.text} />
                  <YAxis yAxisId="left" stroke={chartColors.text} label={{ value: 'Customers', angle: -90, position: 'insideLeft', fill: chartColors.text }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" label={{ value: 'Churn %', angle: 90, position: 'insideRight', fill: '#f59e0b' }} />
                  <Tooltip contentStyle={tooltipStyle}
                    formatter={(value, name) => {
                      if (name === 'churnRate') return [`${value}%`, 'Churn Rate']
                      return [value.toLocaleString(), name.charAt(0).toUpperCase() + name.slice(1)]
                    }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="retained" stackId="a" fill="#10b981" name="Retained" />
                  <Bar yAxisId="left" dataKey="churned" stackId="a" fill="#ef4444" name="Churned" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="churnRate" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 6 }} name="Churn Rate %" />
                </ComposedChart>
              </ResponsiveContainer>
              <InsightDropdown title="How to interpret this chart"
                interpretation="Combo chart: stacked bars (green=retained, red=churned) + churn rate line overlay. All from live stream."
                insights={["Compare bar heights across regions","Orange line shows churn rate — higher = more churn","Data updates as the stream runs"]} />
            </div>
          </div>

          {/* Gender Comparison */}
          <div className="card glow-effect">
            <div className="card-header p-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>⚧ Gender Churn Comparison</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Shows churn rate difference between genders</p>
            </div>
            <div className="card-content p-4">
              <div className="space-y-6 py-4">
                {genderChurnData.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.gender === 'Male' ? '👨' : '👩'} {item.gender}
                      </span>
                      <span className="text-gray-400">{item.total.toLocaleString()} customers</span>
                    </div>
                    <div className="relative h-10 bg-gray-700/50 rounded-lg overflow-hidden">
                      <div className="absolute h-full bg-gradient-to-r from-green-600 to-green-500 rounded-l-lg flex items-center justify-end pr-2"
                        style={{ width: `${100 - item.churnRate}%` }}>
                        <span className="text-xs text-white font-bold">{(100 - item.churnRate).toFixed(1)}% Retained</span>
                      </div>
                      <div className="absolute h-full right-0 bg-gradient-to-r from-red-500 to-red-600 rounded-r-lg flex items-center justify-center"
                        style={{ width: `${item.churnRate}%` }}>
                        <span className="text-xs text-white font-bold">{item.churnRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{item.churned.toLocaleString()} churned</p>
                  </div>
                ))}
              </div>
              {genderChurnData.length >= 2 && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="text-yellow-500 font-bold">Insight:</span> {
                      genderChurnData[0]?.churnRate > genderChurnData[1]?.churnRate 
                        ? `${genderChurnData[0].gender} customers have higher churn - consider targeted retention campaigns`
                        : `${genderChurnData[1]?.gender || 'Female'} customers have higher churn - investigate product satisfaction`
                    }
                  </p>
                </div>
              )}
              <InsightDropdown title="How to interpret this chart"
                interpretation="Horizontal stacked bars: green=retained, red=churned for each gender. From live stream predictions."
                insights={["Wider red sections indicate higher churn rates","Compare widths to spot which gender churns more","Data updates in real-time"]} />
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Group */}
          <div className="card glow-effect">
            <div className="card-header p-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>👴 Churn Rate by Age Group</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Dashed line = average churn rate</p>
            </div>
            <div className="card-content p-4">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={ageGroupData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
                  <XAxis type="number" stroke={chartColors.text} domain={[0, 'auto']} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <YAxis type="category" dataKey="ageGroup" stroke={chartColors.text} width={60} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Churn Rate']} />
                  <Line type="monotone" dataKey="baseline" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Bar dataKey="churnRate" fill="transparent" barSize={2}>
                    {ageGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.churnRate > avgChurnRate ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                  <Scatter dataKey="churnRate" fill="#8b5cf6">
                    {ageGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.churnRate > avgChurnRate ? '#ef4444' : '#10b981'} />
                    ))}
                  </Scatter>
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Below avg</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Above avg</span>
                <span className="flex items-center gap-1"><span className="w-6 border-t-2 border-yellow-500 border-dashed"></span> Avg ({avgChurnRate.toFixed(1)}%)</span>
              </div>
              <InsightDropdown title="How to interpret this chart"
                interpretation="Lollipop chart: each dot shows churn rate for an age group. Green=below average, red=above."
                insights={["Age groups with RED dots need attention","Older groups (51+) often show higher churn"]} />
            </div>
          </div>

          {/* Products Bubble */}
          <div className="card glow-effect">
            <div className="card-header p-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📦 Products Impact Analysis</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Bubble size = customer count</p>
            </div>
            <div className="card-content p-4">
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis type="number" dataKey="products" name="Products" stroke={chartColors.text} domain={[0, 5]} label={{ value: 'Number of Products', position: 'insideBottom', offset: -5, fill: chartColors.text }} />
                  <YAxis type="number" dataKey="churnRate" name="Churn Rate" stroke={chartColors.text} domain={[0, 100]} label={{ value: 'Churn Rate (%)', angle: -90, position: 'insideLeft', fill: chartColors.text }} />
                  <ZAxis type="number" dataKey="count" range={[100, 1000]} name="Customers" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle}
                    formatter={(value, name) => {
                      if (name === 'Churn Rate') return [`${value.toFixed(1)}%`, name]
                      if (name === 'Customers') return [value.toLocaleString(), name]
                      return [value, name]
                    }} />
                  <Scatter data={productsData} fill="#8b5cf6">
                    {productsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.churnRate > 50 ? '#ef4444' : entry.churnRate > 20 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="text-yellow-500 font-bold">Insight:</span> Customers with 3+ products may show dramatically higher churn
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity Impact */}
          <div className="card glow-effect">
            <div className="card-header p-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🎯 Activity Status Impact</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Active vs Inactive member churn comparison</p>
            </div>
            <div className="card-content p-4">
              <div className="space-y-8 py-4">
                {activityData.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.status}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.churnRate.toFixed(1)}% churn rate</span>
                    </div>
                    <div className="relative">
                      <div className={`h-8 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="h-full rounded-full flex items-center transition-all duration-1000"
                          style={{ width: `${Math.min(item.churnRate * 2, 100)}%`, backgroundColor: item.color }}></div>
                      </div>
                      <div className={`flex justify-between mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <span>0%</span><span>25%</span><span>50%</span>
                      </div>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.count.toLocaleString()} customers</p>
                  </div>
                ))}
              </div>
              {activityData[0]?.count > 0 && activityData[1]?.count > 0 && (
                <div className={`mt-4 p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-red-500 font-bold">⚠️ Critical Insight</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Inactive members churn at {activityData[0]?.churnRate > 0 ? (activityData[1]?.churnRate / activityData[0]?.churnRate).toFixed(1) : '-'}x the rate of active members.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Funnel */}
          <div className="card glow-effect">
            <div className="card-header p-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🔻 Customer Risk Funnel</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>From total processed to critical risk</p>
            </div>
            <div className="card-content p-4">
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value.toLocaleString(), 'Customers']} />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill={isDark ? '#fff' : '#374151'} stroke="none" dataKey="name" fontSize={12} />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={14} fontWeight="bold" formatter={(v) => v.toLocaleString()} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Actionable Recommendations</h3>
          </div>
          <div className="card-content p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-800/50' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
                <p className="text-blue-500 font-semibold mb-2 flex items-center gap-2">📍 Focus: High Churn Regions</p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Investigate regions with highest churn rates from live data for targeted retention.
                </p>
              </div>
              <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-800/50' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
                <p className="text-purple-500 font-semibold mb-2 flex items-center gap-2">👴 Target: Older Age Groups</p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Higher churn in older demographics. Simplify digital experience and add personal advisor options.
                </p>
              </div>
              <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-800/50' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
                <p className="text-green-500 font-semibold mb-2 flex items-center gap-2">🎯 Activate Dormant Users</p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Inactive members churn significantly more. Implement engagement scoring and outreach triggers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StreamGate>
  )
}

export default CustomerAnalysisPage
