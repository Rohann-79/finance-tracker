import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import numpy as np
import os
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
import database
import models
from datetime import datetime

class ExpensePredictor:
    def __init__(self):
        self.model = None

    def train_model(self):
        """Train a linear regression model using real expense data from the database."""
        # Create a database session
        db = database.SessionLocal()
        try:
            # Query expenses grouped by month and calculate total expenses
            expenses = (
                db.query(
                    extract('month', models.Expense.date).label('month'),
                    func.sum(models.Expense.amount).label('total_expenses')
                )
                .group_by(extract('month', models.Expense.date))
                .all()
            )

            if not expenses:
                # If no data exists, use sample data as fallback
                data = {
                    'month': [1, 2, 3, 4, 5],
                    'total_expenses': [1000, 1200, 1100, 1300, 1400]
                }
            else:
                # Convert query results to dictionary format
                data = {
                    'month': [e[0] for e in expenses],
                    'total_expenses': [float(e[1]) for e in expenses]
                }

            df = pd.DataFrame(data)

            # Train a simple linear regression model
            self.model = LinearRegression()
            self.model.fit(df[['month']], df['total_expenses'])

            # Save the model to a file
            base_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(base_dir, 'expense_predictor.pkl')
            joblib.dump(self.model, model_path)
            print("Model trained and saved as 'expense_predictor.pkl'")
            
            # Print some model statistics
            print(f"Number of months of data used: {len(df)}")
            print(f"Average monthly expense: ${df['total_expenses'].mean():.2f}")
            
        finally:
            db.close()

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