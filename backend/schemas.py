from pydantic import BaseModel
from datetime import date

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