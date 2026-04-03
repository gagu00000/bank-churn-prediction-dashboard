import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, ComposedChart, ReferenceLine } from 'recharts'
import InsightDropdown from '../components/InsightDropdown'
import { useTheme } from '../context/ThemeContext'
import StreamGate from '../components/StreamGate'
import { useLiveData } from '../context/LiveDataContext'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const BusinessImpactPage = () => {
  const { isDark, chartColors } = useTheme()
  const { liveStats, streamStats } = useLiveData()
  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#1f2937'
  }
  const [scenarioMultiplier, setScenarioMultiplier] = useState(1)

  // Financial metrics (based on banking averages)
  const avgCustomerValue = 1250 // Annual revenue per customer
  const acquisitionCost = 350 // Cost to acquire new customer
  const retentionCost = 75 // Cost of retention campaign
  const retentionSuccessRate = 0.35 * scenarioMultiplier // 35% of at-risk customers retained

  const totalCustomers = liveStats?.total_customers || 0
  const churnedCustomers = liveStats?.churned_customers || 0
  const churnRate = liveStats?.churn_rate || 0

  // Calculate financial impact
  const revenueAtRisk = churnedCustomers * avgCustomerValue
  const replacementCost = churnedCustomers * acquisitionCost
  const totalChurnCost = revenueAtRisk + replacementCost
  const potentialSavings = churnedCustomers * retentionSuccessRate * (avgCustomerValue - retentionCost)
  const roi = ((potentialSavings - (churnedCustomers * retentionCost)) / (churnedCustomers * retentionCost) * 100)

  // Waterfall chart data for cost buildup
  const waterfallData = [
    { name: 'Base Revenue', value: totalCustomers * avgCustomerValue, fill: '#3b82f6', isTotal: false },
    { name: 'Lost Revenue', value: -revenueAtRisk, fill: '#ef4444', isTotal: false },
    { name: 'Replacement Cost', value: -replacementCost, fill: '#f59e0b', isTotal: false },
    { name: 'ML Savings', value: potentialSavings, fill: '#10b981', isTotal: false },
    { name: 'Net Impact', value: totalCustomers * avgCustomerValue - revenueAtRisk - replacementCost + potentialSavings, fill: '#8b5cf6', isTotal: true }
  ]

  // Monthly trend with breakeven
  const monthlyImpact = [
    { month: 'Jan', churnCost: 180, savings: 45, cumulative: -135 },
    { month: 'Feb', churnCost: 195, savings: 52, cumulative: -278 },
    { month: 'Mar', churnCost: 210, savings: 68, cumulative: -420 },
    { month: 'Apr', churnCost: 188, savings: 72, cumulative: -536 },
    { month: 'May', churnCost: 175, savings: 85, cumulative: -626 },
    { month: 'Jun', churnCost: 165, savings: 95, cumulative: -696 },
    { month: 'Jul', churnCost: 155, savings: 102, cumulative: -749 },
    { month: 'Aug', churnCost: 148, savings: 108, cumulative: -789 },
    { month: 'Sep', churnCost: 142, savings: 125, cumulative: -806 },
    { month: 'Oct', churnCost: 138, savings: 145, cumulative: -799 },
    { month: 'Nov', churnCost: 132, savings: 165, cumulative: -766 },
    { month: 'Dec', churnCost: 125, savings: 180, cumulative: -711 }
  ]

  // Scenario comparison
  const scenarioData = [
    { scenario: 'No ML', retained: 0, cost: totalChurnCost, savings: 0 },
    { scenario: 'Current', retained: Math.round(churnedCustomers * 0.35), cost: totalChurnCost * 0.65, savings: potentialSavings },
    { scenario: 'Optimized', retained: Math.round(churnedCustomers * 0.50), cost: totalChurnCost * 0.50, savings: potentialSavings * 1.43 },
    { scenario: 'Ideal', retained: Math.round(churnedCustomers * 0.70), cost: totalChurnCost * 0.30, savings: potentialSavings * 2 }
  ]

  // Segment impact with visual bars
  const segmentImpact = [
    { segment: 'High Value', customers: 450, avgValue: 3200, atRisk: 85, potentialLoss: 272000, priority: 'CRITICAL', color: '#ef4444' },
    { segment: 'Medium Value', customers: 2800, avgValue: 1400, atRisk: 420, potentialLoss: 588000, priority: 'HIGH', color: '#f59e0b' },
    { segment: 'Low Value', customers: 6750, avgValue: 650, atRisk: 1532, potentialLoss: 995800, priority: 'MEDIUM', color: '#3b82f6' }
  ]

  // ROI by intervention type
  const interventionROI = [
    { type: 'Personal Call', cost: 45, successRate: 42, roi: 380, effort: 'High' },
    { type: 'Email Campaign', cost: 5, successRate: 18, roi: 520, effort: 'Low' },
    { type: 'Loyalty Bonus', cost: 75, successRate: 55, roi: 290, effort: 'Medium' },
    { type: 'Product Upgrade', cost: 25, successRate: 35, roi: 450, effort: 'Medium' },
    { type: 'Account Manager', cost: 120, successRate: 65, roi: 210, effort: 'High' }
  ]

  if (!liveStats) {
    return null
  }

  const formatCurrency = (value) => `$${(value / 1000).toFixed(0)}K`
  const formatFullCurrency = (value) => `$${value.toLocaleString()}`

  return (
    <StreamGate pageName="Business Impact">
    <div className="space-y-6">
      <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Business Impact</h2>
      
      {/* Financial KPIs - Enhanced with Visual Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`card glow-effect ${isDark ? 'bg-gradient-to-br from-red-900/50 to-red-800/30' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
          <div className="card-content p-4">
            <p className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>💸 Revenue at Risk</p>
            <p className="text-3xl font-bold text-red-500">{formatFullCurrency(revenueAtRisk)}</p>
            <div className={`mt-2 h-2 rounded overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="h-full bg-red-500 rounded" style={{ width: `${(revenueAtRisk / totalCustomers / avgCustomerValue) * 100}%` }}></div>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{((revenueAtRisk / (totalCustomers * avgCustomerValue)) * 100).toFixed(1)}% of total revenue</p>
          </div>
        </div>
        <div className={`card glow-effect ${isDark ? 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/30' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'}`}>
          <div className="card-content p-4">
            <p className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>🔄 Replacement Cost</p>
            <p className="text-3xl font-bold text-yellow-500">{formatFullCurrency(replacementCost)}</p>
            <div className={`mt-2 h-2 rounded overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="h-full bg-yellow-500 rounded" style={{ width: `${(replacementCost / revenueAtRisk) * 100}%` }}></div>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>${acquisitionCost} per customer</p>
          </div>
        </div>
        <div className={`card glow-effect ${isDark ? 'bg-gradient-to-br from-green-900/50 to-green-800/30' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
          <div className="card-content p-4">
            <p className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>💰 ML-Driven Savings</p>
            <p className="text-3xl font-bold text-green-500">{formatFullCurrency(potentialSavings)}</p>
            <div className={`mt-2 h-2 rounded overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="h-full bg-green-500 rounded" style={{ width: `${(potentialSavings / revenueAtRisk) * 100}%` }}></div>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{(retentionSuccessRate * 100).toFixed(0)}% retention rate</p>
          </div>
        </div>
        <div className={`card glow-effect ${isDark ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30' : 'bg-gradient-to-br from-purple-50 to-purple-100'}`}>
          <div className="card-content p-4">
            <p className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>📈 Investment ROI</p>
            <p className="text-3xl font-bold text-purple-500">{roi.toFixed(0)}%</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>0%</span>
              <div className={`flex-1 h-2 rounded overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-full bg-purple-500 rounded" style={{ width: `${Math.min(roi / 5, 100)}%` }}></div>
              </div>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>500%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row - Waterfall + Scenario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked Waterfall Chart */}
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Financial Impact Breakdown</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>From potential revenue to net outcome</p>
          </div>
          <div className="card-content p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={waterfallData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
                <XAxis type="number" stroke={chartColors.text} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="name" stroke={chartColors.text} width={100} />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(v) => formatFullCurrency(Math.abs(v))}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <InsightDropdown
              title="Understanding Financial Impact Breakdown"
              interpretation="This waterfall chart traces the journey from base revenue through costs and savings to net impact. Blue shows starting revenue, red shows losses from churn, orange represents replacement costs, green displays ML-driven savings, and purple is the final net outcome."
              insights={[
                "Start from Base Revenue (total potential) and subtract red/orange losses to see true churn cost",
                "The green ML Savings bar shows how much predictive intervention recovers",
                "Net Impact = Base Revenue - Lost Revenue - Replacement Cost + ML Savings",
                "A larger green bar relative to red indicates effective retention strategies",
                "Compare Net Impact to Base Revenue to gauge overall business health"
              ]}
            />
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🎯 Scenario Analysis</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Compare different retention strategies</p>
          </div>
          <div className="card-content p-4">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="scenario" stroke={chartColors.text} />
                <YAxis yAxisId="left" stroke={chartColors.text} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(v, name) => name === 'retained' ? [v.toLocaleString(), 'Customers Saved'] : [formatFullCurrency(v), name]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="cost" fill="#ef4444" fillOpacity={0.7} name="Total Cost" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="savings" fill="#10b981" name="Savings" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="retained" stroke="#3b82f6" strokeWidth={3} name="Customers Retained" dot={{ r: 6, fill: '#3b82f6' }} />
              </ComposedChart>
            </ResponsiveContainer>
            <InsightDropdown
              title="Understanding Scenario Analysis"
              interpretation="This chart compares four retention strategy scenarios: No ML (baseline), Current ML implementation, Optimized ML, and Ideal outcomes. Red bars show total costs, green bars show savings, and the blue line tracks customers retained."
              insights={[
                "'No ML' scenario is your baseline - shows full churn impact without intervention",
                "Cost bars should decrease and savings bars increase as strategies improve",
                "The blue line (Customers Retained) indicates intervention effectiveness",
                "Optimized scenario targets 50% retention vs Current's 35% - a 43% improvement",
                "Use this to justify ML investment by showing the gap between scenarios"
              ]}
            />
          </div>
        </div>
      </div>

      {/* Monthly Trend with Breakeven Line */}
      <div className="card glow-effect">
        <div className="card-header p-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📈 Monthly Financial Trend</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Tracking cost vs savings over time (values in $K)</p>
        </div>
        <div className="card-content p-4">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="month" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} tickFormatter={(v) => `$${v}K`} />
              <Tooltip 
                contentStyle={tooltipStyle} 
                formatter={(v) => [`$${Math.abs(v)}K`, '']}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
              <Bar dataKey="churnCost" fill="#ef4444" fillOpacity={0.7} name="Churn Cost" stackId="a" />
              <Bar dataKey="savings" fill="#10b981" name="ML Savings" stackId="b" />
              <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={2} name="Cumulative Impact" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <InsightDropdown
            title="Understanding Monthly Financial Trend"
            interpretation="This time-series chart tracks monthly churn costs (red bars), ML-driven savings (green bars), and cumulative financial impact (purple line). The dashed reference line at zero represents breakeven point."
            insights={[
              "Red bars (Churn Cost) should trend downward over time as ML improves predictions",
              "Green bars (ML Savings) should grow as retention strategies become more effective",
              "The purple cumulative line shows running total - closer to zero is better",
              "When green bars exceed red bars, you've achieved positive monthly ROI",
              "Notice the inflection point where cumulative losses start recovering (around Oct-Nov)"
            ]}
          />
        </div>
      </div>

      {/* Intervention ROI Chart + Segment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intervention ROI Bubble */}
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>💡 Intervention ROI Analysis</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Cost vs success rate for different strategies</p>
          </div>
          <div className="card-content p-4">
            <div className="space-y-4">
              {interventionROI.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`w-32 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.type}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Success: {item.successRate}%</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>|</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Cost: ${item.cost}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>|</span>
                      <span className="text-xs text-green-500 font-bold">ROI: {item.roi}%</span>
                    </div>
                    <div className="h-6 bg-gray-700 rounded overflow-hidden flex">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-end pr-2"
                        style={{ width: `${item.successRate}%` }}
                      >
                        <span className="text-xs text-white">{item.successRate}%</span>
                      </div>
                      <div 
                        className="h-full bg-gradient-to-r from-green-600 to-green-400 flex items-center justify-center"
                        style={{ width: `${Math.min(item.roi / 10, 60)}%` }}
                      >
                        <span className="text-xs text-white">{item.roi}%</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${item.effort === 'Low' ? 'bg-green-500/20 text-green-400' : item.effort === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    {item.effort}
                  </span>
                </div>
              ))}
            </div>
            <p className={`text-sm mt-4 pt-4 border-t ${isDark ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>
              💡 <span className="text-yellow-500">Best ROI:</span> Email campaigns ($520 return per $100 spent) | 
              <span className="text-blue-500"> Best Success:</span> Account manager (65%)
            </p>
            <InsightDropdown
              title="Understanding Intervention ROI Analysis"
              interpretation="This visualization compares different customer retention strategies by their cost, success rate, and ROI. Blue progress shows success rate, green extension shows ROI, and color-coded effort badges indicate implementation difficulty."
              insights={[
                "Email campaigns have highest ROI (520%) due to low cost ($5) despite lower success rate",
                "Account Manager has highest success rate (65%) but lower ROI due to high cost ($120)",
                "Balance ROI vs Success Rate: high-value customers may warrant high-effort interventions",
                "Green 'Low Effort' badges indicate quick wins - start with these for immediate impact",
                "Personal Calls offer a middle ground: moderate cost with good success rate"
              ]}
            />
          </div>
        </div>

        {/* Segment Impact Visual */}
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🎯 Segment Prioritization Matrix</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Value × Risk analysis</p>
          </div>
          <div className="card-content p-4">
            <div className="space-y-6">
              {segmentImpact.map((seg, idx) => (
                <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: `${seg.color}15`, borderLeft: `4px solid ${seg.color}` }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{seg.segment}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{seg.customers.toLocaleString()} customers • ${seg.avgValue}/yr avg</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold`} style={{ backgroundColor: `${seg.color}30`, color: seg.color }}>
                      {seg.priority}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>At-Risk Customers</p>
                      <p className="text-xl font-bold" style={{ color: seg.color }}>{seg.atRisk.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Potential Loss</p>
                      <p className="text-xl font-bold text-red-500">{formatFullCurrency(seg.potentialLoss)}</p>
                    </div>
                  </div>
                  <div className={`mt-3 h-2 rounded overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full rounded" style={{ backgroundColor: seg.color, width: `${(seg.atRisk / seg.customers) * 100}%` }}></div>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{((seg.atRisk / seg.customers) * 100).toFixed(1)}% at risk</p>
                </div>
              ))}
            </div>
            <InsightDropdown
              title="Understanding Segment Prioritization Matrix"
              interpretation="This matrix segments customers by value tier (High/Medium/Low) and shows at-risk counts and potential losses. Color-coded priority badges (CRITICAL/HIGH/MEDIUM) indicate urgency level for intervention."
              insights={[
                "CRITICAL (High Value): Small count but highest per-customer loss - prioritize personal outreach",
                "HIGH (Medium Value): Largest potential loss pool - ideal for targeted campaigns",
                "MEDIUM (Low Value): High count but low per-customer value - use automated/low-cost retention",
                "Progress bars show % at risk within each segment - higher % needs urgent attention",
                "Focus resources proportionally: save 10 high-value customers > 100 low-value customers"
              ]}
            />
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="card glow-effect">
        <div className="card-header p-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🚀 Executive Action Plan</h3>
        </div>
        <div className="card-content p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-red-900/30 to-red-800/10 border-red-500/30' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
              <div className="text-2xl mb-2">🔥</div>
              <p className="text-red-500 font-semibold mb-2">Week 1: Crisis</p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Call 85 high-value at-risk customers. Est. save: $115K</p>
            </div>
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'}`}>
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-orange-500 font-semibold mb-2">Week 2-4: Campaign</p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email campaign to medium-value segment. Est. save: $180K</p>
            </div>
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
              <div className="text-2xl mb-2">📊</div>
              <p className="text-blue-500 font-semibold mb-2">Month 2: Optimize</p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>A/B test retention offers. Target: +10% success rate</p>
            </div>
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-500/30' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-green-500 font-semibold mb-2">Quarter 2: Scale</p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Automate ML predictions. Target: $500K annual savings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </StreamGate>
  )
}

export default BusinessImpactPage
