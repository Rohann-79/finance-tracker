from pydantic import BaseModel
from datetime import date

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class ExpenseBase(BaseModel):
    amount: float
    category: str
    date: date

class ExpenseCreate(ExpenseBase):
    user_id: int

class Expense(ExpenseBase):
    id: int

    class Config:
        orm_mode = True