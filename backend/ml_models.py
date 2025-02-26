import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import numpy as np
import os
import joblib

class ExpensePredictor:
    def __init__(self):
        self.model = None

    def train_model(self):
        """Train a linear regression model and save it to a file."""
        # Sample data (replace this with real user data later)
        data = {
            'month': [1, 2, 3, 4, 5],  # Months as features
            'total_expenses': [1000, 1200, 1100, 1300, 1400]  # Total expenses as target
        }
        df = pd.DataFrame(data)

        # Train a simple linear regression model
        self.model = LinearRegression()
        self.model.fit(df[['month']], df['total_expenses'])

        # Save the model to a file
        joblib.dump(self.model, 'expense_predictor.pkl')
        print("Model trained and saved as 'expense_predictor.pkl'")

    def load_model(self):
        """Load the trained model from a file."""
        # Get the absolute path to the expense_predictor.pkl file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, 'expense_predictor.pkl')
        
        self.model = joblib.load(model_path)
        print("Model loaded from:", model_path)

    def predict(self, month: int):
        """Predict expenses for a given month."""
        if not self.model:
            raise ValueError("Model not loaded. Call load_model() first.")

        if month < 1 or month > 12:
            raise ValueError("Month must be between 1 and 12")

        prediction = self.model.predict(np.array([[month]]))
        return prediction[0]