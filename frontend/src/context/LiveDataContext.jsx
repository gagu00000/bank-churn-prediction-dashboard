import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { getWsUrl } from '../api'

const LiveDataContext = createContext()

export const useLiveData = () => {
  const context = useContext(LiveDataContext)
  if (!context) {
    throw new Error('useLiveData must be used within a LiveDataProvider')
  }
  return context
}

const MAX_PREDICTIONS = 200
const MAX_HISTORY_POINTS = 60

export const LiveDataProvider = ({ children }) => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [predictions, setPredictions] = useState([])
  const [currentPrediction, setCurrentPrediction] = useState(null)
  const [streamStats, setStreamStats] = useState({
    total: 0, critical: 0, high: 0, medium: 0, low: 0,
    avgProbability: 0, peakProbability: 0, sessionStart: null
  })
  const [alerts, setAlerts] = useState([])
  const [probabilityHistory, setProbabilityHistory] = useState([])
  const [riskDistribution, setRiskDistribution] = useState([])

  // Detailed tracking for all pages
  const [geographyLive, setGeographyLive] = useState({})
  const [genderLive, setGenderLive] = useState({})
  const [ageLive, setAgeLive] = useState({})
  const [productLive, setProductLive] = useState({})
  const [activeMemberLive, setActiveMemberLive] = useState({})
  const [balanceLive, setBalanceLive] = useState({ total: 0, count: 0, min: Infinity, max: 0 })
  const [creditScoreLive, setCreditScoreLive] = useState({ total: 0, count: 0 })
  const [ageTotalLive, setAgeTotalLive] = useState({ total: 0, count: 0 })
  const [salaryLive, setSalaryLive] = useState({ total: 0, count: 0 })
  const [liveChurnCount, setLiveChurnCount] = useState(0)
  const [liveRetainedCount, setLiveRetainedCount] = useState(0)
  const [revenueAtRisk, setRevenueAtRisk] = useState(0)

  // Raw age arrays for histogram charts
  const [churnedAges, setChurnedAges] = useState([])
  const [retainedAges, setRetainedAges] = useState([])

  // Geography x Products cross-tabulation for sankey
  const [geoProductCross, setGeoProductCross] = useState({})

  // Temporal data per geography
  const [temporalByGeo, setTemporalByGeo] = useState({})

  // Tenure tracking
  const [tenureLive, setTenureLive] = useState({})

  const wsRef = useRef(null)
  const listenersRef = useRef(new Set())

  const addPredictionListener = useCallback((fn) => {
    listenersRef.current.add(fn)
    return () => listenersRef.current.delete(fn)
  }, [])

  const processNewPrediction = useCallback((data) => {
    setCurrentPrediction(data)
    listenersRef.current.forEach(fn => fn(data))
    setPredictions(prev => [data, ...prev].slice(0, MAX_PREDICTIONS))

    const riskLevel = data.prediction?.risk_level || 'LOW'
    const prob = data.prediction?.churn_probability || 0
    const isChurn = prob >= 0.5
    const customer = data.customer || {}

    if (isChurn) {
      setLiveChurnCount(prev => prev + 1)
      setRevenueAtRisk(prev => prev + (customer.Balance || 0) * 0.1)
    } else {
      setLiveRetainedCount(prev => prev + 1)
    }

    setStreamStats(prev => {
      const newTotal = prev.total + 1
      const newAvg = ((prev.avgProbability * prev.total) + prob) / newTotal
      return {
        ...prev, total: newTotal,
        critical: riskLevel === 'CRITICAL' ? prev.critical + 1 : prev.critical,
        high: riskLevel === 'HIGH' ? prev.high + 1 : prev.high,
        medium: riskLevel === 'MEDIUM' ? prev.medium + 1 : prev.medium,
        low: riskLevel === 'LOW' ? prev.low + 1 : prev.low,
        avgProbability: newAvg,
        peakProbability: Math.max(prev.peakProbability, prob)
      }
    })

    setProbabilityHistory(prev => {
      const pt = { time: new Date().toLocaleTimeString(), probability: (prob * 100).toFixed(1), timestamp: Date.now() }
      return [...prev, pt].slice(-MAX_HISTORY_POINTS)
    })

    setRiskDistribution(prev => {
      const existing = prev.find(r => r.name === riskLevel)
      if (existing) return prev.map(r => r.name === riskLevel ? { ...r, value: r.value + 1 } : r)
      return [...prev, { name: riskLevel, value: 1 }]
    })

    if (customer.Geography) {
      setGeographyLive(prev => ({
        ...prev,
        [customer.Geography]: {
          total: (prev[customer.Geography]?.total || 0) + 1,
          churned: (prev[customer.Geography]?.churned || 0) + (isChurn ? 1 : 0)
        }
      }))
    }

    if (customer.Gender) {
      setGenderLive(prev => ({
        ...prev,
        [customer.Gender]: {
          total: (prev[customer.Gender]?.total || 0) + 1,
          churned: (prev[customer.Gender]?.churned || 0) + (isChurn ? 1 : 0)
        }
      }))
    }

    if (customer.Age) {
      const ageGroup = customer.Age <= 30 ? '0-30' : customer.Age <= 40 ? '31-40' : customer.Age <= 50 ? '41-50' : '51+'
      setAgeLive(prev => ({
        ...prev,
        [ageGroup]: {
          total: (prev[ageGroup]?.total || 0) + 1,
          churned: (prev[ageGroup]?.churned || 0) + (isChurn ? 1 : 0)
        }
      }))
      if (isChurn) setChurnedAges(prev => [...prev, customer.Age])
      else setRetainedAges(prev => [...prev, customer.Age])
      setAgeTotalLive(prev => ({ total: prev.total + customer.Age, count: prev.count + 1 }))
    }

    if (customer.NumOfProducts) {
      const key = String(customer.NumOfProducts)
      setProductLive(prev => ({
        ...prev,
        [key]: { total: (prev[key]?.total || 0) + 1, churned: (prev[key]?.churned || 0) + (isChurn ? 1 : 0) }
      }))
    }

    if (customer.IsActiveMember !== undefined) {
      const key = String(customer.IsActiveMember)
      setActiveMemberLive(prev => ({
        ...prev,
        [key]: { total: (prev[key]?.total || 0) + 1, churned: (prev[key]?.churned || 0) + (isChurn ? 1 : 0) }
      }))
    }

    if (customer.Balance !== undefined) {
      setBalanceLive(prev => ({
        total: prev.total + customer.Balance, count: prev.count + 1,
        min: Math.min(prev.min === Infinity ? customer.Balance : prev.min, customer.Balance),
        max: Math.max(prev.max, customer.Balance)
      }))
    }

    if (customer.CreditScore) {
      setCreditScoreLive(prev => ({ total: prev.total + customer.CreditScore, count: prev.count + 1 }))
    }

    if (customer.EstimatedSalary) {
      setSalaryLive(prev => ({ total: prev.total + customer.EstimatedSalary, count: prev.count + 1 }))
    }

    if (customer.Geography && customer.NumOfProducts) {
      const crossKey = `${customer.Geography} \u2192 ${customer.NumOfProducts} Product${customer.NumOfProducts > 1 ? 's' : ''}`
      setGeoProductCross(prev => ({
        ...prev,
        [crossKey]: { value: (prev[crossKey]?.value || 0) + 1, geo: customer.Geography }
      }))
    }

    if (customer.Geography) {
      const minuteKey = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setTemporalByGeo(prev => {
        const geo = customer.Geography
        const geoData = prev[geo] || {}
        const minute = geoData[minuteKey] || { total: 0, churned: 0 }
        return { ...prev, [geo]: { ...geoData, [minuteKey]: { total: minute.total + 1, churned: minute.churned + (isChurn ? 1 : 0) } } }
      })
    }

    if (customer.Tenure !== undefined) {
      const tenureGroup = customer.Tenure <= 2 ? '0-2 years' : customer.Tenure <= 5 ? '3-5 years' : customer.Tenure <= 8 ? '6-8 years' : '9-10 years'
      setTenureLive(prev => ({
        ...prev,
        [tenureGroup]: { total: (prev[tenureGroup]?.total || 0) + 1, churned: (prev[tenureGroup]?.churned || 0) + (isChurn ? 1 : 0) }
      }))
    }
  }, [])

  // ========== Derived: stats shape ==========
  const liveStats = useMemo(() => {
    if (streamStats.total === 0) return null
    const geoD = {}, genD = {}, prodD = {}
    Object.entries(geographyLive).forEach(([k, v]) => { geoD[k] = v.total })
    Object.entries(genderLive).forEach(([k, v]) => { genD[k] = v.total })
    Object.entries(productLive).forEach(([k, v]) => { prodD[k] = v.total })
    return {
      total_customers: streamStats.total,
      churned_customers: liveChurnCount,
      churn_rate: (liveChurnCount / streamStats.total * 100),
      avg_age: ageTotalLive.count > 0 ? ageTotalLive.total / ageTotalLive.count : 0,
      avg_balance: balanceLive.count > 0 ? balanceLive.total / balanceLive.count : 0,
      avg_credit_score: creditScoreLive.count > 0 ? creditScoreLive.total / creditScoreLive.count : 0,
      geography_distribution: geoD,
      gender_distribution: genD,
      products_distribution: prodD
    }
  }, [streamStats.total, liveChurnCount, geographyLive, genderLive, productLive, ageTotalLive, balanceLive, creditScoreLive])

  // ========== Derived: churn-analysis shape ==========
  const liveChurnAnalysis = useMemo(() => {
    if (streamStats.total === 0) return null
    const build = (data) => {
      const sum = {}, count = {}, mean = {}
      Object.entries(data).forEach(([k, v]) => { sum[k] = v.churned; count[k] = v.total; mean[k] = v.total > 0 ? v.churned / v.total : 0 })
      return { sum, count, mean }
    }
    return {
      by_geography: build(geographyLive),
      by_gender: build(genderLive),
      by_age_group: Object.fromEntries(Object.entries(ageLive).map(([k, v]) => [k, v.total > 0 ? v.churned / v.total : 0])),
      by_products: build(productLive),
      by_active_member: build(activeMemberLive)
    }
  }, [streamStats.total, geographyLive, genderLive, ageLive, productLive, activeMemberLive])

  // ========== Derived: advanced analytics ==========
  const liveAdvancedData = useMemo(() => {
    if (streamStats.total === 0) return null
    const age_distribution = { churned_ages: churnedAges, retained_ages: retainedAges }
    const sankeyEntries = Object.entries(geoProductCross).sort((a, b) => b[1].value - a[1].value)
    const sankey_data = { flows: sankeyEntries.map(([key, val]) => ({ flow: key, value: val.value, geo: val.geo })) }
    const geos = Object.keys(temporalByGeo)
    const allTimes = new Set()
    geos.forEach(g => Object.keys(temporalByGeo[g]).forEach(t => allTimes.add(t)))
    const sortedTimes = Array.from(allTimes).sort()
    const temporal_data = {
      series: geos.map(g => ({
        name: g, dates: sortedTimes,
        values: sortedTimes.map(t => { const d = temporalByGeo[g]?.[t]; return d && d.total > 0 ? ((d.churned / d.total) * 100).toFixed(1) : '0' }),
        color: g === 'France' ? 'rgba(16,185,129,0.6)' : g === 'Germany' ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.6)'
      }))
    }
    return { age_distribution, sankey_data, temporal_data }
  }, [streamStats.total, churnedAges, retainedAges, geoProductCross, temporalByGeo])

  // ========== Derived: retention ==========
  const liveRetentionData = useMemo(() => {
    if (streamStats.total === 0) return null
    const avgBal = balanceLive.count > 0 ? balanceLive.total / balanceLive.count : 0
    return {
      summary: {
        total_customers: streamStats.total, at_risk_customers: liveChurnCount,
        churn_rate: (liveChurnCount / streamStats.total * 100), revenue_at_risk: revenueAtRisk,
        potential_savings: revenueAtRisk * 0.35, avg_customer_ltv: avgBal * 3
      },
      priority_actions: [
        `${streamStats.critical} critical-risk customers need immediate attention`,
        `${streamStats.high} high-risk customers should be contacted within 48 hours`,
        'Focus retention on Germany \u2014 highest churn rate in live stream'
      ],
      recommended_interventions: [
        { type: 'Personalized Offers', target_segment: 'Critical Risk', roi: 3.2, target_count: streamStats.critical, expected_saves: Math.round(streamStats.critical * 0.35), revenue_impact: streamStats.critical * avgBal * 0.1, cost: streamStats.critical * 75 },
        { type: 'Loyalty Program', target_segment: 'High Risk', roi: 2.8, target_count: streamStats.high, expected_saves: Math.round(streamStats.high * 0.30), revenue_impact: streamStats.high * avgBal * 0.08, cost: streamStats.high * 50 },
        { type: 'Service Upgrade', target_segment: 'Medium Risk', roi: 2.1, target_count: streamStats.medium, expected_saves: Math.round(streamStats.medium * 0.25), revenue_impact: streamStats.medium * avgBal * 0.05, cost: streamStats.medium * 30 }
      ]
    }
  }, [streamStats, liveChurnCount, revenueAtRisk, balanceLive])

  const liveCohortData = useMemo(() => {
    if (streamStats.total === 0) return null
    const tenureCohorts = Object.entries(tenureLive).map(([cohort, d]) => ({ cohort, churn_rate: d.total > 0 ? (d.churned / d.total * 100) : 0 }))
    const calcRate = (arr) => { if (!arr.length) return 0; return arr.filter(p => p.prediction?.churn_probability >= 0.5).length / arr.length * 100 }
    const valueCohorts = [
      { cohort: 'Zero Balance', churn_rate: calcRate(predictions.filter(p => (p.customer?.Balance || 0) === 0)) },
      { cohort: 'Low (<50K)', churn_rate: calcRate(predictions.filter(p => { const b = p.customer?.Balance || 0; return b > 0 && b < 50000 })) },
      { cohort: 'Medium (50-120K)', churn_rate: calcRate(predictions.filter(p => { const b = p.customer?.Balance || 0; return b >= 50000 && b < 120000 })) },
      { cohort: 'High (>120K)', churn_rate: calcRate(predictions.filter(p => (p.customer?.Balance || 0) >= 120000)) }
    ]
    const ageCohorts = Object.entries(ageLive).map(([cohort, d]) => ({ cohort, churn_rate: d.total > 0 ? (d.churned / d.total * 100) : 0 }))
    return { tenure_cohorts: tenureCohorts, value_cohorts: valueCohorts, age_cohorts: ageCohorts, insights: [`${streamStats.total} customers processed`, `Churn rate: ${(liveChurnCount / streamStats.total * 100).toFixed(1)}%`] }
  }, [streamStats.total, tenureLive, ageLive, predictions, liveChurnCount])

  // ========== WebSocket ==========
  const connectWebSocket = useCallback(() => {
    const wsUrl = getWsUrl()
    wsRef.current = new WebSocket(wsUrl)
    wsRef.current.onopen = () => { wsRef.current.send(JSON.stringify({ action: 'start_stream' })); setStreamStats(prev => ({ ...prev, sessionStart: new Date() })) }
    wsRef.current.onmessage = (event) => { processNewPrediction(JSON.parse(event.data)) }
    wsRef.current.onerror = () => { addAlert('Connection error', 'error') }
    wsRef.current.onclose = () => { setIsStreaming(false); addAlert('Stream disconnected', 'info') }
  }, [processNewPrediction])

  const addAlert = useCallback((message, type) => {
    setAlerts(prev => [{ id: Date.now(), message, type, timestamp: new Date() }, ...prev].slice(0, 30))
  }, [])

  const startStream = useCallback(() => { if (!isStreaming) { connectWebSocket(); setIsStreaming(true) } }, [isStreaming, connectWebSocket])
  const stopStream = useCallback(() => { if (wsRef.current) wsRef.current.close(); setIsStreaming(false) }, [])
  const toggleStream = useCallback(() => { if (isStreaming) stopStream(); else startStream() }, [isStreaming, startStream, stopStream])

  const clearSession = useCallback(() => {
    setPredictions([]); setCurrentPrediction(null); setAlerts([]); setProbabilityHistory([]); setRiskDistribution([])
    setGeographyLive({}); setGenderLive({}); setAgeLive({}); setProductLive({}); setActiveMemberLive({})
    setBalanceLive({ total: 0, count: 0, min: Infinity, max: 0 }); setCreditScoreLive({ total: 0, count: 0 })
    setAgeTotalLive({ total: 0, count: 0 }); setSalaryLive({ total: 0, count: 0 })
    setLiveChurnCount(0); setLiveRetainedCount(0); setRevenueAtRisk(0)
    setChurnedAges([]); setRetainedAges([]); setGeoProductCross({}); setTemporalByGeo({}); setTenureLive({})
    setStreamStats({ total: 0, critical: 0, high: 0, medium: 0, low: 0, avgProbability: 0, peakProbability: 0, sessionStart: null })
  }, [])

  useEffect(() => { return () => { if (wsRef.current) wsRef.current.close() } }, [])

  const hasData = streamStats.total > 0

  const value = {
    isStreaming, startStream, stopStream, toggleStream, clearSession, addAlert, hasData,
    predictions, currentPrediction, streamStats, alerts, probabilityHistory, riskDistribution,
    geographyLive, genderLive, ageLive, productLive, activeMemberLive,
    balanceLive, creditScoreLive, ageTotalLive, salaryLive,
    liveChurnCount, liveRetainedCount, revenueAtRisk,
    churnedAges, retainedAges, geoProductCross, temporalByGeo, tenureLive,
    liveStats, liveChurnAnalysis, liveAdvancedData, liveRetentionData, liveCohortData,
    addPredictionListener
  }

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>
}

export default LiveDataContext
