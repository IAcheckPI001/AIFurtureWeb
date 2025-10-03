


import os
from datetime import datetime, timezone

from openai import OpenAI
from fastapi import Request, Depends, APIRouter
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import config.modules as modules
from config.database import create_db
from services.infor import getChunksInFile
from dotenv import load_dotenv

router = APIRouter()
load_dotenv()
OpenAI_API_KEY = os.getenv("OpenAI_API_KEY")
Infor = getChunksInFile()

client = OpenAI(
  api_key=OpenAI_API_KEY
)

@router.post("/chatbot")
async def chat(request: Request, db: Session = Depends(create_db)):
    data = await request.json()
    user_message = data.get("message")
    def stream():
        try:
            with client.chat.completions.stream(
                model="gpt-4.1-mini",
                messages=[{"role": "system", "content": "Answer the user using natural the following documents only:\n" + "\n".join(Infor)},
                          {"role": "user", "content": user_message}]
            ) as stream:
                for event in stream:
                    if event.type == "content.delta":
                        text = getattr(event, "delta", None)
                        yield text
        except Exception as e:
            print("Error:", e)
    
    # response = "".join(stream())

    # current_datetime = datetime.now(timezone.utc)
    # date = current_datetime.date()
    # time = current_datetime.ctime()
    # modules.Base.metadata.create_all(bind=engine)
    
    # new_content = modules.Chatbot(id_user = "", inputs_user = user_message, respones_chatbot = response, date_cre = date, time_cre = time )

    # db.add(new_content)
    # db.commit()

    return StreamingResponse(stream(), media_type="text/plain")

@router.get("/chats")
def get_chats(db: Session = Depends(create_db)):
    chats = db.query(modules.Chatbot).all()
    return [
        {
            "id_chatbot": chat.id_chatbot,
            "id_user": chat.id_user,
            "inputs_user": chat.inputs_user,
            "responses_chatbot": chat.respones_chatbot,
            "created_at": chat.time_cre.isoformat()
        }
        for chat in chats
    ]

