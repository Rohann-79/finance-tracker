from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()

class TransactionCategory(enum.Enum):
    ESSENTIAL = "essential"  # Rent, utilities, groceries, etc.
    SAVINGS = "savings"      # Investments, savings deposits
    EDUCATION = "education"  # Courses, books, training
    HEALTHCARE = "healthcare"  # Medical expenses, insurance
    ENTERTAINMENT = "entertainment"  # Movies, games, dining out
    SHOPPING = "shopping"    # Clothes, electronics, etc.
    TRANSPORT = "transport"  # Fuel, public transport, car maintenance
    MISC = "misc"           # Other expenses

class TransactionImportance(enum.Enum):
    NECESSARY = "necessary"      # Essential for living/working
    IMPORTANT = "important"      # Valuable but not essential
    OPTIONAL = "optional"        # Could be avoided
    WASTEFUL = "wasteful"        # Should be reduced/eliminated

class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'public'}  # Explicitly set the schema

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    expenses = relationship("Expense", back_populates="owner")
    bank_transactions = relationship("BankTransaction", back_populates="owner")
    bank_accounts = relationship("BankAccount", back_populates="owner")

class Expense(Base):
    __tablename__ = 'expenses'
    __table_args__ = {'schema': 'public'}  # Explicitly set the schema

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey('public.users.id'))  # Use the full schema.table name

    owner = relationship("User", back_populates="expenses")

class BankAccount(Base):
    __tablename__ = 'bank_accounts'
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String, unique=True, index=True)
    bank_name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)  # checking, savings, etc.
    balance = Column(Float, default=0.0)
    user_id = Column(Integer, ForeignKey('public.users.id'))

    owner = relationship("User", back_populates="bank_accounts")
    transactions = relationship("BankTransaction", back_populates="account")

class BankTransaction(Base):
    __tablename__ = 'bank_transactions'
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    merchant = Column(String)
    category = Column(Enum(TransactionCategory), nullable=False)
    importance = Column(Enum(TransactionImportance), nullable=False)
    notes = Column(Text)  # For AI analysis and recommendations
    
    user_id = Column(Integer, ForeignKey('public.users.id'))
    account_id = Column(Integer, ForeignKey('public.bank_accounts.id'))

    owner = relationship("User", back_populates="bank_transactions")
    account = relationship("BankAccount", back_populates="transactions")