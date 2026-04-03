"""
Advanced Analytics Module
RFM Analysis, Customer Segmentation, CLV Calculation, and Historical Trends
"""

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import json


# =============================================================================
# RFM ANALYSIS
# =============================================================================

@dataclass
class RFMScores:
    """RFM Scores for a customer"""
    customer_id: str
    recency_score: int  # 1-5 (5 = most recent)
    frequency_score: int  # 1-5 (5 = most frequent)
    monetary_score: int  # 1-5 (5 = highest value)
    rfm_score: int  # Combined score
    rfm_segment: str  # Segment name
    
    def to_dict(self):
        return asdict(self)


class RFMAnalyzer:
    """
    RFM (Recency, Frequency, Monetary) Analysis
    Adapted for bank churn data without transaction history
    """
    
    # RFM Segment definitions
    SEGMENTS = {
        (5, 5, 5): "Champions",
        (5, 5, 4): "Champions",
        (5, 4, 5): "Champions",
        (4, 5, 5): "Loyal Customers",
        (5, 5, 3): "Loyal Customers",
        (4, 4, 4): "Loyal Customers",
        (5, 4, 4): "Loyal Customers",
        (4, 5, 4): "Loyal Customers",
        (4, 4, 5): "Loyal Customers",
        (5, 3, 5): "Potential Loyalists",
        (5, 4, 3): "Potential Loyalists",
        (4, 4, 3): "Potential Loyalists",
        (5, 3, 4): "Potential Loyalists",
        (4, 3, 4): "Potential Loyalists",
        (5, 5, 1): "Recent Customers",
        (5, 5, 2): "Recent Customers",
        (5, 4, 1): "Recent Customers",
        (5, 4, 2): "Recent Customers",
        (4, 5, 1): "Recent Customers",
        (4, 5, 2): "Recent Customers",
        (3, 5, 5): "At Risk",
        (3, 4, 5): "At Risk",
        (3, 5, 4): "At Risk",
        (3, 4, 4): "At Risk",
        (2, 5, 5): "Can't Lose Them",
        (2, 5, 4): "Can't Lose Them",
        (2, 4, 5): "Can't Lose Them",
        (1, 5, 5): "Can't Lose Them",
        (2, 2, 2): "Hibernating",
        (2, 3, 2): "Hibernating",
        (2, 2, 3): "Hibernating",
        (3, 2, 2): "Hibernating",
        (1, 2, 2): "Lost",
        (1, 1, 2): "Lost",
        (1, 2, 1): "Lost",
        (1, 1, 1): "Lost",
        (2, 1, 1): "Lost",
        (2, 2, 1): "Lost",
    }
    
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.rfm_df = None
        
    def calculate_rfm_proxies(self) -> pd.DataFrame:
        """
        Calculate RFM proxies for bank customers
        Since we don't have transaction dates, we use:
        - Recency: IsActiveMember (active = recent engagement)
        - Frequency: NumOfProducts + HasCrCard (product engagement)
        - Monetary: Balance + EstimatedSalary (value potential)
        """
        rfm_data = []
        
        for idx, row in self.df.iterrows():
            # Recency proxy: Activity + Tenure (higher = more recent engagement)
            recency_raw = (row.get('IsActiveMember', 0) * 5 + 
                          min(row.get('Tenure', 0), 10) / 2)
            
            # Frequency proxy: Product engagement
            frequency_raw = (row.get('NumOfProducts', 1) * 2 + 
                           row.get('HasCrCard', 0) * 1.5)
            
            # Monetary proxy: Customer value
            monetary_raw = (row.get('Balance', 0) / 25000 + 
                          row.get('EstimatedSalary', 50000) / 50000)
            
            rfm_data.append({
                'customer_idx': idx,
                'recency_raw': recency_raw,
                'frequency_raw': frequency_raw,
                'monetary_raw': monetary_raw
            })
        
        rfm_df = pd.DataFrame(rfm_data)
        
        # Convert to 1-5 scores using quintiles
        for col in ['recency', 'frequency', 'monetary']:
            rfm_df[f'{col}_score'] = pd.qcut(
                rfm_df[f'{col}_raw'].rank(method='first'), 
                q=5, 
                labels=[1, 2, 3, 4, 5]
            ).astype(int)
        
        # Calculate combined RFM score
        rfm_df['rfm_score'] = (rfm_df['recency_score'] + 
                               rfm_df['frequency_score'] + 
                               rfm_df['monetary_score'])
        
        # Assign segments
        rfm_df['segment'] = rfm_df.apply(
            lambda x: self._get_segment(
                x['recency_score'], 
                x['frequency_score'], 
                x['monetary_score']
            ), 
            axis=1
        )
        
        self.rfm_df = rfm_df
        return rfm_df
    
    def _get_segment(self, r: int, f: int, m: int) -> str:
        """Get segment name for RFM scores"""
        key = (r, f, m)
        if key in self.SEGMENTS:
            return self.SEGMENTS[key]
        
        # Default segmentation based on average score
        avg = (r + f + m) / 3
        if avg >= 4:
            return "High Value"
        elif avg >= 3:
            return "Medium Value"
        elif avg >= 2:
            return "Low Value"
        else:
            return "At Risk"
    
    def get_segment_summary(self) -> Dict[str, Any]:
        """Get summary statistics by segment"""
        if self.rfm_df is None:
            self.calculate_rfm_proxies()
        
        summary = self.rfm_df.groupby('segment').agg({
            'customer_idx': 'count',
            'rfm_score': 'mean',
            'recency_score': 'mean',
            'frequency_score': 'mean',
            'monetary_score': 'mean'
        }).round(2).to_dict('index')
        
        return summary


