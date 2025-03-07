from pydantic import BaseModel
from datetime import date
from typing import Optional, List
from enum import Enum

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(BaseModel):  # For login and signup
    username: str
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True  # Updated from `orm_mode = True` in Pydantic V2

class ExpenseBase(BaseModel):
    amount: float
    category: str
    date: date

class ExpenseCreate(ExpenseBase):
    user_id: int

class Expense(ExpenseBase):
    id: int

    class Config:
        from_attributes = True  # Updated from `orm_mode = True` in Pydantic V2

class TransactionCategoryEnum(str, Enum):
    ESSENTIAL = "essential"
    SAVINGS = "savings"
    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    ENTERTAINMENT = "entertainment"
    SHOPPING = "shopping"
    TRANSPORT = "transport"
    MISC = "misc"

class TransactionImportanceEnum(str, Enum):
    NECESSARY = "necessary"
    IMPORTANT = "important"
    OPTIONAL = "optional"
    WASTEFUL = "wasteful"

class BankAccountBase(BaseModel):
    account_number: str
    bank_name: str
    account_type: str
    balance: float

class BankAccountCreate(BankAccountBase):
    user_id: int

class BankAccount(BankAccountBase):
    id: int

    class Config:
        from_attributes = True

class BankTransactionBase(BaseModel):
    date: date
    amount: float
    description: str
    merchant: Optional[str] = None
    category: TransactionCategoryEnum
    importance: TransactionImportanceEnum
    notes: Optional[str] = None

class BankTransactionCreate(BankTransactionBase):
    user_id: int
    account_id: int

class BankTransaction(BankTransactionBase):
    id: int

    class Config:
        from_attributes = True

class SpendingAnalysis(BaseModel):
    category_totals: dict
    category_counts: dict

class WastefulTransaction(BaseModel):
    date: date
    amount: float
    description: str
    merchant: Optional[str]
    category: str

class SavingsOpportunity(BaseModel):
    category: str
    total_amount: float
    average_amount: float
    transaction_count: int
    potential_savings: float
    recommendation: str

class MonthlySummary(BaseModel):
    total_spent: float
    essential_expenses: float
    savings: float
    wasteful_spending: float
    savings_rate: float
    essential_rate: float