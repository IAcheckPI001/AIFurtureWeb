



import os
import uuid
from config.database import create_db
from utils.encrypt import create_sha256_hash
import config.modules as modules
from config.database import init_engine
from utils.checkInputs import isvalidEmail
from utils.emailService import generate_verification_code, email_notice
from datetime import datetime, timezone
from http.client import HTTPException

from fastapi.responses import JSONResponse
from fastapi import APIRouter, Request, Depends, Response
from dotenv import load_dotenv
from sqlalchemy.orm import Session

auth = APIRouter()

load_dotenv()
email_server = os.getenv("EMAIL_VERIFIED")
        
@auth.post("/verify_email")
async def verify_email(request: Request):
    try:
        data  = await request.json() 
        email = data.get("email")
        if not isvalidEmail(email):
            raise HTTPException(status_code=400, detail="Invalid email address")
        code = generate_verification_code()
        email_notice(email_server, email, code)
        return {"code": code}
    except Exception as e:
        print("verify_email error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@auth.post("/check_email")
async def check_email(request: Request, db: Session = Depends(create_db)):
    data = await request.json()
    user_key = data.get("email")
    if isvalidEmail(user_key):
        try:
            user = db.query(modules.Users).filter(modules.Users.id == user_key).first()
            if user:
                return {"msg": "exist"}
            else:
                return {"msg": "notExist"}
        except Exception as err:
            db.rollback()
            raise HTTPException(status_code=400, detail="Login failed session")
    return False


@auth.post("/check_account")
async def check_account(response: Response, request: Request, db: Session = Depends(create_db)):
    data = await request.json()
    user_key = data.get("user_key")
    hashed_pass = create_sha256_hash(data.get("passkey"))
    if isvalidEmail(user_key):
        try:
            user = db.query(modules.Users).filter(modules.Users.id == user_key).first()
            if user:
                auth = db.query(modules.Users).filter(modules.Users.passkey == hashed_pass).first()
                if auth:
                    if user.session_key is None:
                        ss_key = str(uuid.uuid4())
                        user.login_failed = 0
                        user.session_key = ss_key
                        db.commit()
                        db.refresh(user)
                        response = JSONResponse(content = {"msg": "success"})
                        response.set_cookie(
                            key="ss_key",
                            value= user.session_key,
                            httponly=True,
                            secure=True,
                            samesite="None"
                        )
                        return response
                    else:
                        return {"msg": "conflict"}
                else:
                    user.login_failed += 1
                    db.commit()
                    db.refresh(user)
                    if user.login_failed > 3:
                        return {"msg": "verify", "ss_verify": user.id}
                    return {"msg": "loginFailed"}
            else:
                return {"msg": "notUser"}
        except Exception as err:
            db.rollback()
            raise HTTPException(status_code=400, detail="Login failed session")
    else:
        try:
            user = db.query(modules.Users).filter(modules.Users.nickname == user_key).first()
            if user:
                auth = db.query(modules.Users).filter(modules.Users.passkey == hashed_pass).first()
                if auth:
                    if user.session_key is None:
                        ss_key = str(uuid.uuid4())
                        user.login_failed = 0
                        user.session_key = ss_key
                        db.commit()
                        db.refresh(user)

                        response = JSONResponse(content = {"msg": "success"})
                        response.set_cookie(
                            key="ss_key",
                            value= user.session_key,
                            httponly=True,
                            secure=True,
                            samesite="None"
                        )
                        
                        return response
                    else:
                        return {"msg": "conflict"}
                else:
                    user.login_failed += 1
                    db.commit()
                    db.refresh(user)
                    if user.login_failed > 3:
                        return {"msg": "verify", "ss_verify": user.id}
                    return {"msg": "loginFailed"}
            else:
                return {"msg": "notUser"}
        except Exception as err:
            db.rollback()
            raise HTTPException(status_code=400, detail="Login failed session")



@auth.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(create_db)):
    ss_key = request.cookies.get("ss_key")
    if not ss_key:
        raise HTTPException(status_code=401, detail="Not logged in")
    user = db.query(modules.Users).filter(modules.Users.session_key == ss_key).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    user.session_key = None
    db.commit()
    response.delete_cookie("ss_key")

    return {"msg": "LoggedOut"}

@auth.get("/check-session")
def get_current_user(request: Request, db: Session = Depends(create_db)):
    session_id = request.cookies.get("ss_key")

    session = db.query(modules.Users).filter(modules.Users.session_key == session_id).first()
    if session:
        return {"authenticated": True, "nickname": session.nickname, "avatar_img": session.avatar_img, "session_id": session.session_key}

    return {"authenticated": False}
