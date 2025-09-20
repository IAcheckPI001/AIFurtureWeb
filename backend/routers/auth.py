



import os
from config.database import create_db
from utils.encrypt import create_sha256_hash
import config.modules as modules
from config.database import init_engine
from utils.checkInputs import isvalidEmail
from utils.emailService import generate_verification_code, email_notice
from datetime import datetime, timezone
from http.client import HTTPException

from fastapi import APIRouter, Request
from dotenv import load_dotenv

auth = APIRouter()

load_dotenv()
email_server = os.getenv("EMAIL_USER")
password_ssmtp = os.getenv("EMAIL_PASSWORD")
        
@auth.post("/verify_email")
async def verify_email(request: Request):
    data  = await request.json() 
    email = data.get("email")
    if not isvalidEmail(email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    code = generate_verification_code()
    email_notice(email_server, password_ssmtp, email, code)
    return {"code": code}