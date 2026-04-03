"""
Project Verification Script
Checks if all required files and dependencies are in place
"""

import os
import sys
from pathlib import Path
import importlib

def check_python_version():
    """Check Python version"""
    print("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 11:
        print(f"  ✓ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"  ✗ Python {version.major}.{version.minor} (requires 3.11+)")
        return False

def check_dependencies():
    """Check if required Python packages are installed"""
    print("\nChecking Python dependencies...")
    
    required = [
        'fastapi',
        'uvicorn',
        'pandas',
        'numpy',
        'sklearn',
        'xgboost',
        'joblib',
        'faker'
    ]
    
    missing = []
    for package in required:
        try:
            if package == 'sklearn':
                importlib.import_module('sklearn')
            else:
                importlib.import_module(package)
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} (missing)")
            missing.append(package)
    
    if missing:
        print(f"\n  To install missing packages:")
        print(f"  pip install {' '.join(missing)}")
        return False
    return True

def check_files():
    """Check if required files exist"""
    print("\nChecking required files...")
    
    required_files = [
        'churn data.csv',
        'requirements.txt',
        'docker-compose.yml',
        'README.md',
        'backend/app.py',
        'backend/train_models.py',
        'backend/data_generator.py',
        'frontend/package.json',
        'frontend/src/App.jsx',
        'frontend/src/main.jsx'
    ]
    
    all_exist = True
    for file_path in required_files:
        path = Path(file_path)
        if path.exists():
            print(f"  ✓ {file_path}")
        else:
            print(f"  ✗ {file_path} (missing)")
            all_exist = False
    
    return all_exist

def check_models():
    """Check if ML models are trained"""
    print("\nChecking ML models...")
    
    models_dir = Path('models')
    required_models = [
        'random_forest_model.joblib',
        'xgboost_model.joblib',
        'preprocessor.joblib'
    ]
    
    models_trained = True
    for model_file in required_models:
        model_path = models_dir / model_file
        if model_path.exists():
            print(f"  ✓ {model_file}")
        else:
            print(f"  ⚠ {model_file} (not trained)")
            models_trained = False
    
    if not models_trained:
        print("\n  To train models:")
        print("  cd backend && python train_models.py")
    
    return models_trained

def check_data():
    """Check dataset"""
    print("\nChecking dataset...")
    
    data_path = Path('churn data.csv')
    if not data_path.exists():
        print("  ✗ churn data.csv not found")
        return False
    
    try:
        import pandas as pd
        df = pd.read_csv(data_path)
        print(f"  ✓ Dataset loaded: {len(df)} records")
        print(f"  ✓ Columns: {len(df.columns)}")
        return True
    except Exception as e:
        print(f"  ✗ Error loading dataset: {e}")
        return False

def check_docker():
    """Check Docker installation"""
    print("\nChecking Docker...")
    
    try:
        import subprocess
        result = subprocess.run(['docker', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"  ✓ {result.stdout.strip()}")
            
            # Check Docker Compose
            result = subprocess.run(['docker-compose', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                print(f"  ✓ {result.stdout.strip()}")
                return True
        else:
            print("  ⚠ Docker not found (optional)")
            return False
    except:
        print("  ⚠ Docker not found (optional)")
        return False

def print_summary(checks):
    """Print verification summary"""
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)
    
    total = len(checks)
    passed = sum(checks.values())
    
    for name, status in checks.items():
        symbol = "✓" if status else "✗"
        print(f"  {symbol} {name}")
    
    print("="*60)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✅ All checks passed! Project is ready.")
        print("\nNext steps:")
        print("  1. Train models: cd backend && python train_models.py")
        print("  2. Start app: docker-compose up --build")
        print("  3. Access: http://localhost:5173")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        print("\nFor help, see:")
        print("  - README.md")
        print("  - TROUBLESHOOTING.md")
        print("  - QUICKSTART.md")

def main():
    """Run all verification checks"""
    print("="*60)
    print("BANK CHURN DASHBOARD - PROJECT VERIFICATION")
    print("="*60)
    print()
    
    checks = {
        'Python Version': check_python_version(),
        'Python Dependencies': check_dependencies(),
        'Required Files': check_files(),
        'Dataset': check_data(),
        'ML Models': check_models(),
        'Docker (optional)': check_docker()
    }
    
    print_summary(checks)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nVerification cancelled by user.")
    except Exception as e:
        print(f"\n\nError during verification: {e}")
        print("Please check your setup and try again.")
