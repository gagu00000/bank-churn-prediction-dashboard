"""
Customer Retention Engine
AI-powered retention strategies and batch processing
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
from pathlib import Path
import asyncio
from dataclasses import dataclass, asdict
from enum import Enum


class RiskTier(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class InterventionType(Enum):
    PERSONAL_CALL = "personal_call"
    EMAIL_CAMPAIGN = "email_campaign"
    LOYALTY_BONUS = "loyalty_bonus"
    PRODUCT_UPGRADE = "product_upgrade"
    ACCOUNT_MANAGER = "account_manager"
    REACTIVATION = "reactivation"
    CROSS_SELL = "cross_sell"


@dataclass
class RetentionAction:
    """Represents a recommended retention action"""
    action_type: InterventionType
    priority: int  # 1-5, 1 being highest
    title: str
    description: str
    expected_success_rate: float
    estimated_cost: float
    estimated_revenue_saved: float
    roi: float
    deadline: str
    tactics: List[str]
    
    def to_dict(self):
        result = asdict(self)
        result['action_type'] = self.action_type.value
        return result


@dataclass
class CustomerRiskProfile:
    """Complete risk profile for a customer"""
    customer_id: str
    churn_probability: float
    risk_tier: RiskTier
    estimated_ltv: float
    revenue_at_risk: float
    top_risk_factors: List[str]
    recommended_actions: List[RetentionAction]
    intervention_deadline: str
    save_probability: float
    
    def to_dict(self):
        result = asdict(self)
        result['risk_tier'] = self.risk_tier.value
        result['recommended_actions'] = [a.to_dict() for a in self.recommended_actions]
        return result


class RetentionEngine:
    """
    AI-powered customer retention engine
    Generates personalized retention strategies based on churn predictions
    """
    
    def __init__(self):
        self.intervention_configs = self._load_intervention_configs()
        
    def _load_intervention_configs(self) -> Dict:
        """Load intervention configurations and success rates"""
        return {
            InterventionType.PERSONAL_CALL: {
                "base_success_rate": 0.42,
                "cost": 45,
                "effort": "high",
                "best_for": ["inactive", "high_value", "senior"]
            },
            InterventionType.EMAIL_CAMPAIGN: {
                "base_success_rate": 0.18,
                "cost": 5,
                "effort": "low",
                "best_for": ["mass", "young", "digital"]
            },
            InterventionType.LOYALTY_BONUS: {
                "base_success_rate": 0.55,
                "cost": 75,
                "effort": "medium",
                "best_for": ["price_sensitive", "long_tenure"]
            },
            InterventionType.PRODUCT_UPGRADE: {
                "base_success_rate": 0.35,
                "cost": 25,
                "effort": "medium",
                "best_for": ["single_product", "growth"]
            },
            InterventionType.ACCOUNT_MANAGER: {
                "base_success_rate": 0.65,
                "cost": 120,
                "effort": "high",
                "best_for": ["premium", "complex", "high_value"]
            },
            InterventionType.REACTIVATION: {
                "base_success_rate": 0.32,
                "cost": 60,
                "effort": "medium",
                "best_for": ["dormant", "zero_balance"]
            },
            InterventionType.CROSS_SELL: {
                "base_success_rate": 0.28,
                "cost": 15,
                "effort": "low",
                "best_for": ["single_product", "engaged"]
            }
        }
    
    def generate_retention_plan(self, customer_data: Dict[str, Any],
                                 prediction: Dict[str, Any]) -> CustomerRiskProfile:
        """
        Generate comprehensive retention plan for a customer
        """
        churn_prob = prediction.get('churn_probability', 0)
        risk_tier = self._determine_risk_tier(churn_prob)
        
        # Calculate customer value
        ltv = self._calculate_ltv(customer_data)
        revenue_at_risk = ltv * churn_prob
        
        # Identify risk factors
        risk_factors = self._identify_risk_factors(customer_data, prediction)
        
        # Generate recommended actions
        actions = self._generate_actions(customer_data, churn_prob, ltv, risk_factors)
        
        # Calculate save probability
        save_prob = self._calculate_save_probability(actions, risk_tier)
        
        # Set intervention deadline based on risk
        deadline = self._calculate_deadline(risk_tier)
        
        return CustomerRiskProfile(
            customer_id=customer_data.get('CustomerId', 'N/A'),
            churn_probability=churn_prob,
            risk_tier=risk_tier,
            estimated_ltv=ltv,
            revenue_at_risk=revenue_at_risk,
            top_risk_factors=risk_factors[:5],
            recommended_actions=actions,
            intervention_deadline=deadline,
            save_probability=save_prob
        )
    
    def _determine_risk_tier(self, churn_prob: float) -> RiskTier:
        """Determine risk tier from probability"""
        if churn_prob >= 0.75:
            return RiskTier.CRITICAL
        elif churn_prob >= 0.50:
            return RiskTier.HIGH
        elif churn_prob >= 0.30:
            return RiskTier.MEDIUM
        else:
            return RiskTier.LOW
    
    def _calculate_ltv(self, customer_data: Dict[str, Any]) -> float:
        """Calculate customer lifetime value"""
        balance = customer_data.get('Balance', 0)
        salary = customer_data.get('EstimatedSalary', 50000)
        products = customer_data.get('NumOfProducts', 1)
        tenure = customer_data.get('Tenure', 0)
        
        annual_revenue = (balance * 0.03) + (products * 250) + (salary * 0.005)
        annual_revenue = max(annual_revenue, 500)
        
        remaining_years = max(10 - tenure, 3)
        ltv = annual_revenue * remaining_years * 0.85
        
        return round(ltv, 2)
    
    def _identify_risk_factors(self, customer_data: Dict, 
                                prediction: Dict) -> List[str]:
        """Identify key risk factors"""
        factors = []
        
        if not customer_data.get('IsActiveMember'):
            factors.append("Inactive member status")
        
        if customer_data.get('NumOfProducts', 1) >= 3:
            factors.append("Too many products (complexity)")
        elif customer_data.get('NumOfProducts', 1) == 1:
            factors.append("Single product (low engagement)")
        
        if customer_data.get('Age', 35) > 50:
            factors.append("Senior demographic (higher churn)")
        
        if customer_data.get('Geography') == 'Germany':
            factors.append("German market (high churn region)")
        
        if customer_data.get('Balance', 0) == 0:
            factors.append("Zero balance (dormant account)")
        
        if customer_data.get('Tenure', 5) <= 1:
            factors.append("New customer (onboarding risk)")
        
        if customer_data.get('CreditScore', 650) < 500:
            factors.append("Low credit score (financial stress)")
        
        return factors
    
    def _generate_actions(self, customer_data: Dict, churn_prob: float,
                          ltv: float, risk_factors: List[str]) -> List[RetentionAction]:
        """Generate prioritized retention actions"""
        actions = []
        
        is_active = customer_data.get('IsActiveMember', 1)
        products = customer_data.get('NumOfProducts', 1)
        age = customer_data.get('Age', 35)
        balance = customer_data.get('Balance', 0)
        
        # High-value customers get premium treatment
        if ltv > 15000:
            actions.append(self._create_action(
                InterventionType.ACCOUNT_MANAGER,
                customer_data, churn_prob, ltv,
                priority=1,
                tactics=[
                    "Assign dedicated senior relationship manager",
                    "Schedule quarterly portfolio reviews",
                    "Provide priority support line access",
                    "Invite to exclusive VIP events"
                ]
            ))
        
        # Inactive customers need reactivation
        if not is_active:
            actions.append(self._create_action(
                InterventionType.REACTIVATION,
                customer_data, churn_prob, ltv,
                priority=1,
                tactics=[
                    "Send personalized reactivation email",
                    "Offer comeback bonus (cashback/rewards)",
                    "Trigger automated reminder sequence",
                    "Schedule personal outreach call"
                ]
            ))
        
        # Single product customers need cross-sell
        if products == 1:
            actions.append(self._create_action(
                InterventionType.CROSS_SELL,
                customer_data, churn_prob, ltv,
                priority=2,
                tactics=[
                    "Recommend complementary savings product",
                    "Offer bundled product discount",
                    "Send personalized product matching email",
                    "Schedule needs assessment call"
                ]
            ))
        
        # Over-sold customers need simplification
        if products >= 3:
            actions.append(self._create_action(
                InterventionType.PERSONAL_CALL,
                customer_data, churn_prob, ltv,
                priority=1,
                tactics=[
                    "Review current product portfolio",
                    "Identify unused or redundant products",
                    "Offer consolidated pricing",
                    "Simplify account structure"
                ]
            ))
        
        # Senior customers get special attention
        if age > 50:
            actions.append(self._create_action(
                InterventionType.PERSONAL_CALL,
                customer_data, churn_prob, ltv,
                priority=2,
                tactics=[
                    "Offer digital banking assistance",
                    "Provide dedicated senior support",
                    "Schedule in-branch consultation",
                    "Send simplified account statements"
                ]
            ))
        
        # Zero balance needs activation
        if balance == 0:
            actions.append(self._create_action(
                InterventionType.LOYALTY_BONUS,
                customer_data, churn_prob, ltv,
                priority=2,
                tactics=[
                    "Offer deposit bonus incentive",
                    "Set up automatic savings plan",
                    "Provide budgeting tools access",
                    "Send financial wellness tips"
                ]
            ))
        
        # Default email campaign for all
        if churn_prob >= 0.3:
            actions.append(self._create_action(
                InterventionType.EMAIL_CAMPAIGN,
                customer_data, churn_prob, ltv,
                priority=3,
                tactics=[
                    "Send personalized retention email",
                    "Highlight unused benefits",
                    "Share customer success stories",
                    "Offer satisfaction survey with incentive"
                ]
            ))
        
        # Sort by priority and limit to top 5
        actions.sort(key=lambda x: x.priority)
        return actions[:5]
    
    def _create_action(self, action_type: InterventionType,
                       customer_data: Dict, churn_prob: float,
                       ltv: float, priority: int,
                       tactics: List[str]) -> RetentionAction:
        """Create a retention action with calculated metrics"""
        config = self.intervention_configs[action_type]
        
        # Adjust success rate based on customer profile
        success_rate = config['base_success_rate']
        if customer_data.get('IsActiveMember'):
            success_rate *= 1.2  # Easier to retain active members
        if customer_data.get('Tenure', 0) >= 5:
            success_rate *= 1.15  # Loyal customers respond better
        
        success_rate = min(success_rate, 0.75)  # Cap at 75%
        
        cost = config['cost']
        revenue_saved = ltv * success_rate
        roi = ((revenue_saved - cost) / cost) * 100 if cost > 0 else 0
        
        # Generate title and description
        titles = {
            InterventionType.PERSONAL_CALL: "Personal Outreach Call",
            InterventionType.EMAIL_CAMPAIGN: "Targeted Email Campaign",
            InterventionType.LOYALTY_BONUS: "Loyalty Reward Program",
            InterventionType.PRODUCT_UPGRADE: "Product Enhancement Offer",
            InterventionType.ACCOUNT_MANAGER: "Premium Account Management",
            InterventionType.REACTIVATION: "Re-engagement Initiative",
            InterventionType.CROSS_SELL: "Product Expansion Opportunity"
        }
        
        descriptions = {
            InterventionType.PERSONAL_CALL: "Direct personal contact to understand needs and address concerns",
            InterventionType.EMAIL_CAMPAIGN: "Automated personalized email sequence with targeted messaging",
            InterventionType.LOYALTY_BONUS: "Special rewards or bonuses to demonstrate appreciation",
            InterventionType.PRODUCT_UPGRADE: "Enhanced product features or upgraded service tier",
            InterventionType.ACCOUNT_MANAGER: "Dedicated relationship manager for personalized service",
            InterventionType.REACTIVATION: "Targeted campaign to re-engage dormant customer",
            InterventionType.CROSS_SELL: "Introduce complementary products to increase engagement"
        }
        
        # Calculate deadline based on priority
        days = {1: 3, 2: 7, 3: 14, 4: 30, 5: 60}
        deadline_date = datetime.now() + timedelta(days=days.get(priority, 14))
        
        return RetentionAction(
            action_type=action_type,
            priority=priority,
            title=titles.get(action_type, "Retention Action"),
            description=descriptions.get(action_type, ""),
            expected_success_rate=round(success_rate, 3),
            estimated_cost=cost,
            estimated_revenue_saved=round(revenue_saved, 2),
            roi=round(roi, 1),
            deadline=deadline_date.strftime("%Y-%m-%d"),
            tactics=tactics
        )
    
    def _calculate_save_probability(self, actions: List[RetentionAction],
                                     risk_tier: RiskTier) -> float:
        """Calculate overall probability of saving the customer"""
        if not actions:
            return 0.1
        
        # Combined probability of at least one action succeeding
        fail_prob = 1.0
        for action in actions[:3]:  # Consider top 3 actions
            fail_prob *= (1 - action.expected_success_rate)
        
        save_prob = 1 - fail_prob
        
        # Adjust by risk tier
        tier_adjustments = {
            RiskTier.CRITICAL: 0.7,
            RiskTier.HIGH: 0.85,
            RiskTier.MEDIUM: 1.0,
            RiskTier.LOW: 1.1
        }
        
        save_prob *= tier_adjustments.get(risk_tier, 1.0)
        return round(min(save_prob, 0.85), 3)
    
    def _calculate_deadline(self, risk_tier: RiskTier) -> str:
        """Calculate intervention deadline based on risk"""
        days = {
            RiskTier.CRITICAL: 3,
            RiskTier.HIGH: 7,
            RiskTier.MEDIUM: 14,
            RiskTier.LOW: 30
        }
        
        deadline = datetime.now() + timedelta(days=days.get(risk_tier, 14))
        return deadline.strftime("%Y-%m-%d")
    
    def process_batch(self, customers: List[Dict],
                      predictions: List[Dict]) -> Dict[str, Any]:
        """
        Process batch of customers and generate retention plans
        """
        results = []
        summary = {
            "total_processed": len(customers),
            "critical_count": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
            "total_revenue_at_risk": 0,
            "potential_savings": 0
        }
        
        for customer, prediction in zip(customers, predictions):
            profile = self.generate_retention_plan(customer, prediction)
            results.append(profile.to_dict())
            
            # Update summary
            tier = profile.risk_tier
            if tier == RiskTier.CRITICAL:
                summary["critical_count"] += 1
            elif tier == RiskTier.HIGH:
                summary["high_count"] += 1
            elif tier == RiskTier.MEDIUM:
                summary["medium_count"] += 1
            else:
                summary["low_count"] += 1
            
            summary["total_revenue_at_risk"] += profile.revenue_at_risk
            summary["potential_savings"] += profile.revenue_at_risk * profile.save_probability
        
        summary["total_revenue_at_risk"] = round(summary["total_revenue_at_risk"], 2)
        summary["potential_savings"] = round(summary["potential_savings"], 2)
        
        return {
            "summary": summary,
            "customer_profiles": results,
            "generated_at": datetime.now().isoformat()
        }


class AlertsManager:
    """
    Manages real-time alerts for high-risk customers
    """
    
    def __init__(self):
        self.alerts_queue = []
        self.alert_thresholds = {
            "critical": 0.75,
            "high": 0.60,
            "high_value_threshold": 10000  # LTV threshold
        }
    
    def check_alert_conditions(self, customer_data: Dict,
                                prediction: Dict,
                                ltv: float) -> Optional[Dict]:
        """
        Check if alert should be triggered for this customer
        """
        churn_prob = prediction.get('churn_probability', 0)
        
        # Critical risk - always alert
        if churn_prob >= self.alert_thresholds['critical']:
            return self._create_alert(
                customer_data, prediction, ltv,
                alert_type="CRITICAL_CHURN_RISK",
                severity="critical",
                message=f"Critical churn risk detected ({churn_prob*100:.1f}%)"
            )
        
        # High-value at-risk - alert
        if (churn_prob >= self.alert_thresholds['high'] and 
            ltv >= self.alert_thresholds['high_value_threshold']):
            return self._create_alert(
                customer_data, prediction, ltv,
                alert_type="HIGH_VALUE_AT_RISK",
                severity="high",
                message=f"High-value customer at risk (LTV: ${ltv:,.0f})"
            )
        
        return None
    
    def _create_alert(self, customer_data: Dict, prediction: Dict,
                      ltv: float, alert_type: str, severity: str,
                      message: str) -> Dict:
        """Create alert payload"""
        return {
            "alert_id": f"ALT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "alert_type": alert_type,
            "severity": severity,
            "message": message,
            "customer_id": customer_data.get('CustomerId', 'N/A'),
            "churn_probability": prediction.get('churn_probability', 0),
            "estimated_ltv": ltv,
            "risk_level": prediction.get('risk_level', 'UNKNOWN'),
            "created_at": datetime.now().isoformat(),
            "requires_action": True,
            "action_deadline": (datetime.now() + timedelta(hours=24 if severity == 'critical' else 72)).isoformat()
        }


# Singleton instances
_retention_engine: Optional[RetentionEngine] = None
_alerts_manager: Optional[AlertsManager] = None


def get_retention_engine() -> RetentionEngine:
    global _retention_engine
    if _retention_engine is None:
        _retention_engine = RetentionEngine()
    return _retention_engine


def get_alerts_manager() -> AlertsManager:
    global _alerts_manager
    if _alerts_manager is None:
        _alerts_manager = AlertsManager()
    return _alerts_manager
