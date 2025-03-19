from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import models
from models import TransactionCategory, TransactionImportance
import pandas as pd
from sklearn.cluster import KMeans
import numpy as np

class TransactionAnalyzer:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def get_spending_patterns(self) -> Dict:
        """Analyze spending patterns by category."""
        transactions = (
            self.db.query(
                models.BankTransaction.category,
                func.sum(models.BankTransaction.amount).label('total_amount'),
                func.count(models.BankTransaction.id).label('transaction_count')
            )
            .filter(models.BankTransaction.user_id == self.user_id)
            .group_by(models.BankTransaction.category)
            .all()
        )

        return {
            'category_totals': {str(t.category): float(t.total_amount) for t in transactions},
            'category_counts': {str(t.category): int(t.transaction_count) for t in transactions}
        }

    def identify_wasteful_spending(self) -> List[Dict]:
        """Identify potentially wasteful transactions."""
        wasteful_transactions = (
            self.db.query(models.BankTransaction)
            .filter(
                models.BankTransaction.user_id == self.user_id,
                models.BankTransaction.importance == TransactionImportance.WASTEFUL
            )
            .order_by(models.BankTransaction.amount.desc())
            .all()
        )

        return [
            {
                'date': t.date,
                'amount': t.amount,
                'description': t.description,
                'merchant': t.merchant,
                'category': str(t.category)
            }
            for t in wasteful_transactions
        ]

    def get_savings_opportunities(self) -> List[Dict]:
        """Identify potential savings opportunities."""
        # Get transactions from the last 3 months
        three_months_ago = datetime.now() - timedelta(days=90)
        
        transactions = (
            self.db.query(models.BankTransaction)
            .filter(
                models.BankTransaction.user_id == self.user_id,
                models.BankTransaction.date >= three_months_ago,
                models.BankTransaction.importance.in_([
                    TransactionImportance.OPTIONAL,
                    TransactionImportance.WASTEFUL
                ])
            )
            .all()
        )

        # Group similar transactions
        df = pd.DataFrame([
            {
                'amount': t.amount,
                'category': str(t.category),
                'importance': str(t.importance)
            }
            for t in transactions
        ])

        if len(df) > 0:
            # Use KMeans to cluster similar spending patterns
            kmeans = KMeans(n_clusters=min(5, len(df)), random_state=42)
            df['cluster'] = kmeans.fit_predict(df[['amount']])

            opportunities = []
            for cluster in df['cluster'].unique():
                cluster_data = df[df['cluster'] == cluster]
                total_amount = cluster_data['amount'].sum()
                avg_amount = cluster_data['amount'].mean()
                transaction_count = len(cluster_data)

                if transaction_count >= 3:  # Only consider patterns with at least 3 transactions
                    opportunities.append({
                        'category': cluster_data['category'].mode()[0],
                        'total_amount': float(total_amount),
                        'average_amount': float(avg_amount),
                        'transaction_count': int(transaction_count),
                        'potential_savings': float(total_amount * 0.3),  # Suggest 30% reduction
                        'recommendation': self._generate_recommendation(
                            cluster_data['category'].mode()[0],
                            avg_amount,
                            transaction_count
                        )
                    })

            return opportunities
        return []

    def get_monthly_summary(self) -> Dict:
        """Get a monthly summary of spending and savings."""
        current_month = datetime.now().replace(day=1)
        
        # Get this month's transactions
        transactions = (
            self.db.query(models.BankTransaction)
            .filter(
                models.BankTransaction.user_id == self.user_id,
                models.BankTransaction.date >= current_month
            )
            .all()
        )

        total_spent = sum(t.amount for t in transactions)
        essential_spent = sum(t.amount for t in transactions if t.category == models.TransactionCategory.ESSENTIAL)
        savings = sum(t.amount for t in transactions if t.category == models.TransactionCategory.SAVINGS)
        wasteful_spent = sum(t.amount for t in transactions if t.importance == models.TransactionImportance.WASTEFUL)

        return {
            'total_spent': float(total_spent),
            'essential_expenses': float(essential_spent),
            'savings': float(savings),
            'wasteful_spending': float(wasteful_spent),
            'savings_rate': float(savings / total_spent if total_spent > 0 else 0),
            'essential_rate': float(essential_spent / total_spent if total_spent > 0 else 0)
        }

    def _generate_recommendation(self, category: str, avg_amount: float, frequency: int) -> str:
        """Generate personalized recommendations based on spending patterns."""
        if category == str(TransactionCategory.ENTERTAINMENT):
            return f"Consider reducing entertainment expenses (avg. ${avg_amount:.2f}, {frequency} times). Try finding free or lower-cost alternatives."
        elif category == str(TransactionCategory.SHOPPING):
            return f"Shopping expenses average ${avg_amount:.2f} ({frequency} transactions). Consider implementing a 24-hour rule before non-essential purchases."
        elif category == str(TransactionCategory.MISC):
            return f"You have {frequency} miscellaneous expenses averaging ${avg_amount:.2f}. Try categorizing these better to identify potential savings."
        else:
            return f"Consider if all {frequency} transactions in {category} (avg. ${avg_amount:.2f}) are necessary." 