# =============================================================================
# CUSTOMER LIFETIME VALUE (CLV) CALCULATOR
# =============================================================================

class CLVCalculator:
    """
    Customer Lifetime Value Calculator
    Uses multiple methods to estimate CLV
    """
    
    # Industry benchmarks for banking
    AVG_REVENUE_PER_PRODUCT = 150  # Annual revenue per product
    AVG_MARGIN = 0.25  # 25% profit margin
    DISCOUNT_RATE = 0.10  # 10% annual discount rate
    
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        
    def calculate_simple_clv(self, row: pd.Series) -> float:
        """
        Simple CLV calculation based on current products and expected tenure
        CLV = (Revenue per period × Margin) × Expected Lifespan
        """
        num_products = row.get('NumOfProducts', 1)
        tenure = row.get('Tenure', 1)
        is_active = row.get('IsActiveMember', 0)
        balance = row.get('Balance', 0)
        
        # Annual revenue estimation
        product_revenue = num_products * self.AVG_REVENUE_PER_PRODUCT
        balance_revenue = balance * 0.02  # 2% interest margin on balance
        annual_revenue = product_revenue + balance_revenue
        
        # Expected remaining tenure (active customers stay longer)
        base_tenure = 5
        if is_active:
            expected_tenure = base_tenure + min(tenure, 10) * 0.5
        else:
            expected_tenure = max(1, base_tenure - tenure * 0.3)
        
        # Calculate CLV with discounting
        clv = 0
        for year in range(int(expected_tenure)):
            discount_factor = 1 / ((1 + self.DISCOUNT_RATE) ** year)
            clv += annual_revenue * self.AVG_MARGIN * discount_factor
        
        return round(clv, 2)
    
    def calculate_probabilistic_clv(self, row: pd.Series, 
                                     churn_probability: float) -> float:
        """
        Probabilistic CLV that accounts for churn risk
        CLV = Base CLV × (1 - Churn Probability)
        """
        base_clv = self.calculate_simple_clv(row)
        
        # Adjust for churn probability
        survival_probability = 1 - churn_probability
        adjusted_clv = base_clv * survival_probability
        
        return round(adjusted_clv, 2)
    
    def calculate_all_clv(self) -> pd.DataFrame:
        """Calculate CLV for all customers"""
        clv_data = []
        
        for idx, row in self.df.iterrows():
            clv = self.calculate_simple_clv(row)
            clv_data.append({
                'customer_idx': idx,
                'clv': clv,
                'clv_segment': self._get_clv_segment(clv)
            })
        
        return pd.DataFrame(clv_data)
    
    def _get_clv_segment(self, clv: float) -> str:
        """Segment customers by CLV"""
        if clv >= 15000:
            return "Platinum"
        elif clv >= 10000:
            return "Gold"
        elif clv >= 5000:
            return "Silver"
        else:
            return "Bronze"


