from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import models
import schemas
import database
from ml_models import ExpensePredictor
from transaction_analyzer import TransactionAnalyzer
from plaid_service import PlaidService, client as plaid_client
from typing import List, Optional
from pydantic import BaseModel

# FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# ML model
predictor = ExpensePredictor()
predictor.load_model()

# Security
SECRET_KEY = "Rohann@123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication dependency
async def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Pydantic model to handle request validation for /predict/
class PredictRequest(BaseModel):
    month: int

# Routes
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)

    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login/")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/expenses/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == expense.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if expense.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    db_expense = models.Expense(amount=expense.amount, category=expense.category, date=expense.date, user_id=expense.user_id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.get("/expenses/", response_model=list[schemas.Expense])
def get_expenses(db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).all()
    return expenses

@app.post("/predict/")
def predict_expense(payload: PredictRequest):
    try:
        month = payload.month
        prediction = predictor.predict(month)
        return {"predicted_expense": prediction}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/bank-accounts/", response_model=schemas.BankAccount)
def create_bank_account(
    account: schemas.BankAccountCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_account = models.BankAccount(**account.dict())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@app.get("/bank-accounts/{user_id}", response_model=List[schemas.BankAccount])
def get_user_bank_accounts(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these accounts")
    accounts = db.query(models.BankAccount).filter(models.BankAccount.user_id == user_id).all()
    return accounts

@app.post("/transactions/", response_model=schemas.BankTransaction)
def create_transaction(
    transaction: schemas.BankTransactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != transaction.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create transactions for this user")
    
    account = db.query(models.BankAccount).filter(
        models.BankAccount.id == transaction.account_id,
        models.BankAccount.user_id == transaction.user_id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found or doesn't belong to the user")

    # Convert the transaction data to dict and update the category and importance to use enum values
    transaction_data = transaction.dict()
    transaction_data['category'] = models.TransactionCategory[transaction_data['category'].upper()]
    transaction_data['importance'] = models.TransactionImportance[transaction_data['importance'].upper()]

    db_transaction = models.BankTransaction(**transaction_data)
    db.add(db_transaction)
    
    account.balance += transaction.amount
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/{user_id}", response_model=List[schemas.BankTransaction])
def get_user_transactions(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these transactions")
    transactions = db.query(models.BankTransaction).filter(
        models.BankTransaction.user_id == user_id
    ).order_by(models.BankTransaction.date.desc()).all()
    return transactions

@app.get("/analysis/spending-patterns/{user_id}", response_model=schemas.SpendingAnalysis)
def get_spending_patterns(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this analysis")
    analyzer = TransactionAnalyzer(db, user_id)
    return analyzer.get_spending_patterns()

@app.get("/analysis/wasteful-spending/{user_id}", response_model=List[schemas.WastefulTransaction])
def get_wasteful_spending(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this analysis")
    analyzer = TransactionAnalyzer(db, user_id)
    return analyzer.identify_wasteful_spending()

@app.get("/analysis/savings-opportunities/{user_id}", response_model=List[schemas.SavingsOpportunity])
def get_savings_opportunities(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this analysis")
    analyzer = TransactionAnalyzer(db, user_id)
    return analyzer.get_savings_opportunities()

@app.get("/analysis/monthly-summary/{user_id}", response_model=schemas.MonthlySummary)
def get_monthly_summary(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this analysis")
    analyzer = TransactionAnalyzer(db, user_id)
    return analyzer.get_monthly_summary()

# Plaid routes
@app.post("/plaid/create_link_token")
async def create_link_token(user_id: int):
    try:
        configs = {
            'user': {
                'client_user_id': str(user_id)
            },
            'client_name': 'Finance Tracker',
            'products': ['transactions'],
            'country_codes': ['US'],
            'language': 'en'
        }
        response = plaid_client.LinkToken.create(configs)
        return {"link_token": response['link_token']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plaid/exchange_token")
async def exchange_public_token(
    public_token: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        plaid_service = PlaidService(db)
        access_token = await plaid_service.exchange_token(public_token, user_id)
        return {"access_token": access_token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plaid/fetch_transactions")
async def fetch_transactions(
    access_token: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        plaid_service = PlaidService(db)
        result = await plaid_service.fetch_transactions(access_token, user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/me", response_model=schemas.User)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user
