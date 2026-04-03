"""
Synthetic Bank Customer Data Generator
Generates realistic customer data for live streaming simulation
"""

import numpy as np
import random
from faker import Faker
from typing import Dict, Any

fake = Faker()


class CustomerDataGenerator:
    """Generate synthetic bank customer data matching the original dataset schema"""
    
    def __init__(self):
        self.geographies = ['France', 'Spain', 'Germany']
        self.genders = ['Male', 'Female']
        self.surnames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
            'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
            'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez',
            'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright',
            'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams'
        ]
        
    def generate_customer(self) -> Dict[str, Any]:
        """Generate a single customer record"""
        
        # Basic demographics
        geography = random.choice(self.geographies)
        gender = random.choice(self.genders)
        age = self._generate_age()
        
        # Account information
        credit_score = self._generate_credit_score()
        tenure = random.randint(0, 10)
        balance = self._generate_balance()
        num_products = self._generate_num_products()
        
        # Account status
        has_credit_card = random.choices([0, 1], weights=[0.3, 0.7])[0]
        is_active_member = random.choices([0, 1], weights=[0.5, 0.5])[0]
        
        # Financial
        estimated_salary = round(random.uniform(10000, 200000), 2)
        
        customer = {
            'CustomerId': random.randint(15000000, 15999999),
            'Surname': random.choice(self.surnames),
            'CreditScore': credit_score,
            'Geography': geography,
            'Gender': gender,
            'Age': age,
            'Tenure': tenure,
            'Balance': balance,
            'NumOfProducts': num_products,
            'HasCrCard': has_credit_card,
            'IsActiveMember': is_active_member,
            'EstimatedSalary': estimated_salary
        }
        
        return customer
    
    def _generate_age(self) -> int:
        """Generate realistic age with appropriate distribution"""
        # Most customers between 25-55
        mean_age = 40
        std_age = 12
        age = int(np.random.normal(mean_age, std_age))
        return max(18, min(90, age))
    
    def _generate_credit_score(self) -> int:
        """Generate credit score (300-850)"""
        # Normal distribution centered around 650
        mean_score = 650
        std_score = 80
        score = int(np.random.normal(mean_score, std_score))
        return max(350, min(850, score))
    
    def _generate_balance(self) -> float:
        """Generate account balance"""
        # Many customers have zero balance (inactive accounts)
        if random.random() < 0.5:
            return 0.0
        else:
            # Active accounts: 1000 - 250000
            return round(random.uniform(1000, 250000), 2)
    
    def _generate_num_products(self) -> int:
        """Generate number of products (1-4)"""
        # Most customers have 1-2 products
        weights = [0.5, 0.45, 0.04, 0.01]
        return random.choices([1, 2, 3, 4], weights=weights)[0]
    
    def generate_batch(self, n: int = 100) -> list:
        """Generate a batch of customer records"""
        return [self.generate_customer() for _ in range(n)]
    
    def generate_high_churn_risk_customer(self) -> Dict[str, Any]:
        """Generate a customer with high churn probability"""
        customer = self.generate_customer()
        
        # Modify to increase churn risk
        customer['Age'] = random.randint(45, 65)  # Older customers
        customer['IsActiveMember'] = 0  # Inactive
        customer['NumOfProducts'] = random.choice([3, 4])  # More products
        customer['Balance'] = 0.0  # No balance
        customer['Geography'] = 'Germany'  # Higher churn in Germany
        
        return customer
    
    def generate_low_churn_risk_customer(self) -> Dict[str, Any]:
        """Generate a customer with low churn probability"""
        customer = self.generate_customer()
        
        # Modify to decrease churn risk
        customer['Age'] = random.randint(25, 40)  # Younger customers
        customer['IsActiveMember'] = 1  # Active
        customer['NumOfProducts'] = random.choice([1, 2])  # Fewer products
        customer['Balance'] = round(random.uniform(50000, 150000), 2)  # Good balance
        customer['Geography'] = random.choice(['France', 'Spain'])
        
        return customer


# Singleton instance
_generator = CustomerDataGenerator()


def generate_single_customer() -> Dict[str, Any]:
    """Generate a single customer (convenience function)"""
    return _generator.generate_customer()


def generate_batch_customers(n: int = 100) -> list:
    """Generate batch of customers (convenience function)"""
    return _generator.generate_batch(n)


def generate_high_risk_customer() -> Dict[str, Any]:
    """Generate high churn risk customer"""
    return _generator.generate_high_churn_risk_customer()


def generate_low_risk_customer() -> Dict[str, Any]:
    """Generate low churn risk customer"""
    return _generator.generate_low_churn_risk_customer()


if __name__ == "__main__":
    # Test the generator
    print("Generating sample customers...")
    
    for i in range(3):
        customer = generate_single_customer()
        print(f"\nCustomer {i+1}:")
        for key, value in customer.items():
            print(f"  {key}: {value}")
    
    print("\n✓ Data generator working correctly")
