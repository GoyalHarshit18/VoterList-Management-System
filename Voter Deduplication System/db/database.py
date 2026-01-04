from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Fix: Use pooler port 6543 since 5432 is closed. 
# Password: @Harshit@123 encoded as %40Harshit%40123
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:%40Harshit%40123@db.unbgqtdjrrcoohyzdfex.supabase.co:6543/postgres?sslmode=require")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)