# =============================================================================
# CUSTOMER SEGMENTATION (K-MEANS CLUSTERING)
# =============================================================================

class CustomerSegmentation:
    """
    Advanced customer segmentation using K-Means clustering
    """
    
    SEGMENT_NAMES = {
        0: "Value Seekers",
        1: "High-Value Engaged",
        2: "At-Risk Seniors",
        3: "Young Professionals",
        4: "Dormant Accounts"
    }
    
    def __init__(self, df: pd.DataFrame, n_clusters: int = 5):
        self.df = df.copy()
        self.n_clusters = n_clusters
        self.model = None
        self.scaler = StandardScaler()
        self.cluster_labels = None
        self.cluster_centers = None
        
    def prepare_features(self) -> np.ndarray:
        """Prepare features for clustering"""
        features = ['Age', 'Tenure', 'Balance', 'NumOfProducts', 
                   'IsActiveMember', 'EstimatedSalary', 'CreditScore']
        
        # Select available features
        available = [f for f in features if f in self.df.columns]
        X = self.df[available].fillna(0)
        
        # Normalize features
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, available
    
    def fit_clusters(self) -> pd.DataFrame:
        """Perform K-Means clustering"""
        X_scaled, feature_names = self.prepare_features()
        
        # Fit K-Means
        self.model = KMeans(
            n_clusters=self.n_clusters,
            random_state=42,
            n_init=10
        )
        
        self.cluster_labels = self.model.fit_predict(X_scaled)
        self.cluster_centers = self.scaler.inverse_transform(self.model.cluster_centers_)
        
        # Add cluster labels to dataframe
        result_df = self.df.copy()
        result_df['cluster'] = self.cluster_labels
        result_df['cluster_name'] = result_df['cluster'].map(
            lambda x: self.SEGMENT_NAMES.get(x, f"Segment {x}")
        )
        
        return result_df
    
    def get_cluster_profiles(self) -> List[Dict[str, Any]]:
        """Get detailed profiles for each cluster"""
        if self.cluster_labels is None:
            self.fit_clusters()
        
        df_clustered = self.df.copy()
        df_clustered['cluster'] = self.cluster_labels
        
        profiles = []
        
        for cluster_id in range(self.n_clusters):
            cluster_data = df_clustered[df_clustered['cluster'] == cluster_id]
            
            profile = {
                'cluster_id': cluster_id,
                'name': self.SEGMENT_NAMES.get(cluster_id, f"Segment {cluster_id}"),
                'size': len(cluster_data),
                'percentage': round(len(cluster_data) / len(df_clustered) * 100, 1),
                'characteristics': {
                    'avg_age': round(cluster_data['Age'].mean(), 1),
                    'avg_tenure': round(cluster_data['Tenure'].mean(), 1),
                    'avg_balance': round(cluster_data['Balance'].mean(), 0),
                    'avg_products': round(cluster_data['NumOfProducts'].mean(), 2),
                    'pct_active': round(cluster_data['IsActiveMember'].mean() * 100, 1),
                    'avg_credit_score': round(cluster_data['CreditScore'].mean(), 0),
                    'avg_salary': round(cluster_data['EstimatedSalary'].mean(), 0)
                },
                'churn_rate': round(cluster_data['Exited'].mean() * 100, 1) if 'Exited' in cluster_data else None
            }
            
            # Add recommendations based on characteristics
            profile['recommendations'] = self._generate_segment_recommendations(profile)
            
            profiles.append(profile)
        
        return profiles
    
    def _generate_segment_recommendations(self, profile: Dict) -> List[str]:
        """Generate recommendations for a segment"""
        recommendations = []
        chars = profile['characteristics']
        churn = profile.get('churn_rate', 0)
        
        if churn and churn > 25:
            recommendations.append("High priority - implement retention campaigns")
        
        if chars['pct_active'] < 40:
            recommendations.append("Focus on reactivation programs")
        
        if chars['avg_products'] < 1.5:
            recommendations.append("Cross-sell additional products")
        
        if chars['avg_balance'] < 30000:
            recommendations.append("Promote savings/investment products")
        
        if chars['avg_age'] > 50:
            recommendations.append("Personalized senior-focused services")
        
        if not recommendations:
            recommendations.append("Maintain current engagement strategy")
        
        return recommendations


