from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'public'}  # Explicitly set the schema

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    expenses = relationship("Expense", back_populates="owner")

class Expense(Base):
    __tablename__ = 'expenses'
    __table_args__ = {'schema': 'public'}  # Explicitly set the schema

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey('public.users.id'))  # Use the full schema.table name

    owner = relationship("User", back_populates="expenses")