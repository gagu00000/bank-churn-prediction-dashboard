import React from 'react'
import { useTheme } from '../context/ThemeContext'
import StreamGate from '../components/StreamGate'
import AgeDistributionOverlay from '../components/charts/AgeDistributionOverlay'
import CustomerJourneySankey from '../components/charts/CustomerJourneySankey'
import TemporalChurnTrend from '../components/charts/TemporalChurnTrend'
import ActivityGauges from '../components/charts/ActivityGauges'
import CustomerLTVSunburst from '../components/charts/CustomerLTVSunburst'
import ChurnRateByGeography from '../components/charts/ChurnRateByGeography'

const OverviewPage = () => {
  const { isDark } = useTheme()

  return (
    <StreamGate pageName="Overview">
      <div className="space-y-6">
        <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Overview Analytics</h2>
        
        {/* Activity Gauges */}
        <ActivityGauges />

        {/* Geography Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChurnRateByGeography />
          <CustomerLTVSunburst />
        </div>

        {/* Distribution Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgeDistributionOverlay />
          <CustomerJourneySankey />
        </div>

        {/* Temporal Trend */}
        <TemporalChurnTrend />
      </div>
    </StreamGate>
  )
}

export default OverviewPage
