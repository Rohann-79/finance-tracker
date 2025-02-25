from database import engine, Base
from models import User, Expense

# Create all tables
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")