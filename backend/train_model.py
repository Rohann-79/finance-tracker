import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models import ExpensePredictor
from database import engine, Base
import models

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    predictor = ExpensePredictor()
    predictor.train_model()
    print("Model training completed successfully!")