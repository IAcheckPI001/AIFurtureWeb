
# main.py
from fastapi import FastAPI
from config.database import init_engine
from config.modules import Base, seed_tags
from fastapi.middleware.cors import CORSMiddleware
import time
from sqlalchemy.exc import OperationalError

def create_app():
    app = FastAPI()
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    engine = init_engine()

    for i in range(10):
        try:
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

            print("Tables created successfully")
            break
        except OperationalError:
            print("Database not ready, retrying...")
            time.sleep(3)
    
    seed_tags()

    from routers.chatbot import router as chatbot_router
    from routers.views import views as views_router
    from routers.auth import auth as auth_router
    from routers.services import services as services_router

    app.include_router(chatbot_router)
    app.include_router(views_router)
    app.include_router(auth_router)
    app.include_router(services_router)

    return app
