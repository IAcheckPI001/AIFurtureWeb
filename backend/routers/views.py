

import os
import time
import uuid
import asyncio
from utils.checkInputs import isNicknameKey, isvalidEmail
from config import modules
from config.conn import cloudinary 
from config.database import create_db
from utils.encrypt import generate_csrf_token
from datetime import datetime, timezone
from http.client import HTTPException
from langdetect import detect_langs

from openai import OpenAI
from fastapi import APIRouter, Depends, Request, File, UploadFile
from fastapi.responses import StreamingResponse
from config.database import init_engine
from dotenv import load_dotenv

from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from elasticsearch import Elasticsearch


views = APIRouter()

load_dotenv()
OpenAI_API_KEY = os.getenv("OpenAI_API_KEY")
# es_host_local = os.getenv("ELASTICSEARCH_HOST", "http://localhost:9200")
# es_local = AsyncElasticsearch(es_host_local)

es_host = os.getenv("ELASTICSEARCH_API")
es_key = os.getenv("ELASTICSEARCH_API_KEY")

es_cloud = Elasticsearch(
    es_host,
    api_key=es_key
)

index_name = "bloggen-idx20"


client = OpenAI(
  api_key=OpenAI_API_KEY
)


@views.get("/intro-stream")
async def homePage():
    intro_text = "We are working hard to bring you a great experience. Stay tuned!"
    words = intro_text.split(" ")
    def generate_sse():
        for sub in words:
            yield f"data: {sub}\n\n"
            time.sleep(0.05)
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(generate_sse(), media_type="text/event-stream")


@views.get("/get_nickname")
def getListNickname(db: Session = Depends(create_db)):
    users = (
        db.query(modules.Users.nickname).all()
    )
    users = [u[0] for u in users]
    
    return users

@views.post("/create_user")
async def create_user(request: Request, db: Session = Depends(create_db)):
    data = await request.json()
    email = data.get("email")
    nickname = data.get("nickname")
    user_img = data.get("avatar_img")
    passkey = data.get("passkey")

    if isvalidEmail(email) and isNicknameKey(nickname): 
        try:
            current_datetime = datetime.now(timezone.utc)
            date = current_datetime.date()
            new_user = modules.Users(
                id = email,
                nickname = nickname,
                passkey = passkey,
                avatar_img = user_img,
                session_key = None,
                login_failed = 0,
                create_at = date
            )
            db.add(new_user)  
            db.commit()
            db.refresh(new_user)
        except SQLAlchemyError as e:
            db.rollback()  
            print("Unexpected error:", e)
    else:
        db.rollback()
        print("Nickname or email is invalid!")
        return None


@views.post("/create_blog")
async def create_blog(request: Request, db: Session = Depends(create_db)):

    session_id = request.cookies.get("ss_key")
    if not session_id:
        return {"msg": "login"}
    else:
        data = await request.json()
        title = data.get("title")
        tags_id = data.get("tags")
        email = data.get("email")
        nickname = data.get("nickname")
        content = data.get("content")
        imgURLs = data.get("imgURLs", [])

        user = db.query(modules.Users).filter(modules.Users.id == email).first()
        if user.session_key == session_id:
            current_datetime = datetime.now(timezone.utc)
            date = current_datetime.date()

            try:
                detected = detect_langs(content)
                if detected:
                    language = detected[0].lang
                else:
                    language = None
            except LangDetectException:
                language = None

            try:
                new_blog = modules.Blogs(
                    title = title,
                    blog_content=content,
                    cover_img=imgURLs,
                    public_id = str(uuid.uuid4()),
                    create_at = date,
                    update_at = date,
                    lang = language,
                    user_id = email
                )

                blog_idx = {
                    "nickname":nickname,
                    "title": title,
                    "blog_content": content,
                    "cover_img": imgURLs,
                    "public_id": str(uuid.uuid4()),
                    "create_at": date,
                    "update_at": date,
                    "lang": language,
                    "user_id": email
                }
                
                try:
                    if (len(tags_id) > 0):
                        tags = db.query(modules.Tags).filter(modules.Tags.tag_id.in_(tags_id)).all()
                        if len(tags) != len(tags_id):
                            raise HTTPException(status_code=400, detail="One or more tags not found")
                    else:
                        etc_tag = db.query(modules.Tags).filter(modules.Tags.tag_content == "etc").first()
                        tags = [etc_tag] if etc_tag else []
                except:
                    raise HTTPException(status_code=400, detail="One or more tags not found")

                new_blog.tags = tags

                db.add(new_blog)

                loop = asyncio.get_event_loop()
                await loop.run_in_executor(
                    None,
                    lambda: es_cloud.index(
                        index=index_name,
                        id=new_blog.blog_id,
                        document=blog_idx
                    )
                )

                db.commit()
                db.refresh(new_blog)
            except SQLAlchemyError as e:
                db.rollback()  
                print("Unexpected error:", e)


