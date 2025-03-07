from plaid import ApiClient, Configuration
from datetime import datetime, timedelta
from models import BankTransaction, BankAccount
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Plaid client
configuration = Configuration(
    host="https://sandbox.plaid.com" if os.getenv('PLAID_ENV') == 'sandbox' else "https://development.plaid.com",
    api_key={
        'clientId': os.getenv('PLAID_CLIENT_ID'),
        'secret': os.getenv('PLAID_SECRET')
    }
)
client = ApiClient(configuration)

class PlaidService:
    def __init__(self, db: Session):
        self.db = db

    async def exchange_token(self, public_token: str, user_id: int):
        try:
            exchange_response = client.Item.public_token.exchange(public_token)
            access_token = exchange_response['access_token']
            
            # Store access_token securely (you should encrypt this)
            # This is just an example, implement proper secure storage
            return access_token
        except Exception as e:
            raise Exception(f"Error exchanging Plaid token: {str(e)}")

    async def fetch_transactions(self, access_token: str, user_id: int):
        try:
            # Get transactions for the last 90 days
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')

            response = client.Transactions.get(
                access_token,
                start_date=start_date,
                end_date=end_date
            )

            accounts = response['accounts']
            transactions = response['transactions']

            # Store accounts
            for account in accounts:
                db_account = BankAccount(
                    user_id=user_id,
                    account_number=account['mask'],
                    bank_name=account['name'],
                    account_type=account['type'],
                    balance=account['balances']['current']
                )
                self.db.add(db_account)
                self.db.commit()
                self.db.refresh(db_account)

            # Store transactions
            for transaction in transactions:
                # Categorize transaction
                category = self._categorize_transaction(transaction['category'])
                importance = self._determine_importance(category, transaction['amount'])

                db_transaction = BankTransaction(
                    user_id=user_id,
                    account_id=db_account.id,  # You might want to match this more precisely
                    date=datetime.strptime(transaction['date'], '%Y-%m-%d'),
                    amount=transaction['amount'],
                    description=transaction['name'],
                    merchant=transaction['merchant_name'],
                    category=category,
                    importance=importance,
                    notes=f"Imported from {transaction['category'][0]}"
                )
                self.db.add(db_transaction)

            self.db.commit()
            return {"message": "Transactions imported successfully"}

        except Exception as e:
            self.db.rollback()
            raise Exception(f"Error fetching transactions: {str(e)}")

    def _categorize_transaction(self, plaid_categories):
        # Map Plaid categories to your categories
        category_mapping = {
            'Bank Fees': 'essential',
            'Transfer': 'misc',
            'Credit Card': 'essential',
            'Payment': 'misc',
            'Food and Drink': 'essential',
            'Groceries': 'essential',
            'Entertainment': 'entertainment',
            'Shopping': 'shopping',
            'Travel': 'transport',
            'Healthcare': 'healthcare',
            'Education': 'education',
            'Investment': 'savings'
        }

        # Get the primary category from Plaid
        primary_category = plaid_categories[0] if plaid_categories else 'misc'
        return category_mapping.get(primary_category, 'misc')

    def _determine_importance(self, category, amount):
        # Logic to determine transaction importance
        if category in ['essential', 'healthcare']:
            return 'necessary'
        elif category in ['education', 'savings']:
            return 'important'
        elif category in ['entertainment', 'shopping'] and amount > 100:
            return 'optional'
        elif amount > 200 and category not in ['essential', 'healthcare', 'education', 'savings']:
            return 'wasteful'
        return 'optional' 