# =============================================================================
# HISTORICAL TREND ANALYTICS
# =============================================================================

class TrendAnalyzer:
    """
    Historical trend analytics for time-series analysis
    Simulates historical trends since we don't have actual time data
    """
    
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        
    def generate_historical_trends(self, months: int = 12) -> Dict[str, Any]:
        """
        Generate simulated historical trends based on current data
        Creates realistic monthly projections
        """
        base_churn_rate = self.df['Exited'].mean() if 'Exited' in self.df else 0.20
        total_customers = len(self.df)
        
        # Generate monthly data with some variance
        np.random.seed(42)
        monthly_data = []
        
        for month in range(months, 0, -1):
            date = datetime.now() - timedelta(days=month * 30)
            
            # Add seasonal variance (higher churn in Q1, lower in Q4)
            quarter = (date.month - 1) // 3 + 1
            seasonal_factor = {1: 1.15, 2: 1.05, 3: 0.95, 4: 0.85}[quarter]
            
            # Add random variance
            variance = np.random.uniform(0.92, 1.08)
            
            monthly_churn = base_churn_rate * seasonal_factor * variance
            churned = int(total_customers * monthly_churn / 12)
            
            monthly_data.append({
                'month': date.strftime('%Y-%m'),
                'month_name': date.strftime('%b %Y'),
                'total_customers': total_customers + churned,  # Before churn
                'churned': churned,
                'churn_rate': round(monthly_churn * 100, 2),
                'retained': total_customers,
                'retention_rate': round((1 - monthly_churn) * 100, 2)
            })
        
        # Calculate trends
        churn_rates = [m['churn_rate'] for m in monthly_data]
        trend = "increasing" if churn_rates[-1] > churn_rates[0] else "decreasing"
        avg_churn = sum(churn_rates) / len(churn_rates)
        
        return {
            'monthly_data': monthly_data,
            'trend_direction': trend,
            'avg_monthly_churn': round(avg_churn, 2),
            'peak_churn_month': max(monthly_data, key=lambda x: x['churn_rate'])['month_name'],
            'lowest_churn_month': min(monthly_data, key=lambda x: x['churn_rate'])['month_name'],
            'yoy_change': round(churn_rates[-1] - churn_rates[0], 2)
        }
    
    def get_cohort_retention(self) -> Dict[str, Any]:
        """
        Generate cohort retention analysis based on tenure
        """
        if 'Tenure' not in self.df:
            return {}
        
        # Group by tenure (simulating signup cohorts)
        cohort_data = []
        
        for tenure in range(0, 11):
            cohort = self.df[self.df['Tenure'] == tenure]
            if len(cohort) > 0:
                retention_rate = 1 - cohort['Exited'].mean() if 'Exited' in cohort else 0.8
                
                cohort_data.append({
                    'tenure_years': tenure,
                    'cohort_size': len(cohort),
                    'retention_rate': round(retention_rate * 100, 1),
                    'churn_rate': round((1 - retention_rate) * 100, 1)
                })
        
        return {
            'cohort_data': cohort_data,
            'best_retention_tenure': max(cohort_data, key=lambda x: x['retention_rate'])['tenure_years'] if cohort_data else 0,
            'critical_tenure': min(cohort_data, key=lambda x: x['retention_rate'])['tenure_years'] if cohort_data else 0,
            'avg_retention': round(sum(c['retention_rate'] for c in cohort_data) / len(cohort_data), 1) if cohort_data else 0
        }
    
    def forecast_churn(self, months_ahead: int = 6) -> List[Dict]:
        """
        Forecast future churn using simple extrapolation
        """
        historical = self.generate_historical_trends(12)
        recent_trend = historical['yoy_change'] / 12  # Monthly change
        
        current_rate = historical['monthly_data'][-1]['churn_rate']
        forecasts = []
        
        for month in range(1, months_ahead + 1):
            date = datetime.now() + timedelta(days=month * 30)
            
            # Apply trend with dampening
            dampening = 0.9 ** month
            forecast_rate = current_rate + (recent_trend * month * dampening)
            
            # Add confidence interval
            std = abs(recent_trend) * month * 0.5
            
            forecasts.append({
                'month': date.strftime('%Y-%m'),
                'month_name': date.strftime('%b %Y'),
                'forecast_churn_rate': round(max(0, min(100, forecast_rate)), 2),
                'lower_bound': round(max(0, forecast_rate - 2 * std), 2),
                'upper_bound': round(min(100, forecast_rate + 2 * std), 2),
                'confidence': 'high' if month <= 2 else 'medium' if month <= 4 else 'low'
            })
        
        return forecasts


