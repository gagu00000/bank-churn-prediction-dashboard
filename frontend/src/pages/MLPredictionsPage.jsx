import React, { useState, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import InsightDropdown from '../components/InsightDropdown'
import { useTheme } from '../context/ThemeContext'
import { getApiUrl } from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import StreamGate from '../components/StreamGate'
import { useLiveData } from '../context/LiveDataContext'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const RISK_COLORS = { CRITICAL: '#dc2626', HIGH: '#f59e0b', MEDIUM: '#eab308', LOW: '#22c55e' }

const MLPredictionsPage = () => {
  const { isDark, chartColors } = useTheme()
  const { liveStats } = useLiveData()
  const fileInputRef = useRef(null)
  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f3f4f6' : '#1f2937'
  }
  const [customerInput, setCustomerInput] = useState({
    CreditScore: 650,
    Age: 35,
    Tenure: 5,
    Balance: 50000,
    NumOfProducts: 2,
    HasCrCard: 1,
    IsActiveMember: 1,
    EstimatedSalary: 75000,
    Geography: 'France',
    Gender: 'Male'
  })
  const [prediction, setPrediction] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [retentionPlan, setRetentionPlan] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const [batchResults, setBatchResults] = useState(null)
  const [batchUploading, setBatchUploading] = useState(false)

  const handlePredict = async () => {
    setPredicting(true)
    setExplanation(null)
    setRetentionPlan(null)
    try {
      // Use enhanced prediction endpoint with explanations
      const response = await fetch(getApiUrl('/api/predict-with-explanation'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerInput)
      })
      if (response.ok) {
        const result = await response.json()
        setPrediction(result.prediction)
        setExplanation(result.explanation)
        setRetentionPlan(result.retention_plan)
      }
    } catch (err) {
      console.error('Prediction error:', err)
      // Fallback to basic prediction
      try {
        const fallback = await fetch(getApiUrl('/api/predict'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerInput)
        })
        if (fallback.ok) {
          setPrediction(await fallback.json())
        }
      } catch (e) { console.error('Fallback failed:', e) }
    } finally {
      setPredicting(false)
    }
  }

  const handleBatchUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    setBatchUploading(true)
    setBatchResults(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(getApiUrl('/api/batch-predict'), {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const results = await response.json()
        setBatchResults(results)
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.detail}`)
      }
    } catch (err) {
      console.error('Batch upload error:', err)
      alert('Failed to process batch file')
    } finally {
      setBatchUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = async () => {
    window.open(getApiUrl('/api/batch-predict/template'), '_blank')
  }

  // Feature importance data (based on typical churn model importance)
  const featureImportance = [
    { feature: 'Age', importance: 0.18 },
    { feature: 'NumOfProducts', importance: 0.16 },
    { feature: 'IsActiveMember', importance: 0.14 },
    { feature: 'Geography', importance: 0.13 },
    { feature: 'Balance', importance: 0.12 },
    { feature: 'Gender', importance: 0.10 },
    { feature: 'CreditScore', importance: 0.08 },
    { feature: 'Tenure', importance: 0.05 },
    { feature: 'EstimatedSalary', importance: 0.04 }
  ]

  const radarData = [
    { factor: 'Age Risk', value: customerInput.Age > 45 ? 80 : 40 },
    { factor: 'Balance Risk', value: customerInput.Balance < 10000 ? 70 : 30 },
    { factor: 'Products', value: customerInput.NumOfProducts > 2 ? 90 : 20 },
    { factor: 'Activity', value: customerInput.IsActiveMember ? 20 : 80 },
    { factor: 'Credit', value: customerInput.CreditScore < 600 ? 75 : 25 },
    { factor: 'Tenure', value: customerInput.Tenure < 2 ? 60 : 30 }
  ]

  return (
    <div className="space-y-6">
      <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>ML Predictions</h2>
      
      {/* Prediction Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'single' 
              ? 'bg-blue-600 text-white' 
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔮 Single Prediction
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'batch' 
              ? 'bg-blue-600 text-white' 
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 Batch Upload
        </button>
      </div>

      {/* Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🎯 Feature Importance</h3>
          </div>
          <div className="card-content p-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis type="number" stroke={chartColors.text} domain={[0, 0.2]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" stroke={chartColors.text} width={100} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${(v*100).toFixed(1)}%`, 'Importance']}
                />
                <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <InsightDropdown 
              title="How to interpret this chart"
              interpretation="This horizontal bar chart shows which customer attributes have the most influence on the ML model's churn predictions. Longer bars indicate features that have more predictive power."
              insights={[
                "Age is the strongest predictor - older customers are more likely to churn",
                "Number of Products significantly impacts churn prediction",
                "Activity status is a key factor - inactive members churn more",
                "Features at the bottom (Salary, Tenure) have less predictive value"
              ]}
            />
          </div>
        </div>

        {/* Risk Radar */}
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Customer Risk Profile</h3>
          </div>
          <div className="card-content p-4">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={chartColors.grid} />
                <PolarAngleAxis dataKey="factor" stroke={chartColors.text} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={chartColors.text} />
                <Radar name="Risk" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
            <InsightDropdown 
              title="How to interpret this chart"
              interpretation="This radar chart visualizes the current customer's risk profile across 6 key dimensions. The larger the red area, the higher the overall churn risk. Each axis represents a different risk factor."
              insights={[
                "Points closer to the outer edge indicate higher risk in that dimension",
                "A 'spiky' profile shows concentrated risk in specific areas",
                "A large overall area suggests the customer needs immediate attention",
                "Use this to identify which specific factors put a customer at risk"
              ]}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'single' ? (
          <motion.div 
            key="single"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Customer Prediction Form */}
            <div className="card glow-effect">
              <div className="card-header p-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🔮 Predict Customer Churn</h3>
              </div>
              <div className="card-content p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Credit Score</label>
                    <input type="number" value={customerInput.CreditScore} onChange={(e) => setCustomerInput({...customerInput, CreditScore: parseInt(e.target.value)})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Age</label>
                    <input type="number" value={customerInput.Age} onChange={(e) => setCustomerInput({...customerInput, Age: parseInt(e.target.value)})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tenure (years)</label>
                    <input type="number" value={customerInput.Tenure} onChange={(e) => setCustomerInput({...customerInput, Tenure: parseInt(e.target.value)})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Balance</label>
                    <input type="number" value={customerInput.Balance} onChange={(e) => setCustomerInput({...customerInput, Balance: parseFloat(e.target.value)})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}># Products</label>
                    <input type="number" value={customerInput.NumOfProducts} onChange={(e) => setCustomerInput({...customerInput, NumOfProducts: parseInt(e.target.value)})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Geography</label>
                    <select value={customerInput.Geography} onChange={(e) => setCustomerInput({...customerInput, Geography: e.target.value})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`}>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Spain">Spain</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gender</label>
                    <select value={customerInput.Gender} onChange={(e) => setCustomerInput({...customerInput, Gender: e.target.value})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Member</label>
                    <select value={customerInput.IsActiveMember} onChange={(e) => setCustomerInput({...customerInput, IsActiveMember: parseInt(e.target.value)})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`}>
                      <option value={1}>Yes</option>
                      <option value={0}>No</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Has Credit Card</label>
                    <select value={customerInput.HasCrCard} onChange={(e) => setCustomerInput({...customerInput, HasCrCard: parseInt(e.target.value)})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`}>
                      <option value={1}>Yes</option>
                      <option value={0}>No</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Est. Salary</label>
                    <input type="number" value={customerInput.EstimatedSalary} onChange={(e) => setCustomerInput({...customerInput, EstimatedSalary: parseFloat(e.target.value)})} className={`w-full rounded px-3 py-2 mt-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`} />
                  </div>
                </div>
                <button onClick={handlePredict} disabled={predicting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50">
                  {predicting ? '🔄 Analyzing...' : '🔍 Predict with AI Explanation'}
                </button>
              </div>
            </div>
            
            {/* Prediction Results with Explanations */}
            {prediction && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Prediction Result */}
                <div className={`card glow-effect p-6 ${prediction.prediction === 1 ? (isDark ? 'border-red-500' : 'border-red-300') : (isDark ? 'border-green-500' : 'border-green-300')} border-2`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {prediction.prediction === 1 ? '⚠️ HIGH CHURN RISK' : '✅ LOW CHURN RISK'}
                      </p>
                      <p className={`mt-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Churn Probability: <span className="font-bold text-2xl" style={{ color: RISK_COLORS[prediction.risk_level] }}>{(prediction.churn_probability * 100).toFixed(1)}%</span>
                      </p>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Risk Level: <span className="font-bold text-lg" style={{ color: RISK_COLORS[prediction.risk_level] }}>{prediction.risk_level}</span>
                      </p>
                    </div>
                    <div className={`text-right p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Model Ensemble</p>
                      {Object.entries(prediction.model_probabilities || {}).map(([model, prob]) => (
                        <p key={model} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="font-medium">{model}:</span> {(prob * 100).toFixed(1)}%
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Explanation Section */}
                {explanation && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Risk Factors */}
                    <div className="card glow-effect">
                      <div className="card-header p-4 border-b border-gray-700">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🔴 Risk Factors</h3>
                      </div>
                      <div className="card-content p-4 space-y-3">
                        {explanation.risk_factors?.map((factor, idx) => (
                          <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                            <div className="flex justify-between items-center">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{factor.feature}</span>
                              <span className="text-red-500 font-bold">+{(factor.contribution * 100).toFixed(0)}%</span>
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{factor.reason}</p>
                          </div>
                        ))}
                        {(!explanation.risk_factors || explanation.risk_factors.length === 0) && (
                          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No significant risk factors identified</p>
                        )}
                      </div>
                    </div>

                    {/* Protective Factors */}
                    <div className="card glow-effect">
                      <div className="card-header p-4 border-b border-gray-700">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🟢 Protective Factors</h3>
                      </div>
                      <div className="card-content p-4 space-y-3">
                        {explanation.protective_factors?.map((factor, idx) => (
                          <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                            <div className="flex justify-between items-center">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{factor.feature}</span>
                              <span className="text-green-500 font-bold">-{(Math.abs(factor.contribution) * 100).toFixed(0)}%</span>
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{factor.reason}</p>
                          </div>
                        ))}
                        {(!explanation.protective_factors || explanation.protective_factors.length === 0) && (
                          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No protective factors identified</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Natural Language Explanation */}
                {explanation?.natural_language_explanation && (
                  <div className={`card glow-effect p-6 ${isDark ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>🤖 AI Analysis Summary</h3>
                    <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {explanation.natural_language_explanation}
                    </p>
                  </div>
                )}

                {/* Retention Recommendations */}
                {retentionPlan && (
                  <div className="card glow-effect">
                    <div className="card-header p-4 border-b border-gray-700">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        🎯 Recommended Retention Actions
                      </h3>
                    </div>
                    <div className="card-content p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Risk Tier</p>
                          <p className={`text-xl font-bold`} style={{ color: RISK_COLORS[retentionPlan.risk_tier] || '#f59e0b' }}>
                            {retentionPlan.risk_tier}
                          </p>
                        </div>
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Estimated LTV</p>
                          <p className={`text-xl font-bold text-green-500`}>
                            ${retentionPlan.estimated_ltv?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Intervention Priority</p>
                          <p className={`text-xl font-bold text-blue-500`}>
                            {retentionPlan.priority_score?.toFixed(0) || 'N/A'}/100
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {retentionPlan.actions?.map((action, idx) => (
                          <div key={idx} className={`p-4 rounded-lg border-l-4 ${isDark ? 'bg-gray-800' : 'bg-white border'}`} style={{ borderLeftColor: ['#3b82f6', '#10b981', '#f59e0b'][idx % 3] }}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{action.action}</h4>
                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  action.urgency === 'immediate' ? 'bg-red-500/20 text-red-400' :
                                  action.urgency === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {action.urgency || 'standard'}
                                </span>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  Est. Impact: {action.expected_impact || 'Medium'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="batch"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Batch Upload Section */}
            <div className="card glow-effect">
              <div className="card-header p-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Batch Prediction Upload</h3>
              </div>
              <div className="card-content p-6">
                <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isDark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="text-4xl mb-4">📁</div>
                  <p className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Upload a CSV file with customer data
                  </p>
                  <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Required columns: CreditScore, Age, Tenure, Balance, NumOfProducts, HasCrCard, IsActiveMember, EstimatedSalary, Geography, Gender
                  </p>
                  <div className="flex justify-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      onChange={handleBatchUpload}
                      className="hidden"
                      id="batch-upload"
                    />
                    <label
                      htmlFor="batch-upload"
                      className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors ${batchUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {batchUploading ? '🔄 Processing...' : '📤 Upload CSV File'}
                    </label>
                    <button
                      onClick={downloadTemplate}
                      className={`py-3 px-6 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                      📥 Download Template
                    </button>
                  </div>
                </div>

                {/* Batch Results */}
                {batchResults && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 space-y-4"
                  >
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Processed</p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{batchResults.total_processed}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>High Risk</p>
                        <p className="text-2xl font-bold text-red-500">{batchResults.high_risk_count}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Medium Risk</p>
                        <p className="text-2xl font-bold text-yellow-500">{batchResults.medium_risk_count}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Low Risk</p>
                        <p className="text-2xl font-bold text-green-500">{batchResults.low_risk_count}</p>
                      </div>
                    </div>

                    {/* Results Table */}
                    <div className={`overflow-x-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
                      <table className="w-full">
                        <thead className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Customer</th>
                            <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Age</th>
                            <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Geography</th>
                            <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Churn Prob</th>
                            <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Risk Level</th>
                            <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Priority Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchResults.results?.slice(0, 10).map((result, idx) => (
                            <tr key={idx} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>#{idx + 1}</td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{result.age}</td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{result.geography}</td>
                              <td className={`px-4 py-3 font-medium`} style={{ color: RISK_COLORS[result.risk_level] }}>
                                {(result.churn_probability * 100).toFixed(1)}%
                              </td>
                              <td className={`px-4 py-3`}>
                                <span className={`px-2 py-1 rounded text-xs font-medium`} style={{ backgroundColor: `${RISK_COLORS[result.risk_level]}20`, color: RISK_COLORS[result.risk_level] }}>
                                  {result.risk_level}
                                </span>
                              </td>
                              <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{result.priority_action}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {batchResults.results?.length > 10 && (
                        <div className={`px-4 py-3 text-center ${isDark ? 'text-gray-400 bg-gray-900' : 'text-gray-500 bg-gray-50'}`}>
                          Showing 10 of {batchResults.results.length} results
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MLPredictionsPage