@views.post("/create_contact")
async def create_blog(request: Request, db: Session = Depends(create_db)):
    data = await request.json()
    firstName = data.get("firstName")
    lastName = data.get("lastName")
    email = data.get("email")
    phone = data.get("phone")
    content = data.get("content")

    fullName = f"{firstName} {lastName}".strip()

    current_datetime = datetime.now(timezone.utc)
    date = current_datetime.date()


    try:
        new_contact = modules.Contacts(
            fullname = fullName,
            email = email,
            phone_number=phone,
            messages=content,
            create_at = date
        )

        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
    except SQLAlchemyError as e:
        db.rollback()  
        print("Unexpected error:", e)


@views.post("/upload_images")
async def upload_image(file: UploadFile = File(...)):
    try:
        result = cloudinary.uploader.upload(
            file.file,
            public_id=None,
            folder="blog_images/",
            overwrite=False
        )
        image_url = result.get("secure_url")
        public_id = result.get("public_id")
        return {"image_url": image_url, "public_id":public_id}
    except Exception as e:
        return {"error": str(e)}

@views.get("/blogs")
def get_blogs(user = Depends(get_current_user), db: Session = Depends(create_db)):
    blogs = (
        db.query(modules.Blogs).all()
    )

    data = []
    for blog in blogs:
        
        unique_tags = [(tag.tag_id, tag.tag_content) for tag in blog.tags]
        data.append({
            "nickname": blog.author.nickname,
            "avatar_img": blog.author.avatar_img,
            "title": blog.title,
            "blog_content": blog.blog_content,
            "imgURLs": blog.cover_img,
            "tags": [{"id": tag[0], "value": tag[1]} for tag in unique_tags],
            "public_id": blog.public_id,
            "language": blog.lang,
            "created_at": blog.create_at.isoformat(),
            "update_at": blog.update_at.isoformat(),
        })


    return data

@views.get("/get_tags")
def get_blogs(db: Session = Depends(create_db)):
    tags = (
        db.query(
            modules.Tags.tag_id,
            modules.Tags.tag_content,
            func.count(modules.blog_tags.c.blog_id).label("blog_count")
        )
        .outerjoin(
            modules.blog_tags, 
            modules.Tags.tag_id == modules.blog_tags.c.tag_id
        )
        .group_by(modules.Tags.tag_id, modules.Tags.tag_content)
        .all()
    )

        
    return [{"value": tag.tag_id, "label": tag.tag_content, "count": tag.blog_count} for tag in tags]

@views.get("/blogs/{public_id}")
def get_blog(public_id: str, request: Request, db: Session = Depends(create_db)):
    blog = (
        db.query(modules.Blogs)
        .filter(modules.Blogs.public_id == public_id)
        .first()
    )

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # if "language" in request.cookies:
    #     return request.cookies["language"]
    # accept_lang = request.headers.get("Accept-Language")
    # user_lang = accept_lang.split(",")[0][:2]

    translated_content = ""
    # if blog_obj.language != user_lang:
    #     prompt = f"Translate this from {blog_obj.language} to {user_lang}: {blog_obj.blog_content}"

    #     response = client.chat.completions.create(
    #         model="gpt-4o-mini",
    #         messages=[{"role": "user", "content": prompt}]
    #     )
    #     translated_content = response.choices[0].message.content
    return {
            "nickname": blog.author.nickname,
            "avatar_img": blog.author.avatar_img,
            "title": blog.title,
            "blog_content": blog.blog_content,
            "translated_content": translated_content,
            "imgURLs": blog.cover_img,
            "tags": [{"id": tag.tag_id, "value": tag.tag_content} for tag in blog.tags],
            "public_id": blog.public_id,
            "language": blog.lang,
            "created_at": blog.create_at.isoformat(),
            "update_at": blog.update_at.isoformat()
        }