# =============================================================================
# A/B TESTING FRAMEWORK
# =============================================================================

@dataclass
class ABTestResult:
    """Results from an A/B test"""
    test_id: str
    test_name: str
    variant_a: str
    variant_b: str
    sample_size_a: int
    sample_size_b: int
    conversion_a: float
    conversion_b: float
    lift: float
    p_value: float
    is_significant: bool
    winner: str
    confidence: float
    
    def to_dict(self):
        """Convert to dict with Python native types for JSON serialization"""
        return {
            'test_id': str(self.test_id),
            'test_name': str(self.test_name),
            'variant_a': str(self.variant_a),
            'variant_b': str(self.variant_b),
            'sample_size_a': int(self.sample_size_a),
            'sample_size_b': int(self.sample_size_b),
            'conversion_a': float(self.conversion_a),
            'conversion_b': float(self.conversion_b),
            'lift': float(self.lift),
            'p_value': float(self.p_value),
            'is_significant': bool(self.is_significant),
            'winner': str(self.winner),
            'confidence': float(self.confidence)
        }


class ABTestingFramework:
    """
    A/B Testing Framework for retention interventions
    """
    
    def __init__(self):
        self.tests = {}
        self.results = {}
        
    def create_test(self, test_id: str, test_name: str,
                    variant_a: str, variant_b: str,
                    target_sample: int = 1000) -> Dict[str, Any]:
        """Create a new A/B test"""
        test = {
            'test_id': test_id,
            'test_name': test_name,
            'variant_a': variant_a,
            'variant_b': variant_b,
            'target_sample': target_sample,
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'samples_a': [],
            'samples_b': [],
            'conversions_a': 0,
            'conversions_b': 0
        }
        
        self.tests[test_id] = test
        return test
    
    def simulate_test_results(self, test_id: str,
                              base_rate: float = 0.20,
                              effect_size: float = 0.15) -> ABTestResult:
        """
        Simulate A/B test results for demonstration
        In production, this would track real user behavior
        """
        np.random.seed(hash(test_id) % 2**32)
        
        test = self.tests.get(test_id, {
            'test_name': 'Demo Test',
            'variant_a': 'Control',
            'variant_b': 'Treatment',
            'target_sample': 1000
        })
        
        n_a = test.get('target_sample', 1000)
        n_b = test.get('target_sample', 1000)
        
        # Simulate conversions (e.g., retention)
        rate_a = base_rate
        rate_b = base_rate * (1 + effect_size)  # Treatment has lift
        
        conversions_a = np.random.binomial(n_a, rate_a)
        conversions_b = np.random.binomial(n_b, rate_b)
        
        observed_rate_a = conversions_a / n_a
        observed_rate_b = conversions_b / n_b
        
        # Calculate lift
        lift = ((observed_rate_b - observed_rate_a) / observed_rate_a) * 100 if observed_rate_a > 0 else 0
        
        # Calculate p-value (simplified z-test)
        pooled_rate = (conversions_a + conversions_b) / (n_a + n_b)
        se = np.sqrt(pooled_rate * (1 - pooled_rate) * (1/n_a + 1/n_b))
        z_score = (observed_rate_b - observed_rate_a) / se if se > 0 else 0
        
        # Two-tailed p-value approximation
        p_value = 2 * (1 - min(0.9999, abs(z_score) / 4))
        
        is_significant = p_value < 0.05
        confidence = (1 - p_value) * 100
        
        winner = test['variant_b'] if lift > 0 and is_significant else test['variant_a'] if is_significant else 'No winner yet'
        
        result = ABTestResult(
            test_id=test_id,
            test_name=test.get('test_name', 'Unknown'),
            variant_a=test.get('variant_a', 'A'),
            variant_b=test.get('variant_b', 'B'),
            sample_size_a=n_a,
            sample_size_b=n_b,
            conversion_a=round(observed_rate_a * 100, 2),
            conversion_b=round(observed_rate_b * 100, 2),
            lift=round(lift, 2),
            p_value=round(p_value, 4),
            is_significant=is_significant,
            winner=winner,
            confidence=round(confidence, 1)
        )
        
        self.results[test_id] = result
        return result
    
    def get_active_tests(self) -> List[Dict]:
        """Get all active tests"""
        return [
            {**test, 'results': self.results.get(test['test_id'])}
            for test in self.tests.values()
            if test.get('status') == 'active'
        ]
    
    def get_test_recommendations(self) -> List[Dict]:
        """Get recommended A/B tests to run"""
        return [
            {
                'test_name': 'Reactivation Email Campaign',
                'variant_a': 'Standard reminder email',
                'variant_b': 'Personalized win-back offer',
                'expected_lift': '15-25%',
                'target_segment': 'Inactive members',
                'priority': 'high'
            },
            {
                'test_name': 'German Market Pricing',
                'variant_a': 'Standard pricing',
                'variant_b': 'Competitive local pricing',
                'expected_lift': '10-20%',
                'target_segment': 'German customers',
                'priority': 'high'
            },
            {
                'test_name': 'Product Bundle Simplification',
                'variant_a': 'Current 3+ product bundle',
                'variant_b': 'Simplified 2-product bundle',
                'expected_lift': '20-35%',
                'target_segment': 'Multi-product customers',
                'priority': 'medium'
            },
            {
                'test_name': 'Senior Loyalty Program',
                'variant_a': 'No loyalty benefits',
                'variant_b': 'Age-based loyalty rewards',
                'expected_lift': '12-18%',
                'target_segment': 'Customers 50+',
                'priority': 'medium'
            },
            {
                'test_name': 'Onboarding Enhancement',
                'variant_a': 'Standard onboarding',
                'variant_b': 'Enhanced 30-day program',
                'expected_lift': '18-28%',
                'target_segment': 'New customers (tenure < 1y)',
                'priority': 'high'
            }
        ]


