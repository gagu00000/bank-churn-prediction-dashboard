import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts'
import InsightDropdown from '../components/InsightDropdown'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import StreamGate from '../components/StreamGate'
import { useLiveData } from '../context/LiveDataContext'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const RISK_COLORS = { CRITICAL: '#dc2626', HIGH: '#f59e0b', MEDIUM: '#eab308', LOW: '#22c55e' }

const RetentionStrategyPage = () => {
  const { isDark, chartColors } = useTheme()
  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#1f2937'
  }
  
  const { liveRetentionData, liveCohortData } = useLiveData()
  const [activeTab, setActiveTab] = useState('interventions')

  const retentionInsights = liveRetentionData
  const cohortAnalysis = liveCohortData

  return (
    <StreamGate pageName="Retention Strategy">
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>🎯 Retention Strategy</h2>
        <div className="flex gap-2">
          {['interventions', 'cohorts', 'roi'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab === 'roi' ? 'ROI Analysis' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {retentionInsights?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`card glow-effect p-4`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Customers</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {retentionInsights.summary.total_customers?.toLocaleString()}
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`card glow-effect p-4`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>At-Risk Customers</p>
            <p className="text-2xl font-bold text-red-500">
              {retentionInsights.summary.at_risk_customers?.toLocaleString()}
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`card glow-effect p-4`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Churn Rate</p>
            <p className="text-2xl font-bold text-orange-500">
              {retentionInsights.summary.churn_rate?.toFixed(1)}%
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`card glow-effect p-4`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Revenue at Risk</p>
            <p className="text-2xl font-bold text-red-500">
              ${(retentionInsights.summary.revenue_at_risk / 1000000)?.toFixed(1)}M
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`card glow-effect p-4`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Potential Savings</p>
            <p className="text-2xl font-bold text-green-500">
              ${(retentionInsights.summary.potential_savings / 1000000)?.toFixed(1)}M
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`card glow-effect p-4`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Customer LTV</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${retentionInsights.summary.avg_customer_ltv?.toLocaleString()}
            </p>
          </motion.div>
        </div>
      )}

      {/* Priority Actions Banner */}
      {retentionInsights?.priority_actions && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`card glow-effect p-6 ${isDark ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>🚀 Priority Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {retentionInsights.priority_actions.map((action, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <span className={`inline-block w-6 h-6 rounded-full text-center text-sm font-bold mb-2 ${
                  idx === 0 ? 'bg-red-500 text-white' : 
                  idx === 1 ? 'bg-orange-500 text-white' : 
                  idx === 2 ? 'bg-yellow-500 text-gray-900' : 
                  'bg-blue-500 text-white'
                }`}>
                  {idx + 1}
                </span>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{action}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'interventions' && retentionInsights?.recommended_interventions && (
        <motion.div 
          key="interventions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Intervention Cards */}
          <div className="card glow-effect">
            <div className="card-header p-4 border-b border-gray-700">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 Recommended Interventions</h3>
            </div>
            <div className="card-content p-4 space-y-4">
              {retentionInsights.recommended_interventions.map((intervention, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border-l-4 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}
                  style={{ borderLeftColor: COLORS[idx % COLORS.length] }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {intervention.type}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400`}>
                      {intervention.roi}% ROI
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Target: {intervention.target_segment}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Customers</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {intervention.target_count?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Expected Saves</p>
                      <p className="font-medium text-green-500">{intervention.expected_saves?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Revenue Impact</p>
                      <p className="font-medium text-blue-500">${(intervention.revenue_impact / 1000)?.toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Comparison Chart */}
          <div className="card glow-effect">
            <div className="card-header p-4 border-b border-gray-700">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Intervention ROI Comparison</h3>
            </div>
            <div className="card-content p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={retentionInsights.recommended_interventions.map(i => ({
                    name: i.type.split(' ')[0],
                    roi: i.roi,
                    revenue: i.revenue_impact / 1000,
                    cost: i.cost / 1000
                  }))} 
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis type="number" stroke={chartColors.text} />
                  <YAxis type="category" dataKey="name" stroke={chartColors.text} width={100} />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [
                      name === 'roi' ? `${value}%` : `$${value.toFixed(0)}K`,
                      name === 'roi' ? 'ROI' : name === 'revenue' ? 'Revenue' : 'Cost'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="roi" fill="#10b981" name="ROI %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <InsightDropdown 
                title="Understanding ROI"
                interpretation="Each bar represents the expected return on investment for different retention interventions. Higher ROI means more effective use of retention budget."
                insights={[
                  "Product Simplification shows highest ROI - low cost, high impact",
                  "Personal outreach programs have moderate cost but high success rates",
                  "Balance interventions by cost and expected customer saves",
                  "Consider implementing top 2-3 interventions simultaneously"
                ]}
              />
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'cohorts' && cohortAnalysis && (
        <motion.div 
          key="cohorts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Cohort Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tenure Cohorts */}
            <div className="card glow-effect">
              <div className="card-header p-4 border-b border-gray-700">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📅 By Tenure</h3>
              </div>
              <div className="card-content p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cohortAnalysis.tenure_cohorts}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="cohort" stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <YAxis stroke={chartColors.text} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v.toFixed(1)}%`, 'Churn Rate']} />
                    <Bar dataKey="churn_rate" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className={`mt-4 p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Insight:</strong> New customers need the most attention - focus onboarding efforts here.
                  </p>
                </div>
              </div>
            </div>

            {/* Value Cohorts */}
            <div className="card glow-effect">
              <div className="card-header p-4 border-b border-gray-700">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>💰 By Balance</h3>
              </div>
              <div className="card-content p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cohortAnalysis.value_cohorts}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="cohort" stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <YAxis stroke={chartColors.text} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v.toFixed(1)}%`, 'Churn Rate']} />
                    <Bar dataKey="churn_rate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className={`mt-4 p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Insight:</strong> Dormant accounts show high churn - reactivation campaigns needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Age Cohorts */}
            <div className="card glow-effect">
              <div className="card-header p-4 border-b border-gray-700">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>👤 By Age</h3>
              </div>
              <div className="card-content p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cohortAnalysis.age_cohorts}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="cohort" stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <YAxis stroke={chartColors.text} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v.toFixed(1)}%`, 'Churn Rate']} />
                    <Bar dataKey="churn_rate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className={`mt-4 p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Insight:</strong> Senior customers (50+) have highest churn - consider loyalty programs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cohort Insights */}
          {cohortAnalysis.insights && (
            <div className="card glow-effect">
              <div className="card-header p-4 border-b border-gray-700">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>💡 Key Cohort Insights</h3>
              </div>
              <div className="card-content p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cohortAnalysis.insights.map((insight, idx) => (
                    <div key={idx} className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <span className="text-2xl">
                        {idx === 0 ? '🆕' : idx === 1 ? '👴' : idx === 2 ? '💎' : '🏦'}
                      </span>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'roi' && retentionInsights?.recommended_interventions && (
        <motion.div 
          key="roi"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Revenue Impact Analysis */}
          <div className="card glow-effect">
            <div className="card-header p-4 border-b border-gray-700">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>💰 Revenue Impact by Intervention</h3>
            </div>
            <div className="card-content p-4">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={retentionInsights.recommended_interventions.map(i => ({
                    name: i.type,
                    revenue: i.revenue_impact,
                    cost: i.cost,
                    net: i.revenue_impact - i.cost
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis type="number" stroke={chartColors.text} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" stroke={chartColors.text} width={150} />
                  <Tooltip 
                    contentStyle={tooltipStyle} 
                    formatter={(v, name) => [`$${(v/1000).toFixed(0)}K`, name.charAt(0).toUpperCase() + name.slice(1)]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue Impact" stackId="a" />
                  <Bar dataKey="cost" fill="#ef4444" name="Cost" stackId="b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost-Benefit Table */}
          <div className="card glow-effect">
            <div className="card-header p-4 border-b border-gray-700">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Cost-Benefit Analysis</h3>
            </div>
            <div className="card-content p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Intervention</th>
                      <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Target Size</th>
                      <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Expected Saves</th>
                      <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Cost</th>
                      <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Revenue</th>
                      <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Net Benefit</th>
                      <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retentionInsights.recommended_interventions.map((intervention, idx) => {
                      const net = intervention.revenue_impact - intervention.cost
                      return (
                        <tr key={idx} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {intervention.type}
                          </td>
                          <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {intervention.target_count?.toLocaleString()}
                          </td>
                          <td className={`px-4 py-3 text-right text-green-500 font-medium`}>
                            {intervention.expected_saves?.toLocaleString()}
                          </td>
                          <td className={`px-4 py-3 text-right text-red-500`}>
                            ${(intervention.cost / 1000)?.toFixed(1)}K
                          </td>
                          <td className={`px-4 py-3 text-right text-blue-500`}>
                            ${(intervention.revenue_impact / 1000)?.toFixed(1)}K
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${net > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${(net / 1000)?.toFixed(1)}K
                          </td>
                          <td className={`px-4 py-3 text-right`}>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              intervention.roi > 400 ? 'bg-green-500/20 text-green-400' :
                              intervention.roi > 300 ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {intervention.roi}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
                    <tr className={`border-t-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                      <td className={`px-4 py-3 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>TOTAL</td>
                      <td className={`px-4 py-3 text-right font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {retentionInsights.recommended_interventions.reduce((a, b) => a + b.target_count, 0)?.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold text-green-500`}>
                        {retentionInsights.recommended_interventions.reduce((a, b) => a + b.expected_saves, 0)?.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold text-red-500`}>
                        ${(retentionInsights.recommended_interventions.reduce((a, b) => a + b.cost, 0) / 1000)?.toFixed(1)}K
                      </td>
                      <td className={`px-4 py-3 text-right font-bold text-blue-500`}>
                        ${(retentionInsights.recommended_interventions.reduce((a, b) => a + b.revenue_impact, 0) / 1000)?.toFixed(1)}K
                      </td>
                      <td className={`px-4 py-3 text-right font-bold text-green-500`}>
                        ${((retentionInsights.recommended_interventions.reduce((a, b) => a + b.revenue_impact, 0) - 
                           retentionInsights.recommended_interventions.reduce((a, b) => a + b.cost, 0)) / 1000)?.toFixed(1)}K
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
    </StreamGate>
  )
}

export default RetentionStrategyPage
