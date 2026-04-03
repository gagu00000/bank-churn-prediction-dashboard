import React from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { Users, UserX, TrendingDown, Activity, MapPin } from 'lucide-react'
import ChurnChart from './ChurnChart'
import GeographyChart from './GeographyChart'
import InsightDropdown from './InsightDropdown'
import { useTheme } from '../context/ThemeContext'
import { useLiveData } from '../context/LiveDataContext'
import StreamGate from './StreamGate'

const Dashboard = () => {
  const { isDark } = useTheme()
  const { liveStats } = useLiveData()

  const MetricCard = ({ icon: Icon, title, value, suffix = '', type = 'default', delay = 0 }) => {
    const typeStyles = {
      default: {
        iconBg: isDark ? 'bg-primary-500/20' : 'bg-primary-100',
        iconColor: 'text-primary-400',
        valueClass: 'text-gradient',
      },
      churn: {
        iconBg: isDark ? 'bg-rose-500/20' : 'bg-rose-100',
        iconColor: 'text-rose-400',
        valueClass: 'text-gradient-churn',
      },
      retention: {
        iconBg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
        iconColor: 'text-emerald-400',
        valueClass: 'text-gradient-retention',
      },
      warning: {
        iconBg: isDark ? 'bg-amber-500/20' : 'bg-amber-100',
        iconColor: 'text-amber-400',
        valueClass: 'text-amber-400',
      },
      info: {
        iconBg: isDark ? 'bg-cyan-500/20' : 'bg-cyan-100',
        iconColor: 'text-cyan-400',
        valueClass: 'text-cyan-400',
      }
    }
    const style = typeStyles[type] || typeStyles.default
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
          isDark ? 'bg-surface-900/80 border border-surface-800 hover:border-primary-500/30' 
                 : 'bg-white border border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-lg'
        }`}
      >
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          type === 'churn' ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
          type === 'retention' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
          type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
          type === 'info' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' :
          'bg-gradient-to-r from-primary-500 to-primary-400'
        }`} />
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${style.iconBg}`}>
            <Icon className={`w-6 h-6 ${style.iconColor}`} />
          </div>
        </div>
        <div className={`text-3xl font-bold mb-1 ${style.valueClass}`}>
          <CountUp end={value} duration={2} separator="," decimals={suffix === '%' ? 2 : 0} suffix={suffix} />
        </div>
        <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</div>
      </motion.div>
    )
  }

  const stats = liveStats

  return (
    <StreamGate pageName="the Dashboard">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard icon={Users} title="Total Customers" value={stats?.total_customers || 0} type="default" delay={0} />
          <MetricCard icon={UserX} title="Churned Customers" value={stats?.churned_customers || 0} type="churn" delay={0.1} />
          <MetricCard icon={TrendingDown} title="Churn Rate" value={stats?.churn_rate || 0} suffix="%" type="warning" delay={0.2} />
          <MetricCard icon={Activity} title="Avg Credit Score" value={stats?.avg_credit_score || 0} type="retention" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { val: stats?.avg_age || 0, label: 'Average Age', cls: 'text-gradient', dec: 1 },
            { val: stats?.avg_balance || 0, label: 'Average Balance', cls: 'text-gradient-retention', prefix: '$', dec: 0 },
            { val: stats?.avg_credit_score || 0, label: 'Credit Score', cls: 'text-cyan-400', dec: 0 }
          ].map((m, i) => (
            <motion.div key={m.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className={`rounded-2xl p-6 text-center transition-all duration-300 ${
                isDark ? 'bg-surface-900/80 border border-surface-800' : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              <div className={`text-3xl font-bold ${m.cls} mb-2`}>
                {m.prefix || ''}<CountUp end={m.val} duration={2} separator="," decimals={m.dec} />
              </div>
              <div className={`text-sm uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{m.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
            className={`rounded-2xl transition-all duration-300 ${isDark ? 'bg-surface-900/80 border border-surface-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-surface-800' : 'border-gray-100'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Churn Distribution</h2>
            </div>
            <div className="p-6">
              <ChurnChart data={stats} />
              <InsightDropdown title="Understanding Churn Distribution"
                interpretation="This pie chart shows the split between active and churned customers from live stream data."
                insights={["Data populates in real-time as customer predictions stream in","Red slice growing indicates increasing churn predictions"]} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }}
            className={`rounded-2xl transition-all duration-300 ${isDark ? 'bg-surface-900/80 border border-surface-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-surface-800' : 'border-gray-100'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Geography Distribution</h2>
            </div>
            <div className="p-6">
              <GeographyChart data={stats?.geography_distribution || {}} />
              <InsightDropdown title="Understanding Geography Distribution"
                interpretation="This bar chart shows customer count by geographic region from live stream data."
                insights={["Bars grow in real-time as new customer predictions arrive","Taller bars indicate more customers processed from that region"]} />
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-2xl transition-all duration-300 ${isDark ? 'bg-surface-900/80 border border-surface-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className={`flex items-center gap-2 p-6 border-b ${isDark ? 'border-surface-800' : 'border-gray-100'}`}>
              <MapPin className="w-5 h-5 text-primary-400" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>By Geography</h3>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(stats?.geography_distribution || {}).map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{country}</span>
                  <div className="flex items-center gap-3">
                    <div className={`w-40 rounded-full h-2 overflow-hidden ${isDark ? 'bg-surface-800' : 'bg-gray-200'}`}>
                      <div className="bg-gradient-to-r from-primary-500 to-primary-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(count / (stats?.total_customers || 1)) * 100}%` }}></div>
                    </div>
                    <span className={`text-sm font-bold w-16 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`rounded-2xl transition-all duration-300 ${isDark ? 'bg-surface-900/80 border border-surface-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className={`flex items-center gap-2 p-6 border-b ${isDark ? 'border-surface-800' : 'border-gray-100'}`}>
              <Users className="w-5 h-5 text-emerald-400" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>By Gender</h3>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(stats?.gender_distribution || {}).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{gender}</span>
                  <div className="flex items-center gap-3">
                    <div className={`w-40 rounded-full h-2 overflow-hidden ${isDark ? 'bg-surface-800' : 'bg-gray-200'}`}>
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(count / (stats?.total_customers || 1)) * 100}%` }}></div>
                    </div>
                    <span className={`text-sm font-bold w-16 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </StreamGate>
  )
}

export default Dashboard