# =============================================================================
# SINGLETON ACCESSORS
# =============================================================================

_rfm_analyzer = None
_clv_calculator = None
_segmentation = None
_trend_analyzer = None
_ab_framework = None


def get_rfm_analyzer(df: pd.DataFrame = None) -> RFMAnalyzer:
    global _rfm_analyzer
    if _rfm_analyzer is None and df is not None:
        _rfm_analyzer = RFMAnalyzer(df)
    return _rfm_analyzer


def get_clv_calculator(df: pd.DataFrame = None) -> CLVCalculator:
    global _clv_calculator
    if _clv_calculator is None and df is not None:
        _clv_calculator = CLVCalculator(df)
    return _clv_calculator


def get_segmentation(df: pd.DataFrame = None, n_clusters: int = 5) -> CustomerSegmentation:
    global _segmentation
    if _segmentation is None and df is not None:
        _segmentation = CustomerSegmentation(df, n_clusters)
    return _segmentation


def get_trend_analyzer(df: pd.DataFrame = None) -> TrendAnalyzer:
    global _trend_analyzer
    if _trend_analyzer is None and df is not None:
        _trend_analyzer = TrendAnalyzer(df)
    return _trend_analyzer


def get_ab_framework() -> ABTestingFramework:
    global _ab_framework
    if _ab_framework is None:
        _ab_framework = ABTestingFramework()
        # Create some demo tests
        _ab_framework.create_test(
            'test_001', 'Reactivation Email A/B',
            'Standard Email', 'Personalized Offer', 500
        )
        _ab_framework.create_test(
            'test_002', 'German Market Pricing',
            'Standard Pricing', 'Local Competitive', 750
        )
    return _ab_framework
