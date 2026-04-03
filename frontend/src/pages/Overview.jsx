import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { Users, UserX, TrendingDown, Activity } from 'lucide-react'
import { getApiUrl } from '../api'
import ChurnChart from '../components/ChurnChart'
import GeographyChart from '../components/GeographyChart'
import { useTheme } from '../context/ThemeContext'

// Import new chart components
import CustomerLTVSunburst from '../components/charts/CustomerLTVSunburst'
import ChurnRateByGeography from '../components/charts/ChurnRateByGeography'
import AgeDistributionOverlay from '../components/charts/AgeDistributionOverlay'
import CustomerJourneySankey from '../components/charts/CustomerJourneySankey'
import TemporalChurnTrend from '../components/charts/TemporalChurnTrend'
import ActivityGauges from '../components/charts/ActivityGauges'

const Overview = ({ stats }) => {
  const { isDark } = useTheme()
  const [churnAnalysis, setChurnAnalysis] = useState(null)
  const [advancedData, setAdvancedData] = useState(null)

  useEffect(() => {
    fetchChurnAnalysis()
    fetchAdvancedData()
  }, [])

  const fetchChurnAnalysis = async () => {
    try {
      const response = await fetch(getApiUrl('/api/churn-analysis'))
      if (response.ok) {
        const data = await response.json()
        setChurnAnalysis(data)
      }
    } catch (error) {
      console.error('Error fetching churn analysis:', error)
    }
  }

  const fetchAdvancedData = async () => {
    try {
      const response = await fetch(getApiUrl('/api/advanced-analytics'))
      if (response.ok) {
        const data = await response.json()
        setAdvancedData(data)
      }
    } catch (error) {
      console.error('Error fetching advanced data:', error)
    }
  }

  const MetricCard = ({ icon: Icon, title, value, suffix = '', color = 'primary', delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="metric-card glow-effect"
    >
      <div className={`inline-flex p-4 rounded-full bg-${color}-500/20 mb-4`}>
        <Icon className={`w-8 h-8 text-${color}-400`} />
      </div>
      <div className="metric-value">
        <CountUp
          end={value}
          duration={2}
          separator=","
          decimals={suffix === '%' ? 2 : 0}
          suffix={suffix}
        />
      </div>
      <div className="metric-label">{title}</div>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          title="Total Customers"
          value={stats.total_customers}
          color="primary"
          delay={0}
        />
        <MetricCard
          icon={UserX}
          title="Churned Customers"
          value={stats.churned_customers}
          color="danger"
          delay={0.1}
        />
        <MetricCard
          icon={TrendingDown}
          title="Churn Rate"
          value={stats.churn_rate}
          suffix="%"
          color="warning"
          delay={0.2}
        />
        <MetricCard
          icon={Activity}
          title="Avg Credit Score"
          value={stats.avg_credit_score}
          color="success"
          delay={0.3}
        />
      </div>

      {/* Chart 1: Customer Lifetime Value Sunburst */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="card-title">Customer Lifetime Value Segmentation</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Hierarchical view: Geography → Age Group → Product Count</p>
        </div>
        <div className="card-content">
          <CustomerLTVSunburst data={advancedData?.sunburst_data} />
        </div>
      </motion.div>

      {/* Charts 2 & 3: Churn Rate by Geography & Age Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="card-title">Churn Rate by Geography</h2>
          </div>
          <div className="card-content">
            <ChurnRateByGeography data={churnAnalysis?.by_geography} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="card-title">Age Distribution with Churn Overlay</h2>
          </div>
          <div className="card-content">
            <AgeDistributionOverlay data={advancedData?.age_distribution} />
          </div>
        </motion.div>
      </div>

      {/* Chart 4: Customer Journey Sankey Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="card-title">Customer Journey Flow</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Geography → Products → Active Status → Outcome</p>
        </div>
        <div className="card-content">
          <CustomerJourneySankey data={advancedData?.sankey_data} />
        </div>
      </motion.div>

      {/* Chart 5: Temporal Churn Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="card-title">Temporal Churn Trend</h2>
        </div>
        <div className="card-content">
          <TemporalChurnTrend data={advancedData?.temporal_data} />
        </div>
      </motion.div>

      {/* Chart 6: Activity Level Gauges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="card-title">Customer Health Metrics</h2>
        </div>
        <div className="card-content">
          <ActivityGauges 
            churnRisk={advancedData?.churn_risk_score || 0}
            activeMemberPercent={advancedData?.active_member_percent || 0}
            avgProducts={advancedData?.avg_products || 0}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default Overview
