import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area, ComposedChart, Cell, ReferenceLine } from 'recharts'
import InsightDropdown from '../components/InsightDropdown'
import { useTheme } from '../context/ThemeContext'
import StreamGate from '../components/StreamGate'

const ModelPerformancePage = () => {
  const { isDark, chartColors } = useTheme()
  const [selectedModel, setSelectedModel] = useState('Ensemble')

  // Model performance metrics (based on training results)
  const modelMetrics = [
    { model: 'Random Forest', accuracy: 0.862, precision: 0.78, recall: 0.52, f1: 0.62, auc: 0.88, color: '#3b82f6' },
    { model: 'XGBoost', accuracy: 0.858, precision: 0.74, recall: 0.55, f1: 0.63, auc: 0.87, color: '#10b981' },
    { model: 'Ensemble', accuracy: 0.865, precision: 0.76, recall: 0.54, f1: 0.63, auc: 0.89, color: '#8b5cf6' }
  ]

  // Radar chart data for model comparison
  const radarData = [
    { metric: 'Accuracy', 'Random Forest': 86.2, 'XGBoost': 85.8, 'Ensemble': 86.5 },
    { metric: 'Precision', 'Random Forest': 78, 'XGBoost': 74, 'Ensemble': 76 },
    { metric: 'Recall', 'Random Forest': 52, 'XGBoost': 55, 'Ensemble': 54 },
    { metric: 'F1 Score', 'Random Forest': 62, 'XGBoost': 63, 'Ensemble': 63 },
    { metric: 'AUC-ROC', 'Random Forest': 88, 'XGBoost': 87, 'Ensemble': 89 }
  ]

  // Confusion matrix data with heatmap intensity
  const confusionMatrix = {
    'Random Forest': { TP: 265, TN: 1460, FP: 75, FN: 200 },
    'XGBoost': { TP: 280, TN: 1435, FP: 100, FN: 185 },
    'Ensemble': { TP: 275, TN: 1450, FP: 85, FN: 190 }
  }

  // Heatmap data for confusion matrix
  const getHeatmapData = (model) => {
    const cm = confusionMatrix[model]
    const total = cm.TP + cm.TN + cm.FP + cm.FN
    return [
      { name: 'True Negative', value: cm.TN, percent: (cm.TN/total*100).toFixed(1), color: '#22c55e', x: 0, y: 0 },
      { name: 'False Positive', value: cm.FP, percent: (cm.FP/total*100).toFixed(1), color: '#f97316', x: 1, y: 0 },
      { name: 'False Negative', value: cm.FN, percent: (cm.FN/total*100).toFixed(1), color: '#ef4444', x: 0, y: 1 },
      { name: 'True Positive', value: cm.TP, percent: (cm.TP/total*100).toFixed(1), color: '#3b82f6', x: 1, y: 1 }
    ]
  }

  // ROC curves for multiple models
  const rocCurve = [
    { fpr: 0, rf: 0, xgb: 0, ens: 0, random: 0 },
    { fpr: 0.05, rf: 0.35, xgb: 0.33, ens: 0.36, random: 0.05 },
    { fpr: 0.10, rf: 0.52, xgb: 0.50, ens: 0.53, random: 0.10 },
    { fpr: 0.15, rf: 0.62, xgb: 0.60, ens: 0.63, random: 0.15 },
    { fpr: 0.20, rf: 0.70, xgb: 0.68, ens: 0.71, random: 0.20 },
    { fpr: 0.30, rf: 0.78, xgb: 0.76, ens: 0.79, random: 0.30 },
    { fpr: 0.40, rf: 0.84, xgb: 0.82, ens: 0.85, random: 0.40 },
    { fpr: 0.50, rf: 0.88, xgb: 0.86, ens: 0.89, random: 0.50 },
    { fpr: 0.60, rf: 0.91, xgb: 0.89, ens: 0.92, random: 0.60 },
    { fpr: 0.70, rf: 0.94, xgb: 0.92, ens: 0.94, random: 0.70 },
    { fpr: 0.80, rf: 0.96, xgb: 0.95, ens: 0.96, random: 0.80 },
    { fpr: 0.90, rf: 0.98, xgb: 0.97, ens: 0.98, random: 0.90 },
    { fpr: 1.0, rf: 1.0, xgb: 1.0, ens: 1.0, random: 1.0 }
  ]

  // Threshold analysis with optimal point
  const thresholdAnalysis = [
    { threshold: 0.3, precision: 0.45, recall: 0.85, f1: 0.59, costSavings: 42 },
    { threshold: 0.4, precision: 0.55, recall: 0.72, f1: 0.62, costSavings: 58 },
    { threshold: 0.5, precision: 0.76, recall: 0.54, f1: 0.63, costSavings: 65 },
    { threshold: 0.6, precision: 0.82, recall: 0.42, f1: 0.56, costSavings: 52 },
    { threshold: 0.7, precision: 0.88, recall: 0.30, f1: 0.45, costSavings: 38 },
    { threshold: 0.8, precision: 0.92, recall: 0.18, f1: 0.30, costSavings: 22 }
  ]

  // Bullet chart data for model comparison
  const bulletData = modelMetrics.map(m => ({
    ...m,
    accuracyPct: m.accuracy * 100,
    target: 85,
    ranges: [70, 80, 90]
  }))

  const currentMatrix = confusionMatrix[selectedModel]

  // Theme-aware tooltip style
  const tooltipStyle = { 
    backgroundColor: chartColors.tooltip.bg, 
    border: `1px solid ${chartColors.tooltip.border}`, 
    borderRadius: '8px',
    color: chartColors.tooltip.text 
  }

  return (
    <StreamGate pageName="Model Performance">
    <div className="space-y-6">
      <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Model Performance</h2>
      
      {/* Model Status Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {modelMetrics.map((model, idx) => (
          <div 
            key={idx}
            className={`card cursor-pointer transition-all duration-300 ${selectedModel === model.model ? 'ring-2 ring-blue-500 glow-effect' : isDark ? 'hover:ring-1 hover:ring-gray-500' : 'hover:ring-1 hover:ring-gray-300'}`}
            onClick={() => setSelectedModel(model.model)}
          >
            <div className="card-content p-4">
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{model.model}</p>
                {selectedModel === model.model && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Selected</span>}
              </div>
              <p className="text-3xl font-bold" style={{ color: model.color }}>{(model.accuracy * 100).toFixed(1)}%</p>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="text-green-500">P:{(model.precision * 100).toFixed(0)}%</span>
                <span className="text-yellow-500">R:{(model.recall * 100).toFixed(0)}%</span>
                <span className="text-purple-400">AUC:{model.auc}</span>
              </div>
            </div>
          </div>
        ))}
        <div className={`card glow-effect ${isDark ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30' : 'bg-gradient-to-br from-purple-100 to-purple-50'}`}>
          <div className="card-content p-4 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Recommendation</p>
            <p className="text-xl font-bold text-purple-500">Ensemble</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Best overall performance</p>
          </div>
        </div>
      </div>

      {/* Model Comparison - Radar Chart + Bullet Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Comparison Bar Chart */}
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🎯 Model Comparison</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Multi-dimensional performance view</p>
          </div>
          <div className="card-content p-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={radarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis type="number" domain={[0, 100]} stroke={chartColors.text} />
                <YAxis dataKey="metric" type="category" stroke={chartColors.text} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="Random Forest" fill="#3b82f6" />
                <Bar dataKey="XGBoost" fill="#10b981" />
                <Bar dataKey="Ensemble" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <InsightDropdown 
              title="How to interpret this chart"
              interpretation="This bar chart compares three ML models across 5 performance metrics. Each colored bar represents a model - longer bars indicate better performance on that metric."
              insights={[
                "Accuracy: How often the model is correct overall",
                "Precision: When the model predicts churn, how often is it right",
                "Recall: Of actual churners, how many did the model catch",
                "F1 Score: Balance between precision and recall",
                "AUC-ROC: Model's ability to distinguish between classes"
              ]}
            />
          </div>
        </div>

        {/* ROC Curve - Multi-model */}
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📈 ROC Curves Comparison</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Area under curve comparison</p>
          </div>
          <div className="card-content p-4">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={rocCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="fpr" stroke={chartColors.text} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fill: chartColors.text }} />
                <YAxis stroke={chartColors.text} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: chartColors.text }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="rf" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} name="RF (0.88)" />
                <Area type="monotone" dataKey="xgb" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} name="XGB (0.87)" />
                <Area type="monotone" dataKey="ens" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={3} name="Ensemble (0.89)" />
                <Line type="linear" dataKey="random" stroke="#6b7280" strokeDasharray="5 5" name="Random" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <InsightDropdown 
              title="How to interpret this chart"
              interpretation="ROC (Receiver Operating Characteristic) curves show the trade-off between True Positive Rate and False Positive Rate. The dashed diagonal line represents random guessing. Better models have curves that bow toward the top-left corner."
              insights={[
                "The further the curve from the diagonal, the better the model",
                "AUC (Area Under Curve) closer to 1.0 is better (0.5 = random)",
                "All three models perform significantly better than random guessing",
                "Ensemble model (purple) has the largest area under curve"
              ]}
            />
          </div>
        </div>
      </div>

      {/* Interactive Confusion Matrix - Heatmap Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card glow-effect">
          <div className="card-header p-4 flex justify-between items-center">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🎯 Confusion Matrix Heatmap</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Model: {selectedModel}</p>
            </div>
            <div className="flex gap-2">
              {Object.keys(confusionMatrix).map(model => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`px-3 py-1 rounded text-xs transition-all ${selectedModel === model ? 'bg-blue-600 text-white' : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {model.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="card-content p-4">
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-3 gap-1">
                <div></div>
                <div className={`text-center text-sm pb-2 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Predicted: No Churn</div>
                <div className={`text-center text-sm pb-2 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Predicted: Churn</div>
                
                <div className={`text-right text-sm pr-3 flex items-center justify-end font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Actual: No Churn</div>
                <div className="w-32 h-24 rounded-lg flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-green-700 shadow-lg transform hover:scale-105 transition-transform">
                  <p className="text-3xl font-bold text-white">{currentMatrix.TN}</p>
                  <p className="text-xs text-green-200">True Negative</p>
                  <p className="text-xs text-green-300 mt-1">{((currentMatrix.TN/(currentMatrix.TN+currentMatrix.FP))*100).toFixed(1)}% Specificity</p>
                </div>
                <div className="w-32 h-24 rounded-lg flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg transform hover:scale-105 transition-transform">
                  <p className="text-3xl font-bold text-white">{currentMatrix.FP}</p>
                  <p className="text-xs text-orange-200">False Positive</p>
                  <p className="text-xs text-orange-300 mt-1">Type I Error</p>
                </div>
                
                <div className="text-right text-sm text-gray-400 pr-3 flex items-center justify-end font-medium">Actual: Churn</div>
                <div className="w-32 h-24 rounded-lg flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-red-600 shadow-lg transform hover:scale-105 transition-transform">
                  <p className="text-3xl font-bold text-white">{currentMatrix.FN}</p>
                  <p className="text-xs text-red-200">False Negative</p>
                  <p className="text-xs text-red-300 mt-1">Type II Error ⚠️</p>
                </div>
                <div className="w-32 h-24 rounded-lg flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transform hover:scale-105 transition-transform">
                  <p className="text-3xl font-bold text-white">{currentMatrix.TP}</p>
                  <p className="text-xs text-blue-200">True Positive</p>
                  <p className="text-xs text-blue-300 mt-1">{((currentMatrix.TP/(currentMatrix.TP+currentMatrix.FN))*100).toFixed(1)}% Recall</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className={`rounded p-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Precision</p>
                <p className="text-xl font-bold text-green-500">{((currentMatrix.TP/(currentMatrix.TP+currentMatrix.FP))*100).toFixed(1)}%</p>
              </div>
              <div className={`rounded p-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Accuracy</p>
                <p className="text-xl font-bold text-blue-500">{(((currentMatrix.TP+currentMatrix.TN)/(currentMatrix.TP+currentMatrix.TN+currentMatrix.FP+currentMatrix.FN))*100).toFixed(1)}%</p>
              </div>
            </div>
            <InsightDropdown 
              title="How to interpret this chart"
              interpretation="A confusion matrix shows how well the model's predictions match reality. Green cells (TN, TP) are correct predictions. Orange/Red cells are errors. Larger numbers in green cells and smaller in red cells indicate better performance."
              insights={[
                "True Negative (TN): Correctly predicted customer will stay - good!",
                "True Positive (TP): Correctly predicted customer will churn - good!",
                "False Positive (FP): Predicted churn but customer stayed - unnecessary intervention",
                "False Negative (FN): Predicted stay but customer churned - missed opportunity, most costly!"
              ]}
            />
          </div>
        </div>

        {/* Threshold Analysis with Cost Savings */}
        <div className="card glow-effect">
          <div className="card-header p-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>⚖️ Threshold Optimization</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Find the optimal balance for your business</p>
          </div>
          <div className="card-content p-4">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={thresholdAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="threshold" stroke={chartColors.text} />
                <YAxis yAxisId="left" stroke={chartColors.text} domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" domain={[0, 100]} tickFormatter={(v) => `$${v}K`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <ReferenceLine yAxisId="left" x={0.5} stroke="#8b5cf6" strokeDasharray="5 5" label={{ value: 'Optimal', fill: '#8b5cf6', position: 'top' }} />
                <Line yAxisId="left" type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} name="Precision" dot={{ r: 4 }} />
                <Line yAxisId="left" type="monotone" dataKey="recall" stroke="#ef4444" strokeWidth={2} name="Recall" dot={{ r: 4 }} />
                <Line yAxisId="left" type="monotone" dataKey="f1" stroke="#3b82f6" strokeWidth={3} name="F1 Score" dot={{ r: 5 }} />
                <Bar yAxisId="right" dataKey="costSavings" fill="#f59e0b" fillOpacity={0.3} name="Est. Savings ($K)" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className={`mt-4 p-4 rounded-lg border ${isDark ? 'bg-purple-900/20 border-purple-800/50' : 'bg-purple-50 border-purple-200'}`}>
              <p className="text-purple-500 font-bold">💡 Recommendation</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Threshold 0.5 provides the best F1 score (63%) with estimated cost savings of $65K. 
                Lower threshold to 0.4 if recall is critical (catch more churners).
              </p>
            </div>
            <InsightDropdown 
              title="How to interpret this chart"
              interpretation="This chart shows how different classification thresholds affect model performance. The threshold determines at what probability a customer is classified as 'will churn'. Lower thresholds catch more churners but also more false alarms."
              insights={[
                "Precision (green): Higher threshold = fewer false alarms but miss more churners",
                "Recall (red): Lower threshold = catch more churners but more false alarms",
                "F1 Score (blue): Balance between precision and recall - peak is optimal",
                "Bars show estimated cost savings at each threshold level"
              ]}
            />
          </div>
        </div>
      </div>

      {/* Model Insights Summary */}
      <div className="card glow-effect">
        <div className="card-header p-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>🔬 Technical Insights</h3>
        </div>
        <div className="card-content p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-800/50' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
              <p className="text-blue-500 font-semibold mb-2">🌲 Random Forest</p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Best precision (78%) - fewer false alarms. Use when intervention cost is high.</p>
            </div>
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-800/50' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
              <p className="text-green-500 font-semibold mb-2">⚡ XGBoost</p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Best recall (55%) - catches more churners. Use when missing churners is costly.</p>
            </div>
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-800/50' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
              <p className="text-purple-500 font-semibold mb-2">🎯 Ensemble</p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Best AUC (0.89) - most balanced. Recommended for production deployment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </StreamGate>
  )
}

export default ModelPerformancePage
