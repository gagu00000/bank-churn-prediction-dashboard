"""
Test the data generator
"""

from data_generator import generate_single_customer, generate_batch_customers

def test_single_customer():
    """Test single customer generation"""
    customer = generate_single_customer()
    
    print("Testing Single Customer Generation:")
    print("-" * 50)
    for key, value in customer.items():
        print(f"  {key:20s}: {value}")
    print("-" * 50)
    
    # Verify all required fields are present
    required_fields = [
        'CustomerId', 'Surname', 'CreditScore', 'Geography', 'Gender',
        'Age', 'Tenure', 'Balance', 'NumOfProducts', 'HasCrCard',
        'IsActiveMember', 'EstimatedSalary'
    ]
    
    for field in required_fields:
        assert field in customer, f"Missing field: {field}"
    
    print("✓ All required fields present")
    print("✓ Single customer generation test passed")


def test_batch_generation():
    """Test batch customer generation"""
    batch_size = 5
    customers = generate_batch_customers(batch_size)
    
    print(f"\nTesting Batch Generation ({batch_size} customers):")
    print("-" * 50)
    
    assert len(customers) == batch_size, f"Expected {batch_size} customers, got {len(customers)}"
    
    for i, customer in enumerate(customers, 1):
        print(f"Customer {i}:")
        print(f"  ID: {customer['CustomerId']}, Age: {customer['Age']}, "
              f"Geography: {customer['Geography']}, CreditScore: {customer['CreditScore']}")
    
    print("-" * 50)
    print(f"✓ Batch generation test passed ({batch_size} customers)")


if __name__ == "__main__":
    print("="*50)
    print("DATA GENERATOR TESTS")
    print("="*50)
    print()
    
    test_single_customer()
    test_batch_generation()
    
    print("\n" + "="*50)
    print("✓ ALL TESTS PASSED")
    print("="*50)
