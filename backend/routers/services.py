
import os
import time
import asyncio
from config import modules
from config.database import create_db
from config.conn import cloudinary 
# from typing import List

# from flask import send_from_directory, abort
from fastapi import APIRouter, File, UploadFile, Request, Query, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from elasticsearch import Elasticsearch
from dotenv import load_dotenv


load_dotenv()

# es_host = os.getenv("ELASTICSEARCH_HOST", "http://localhost:9200")
# es = AsyncElasticsearch(es_host)

es_host = os.getenv("ELASTICSEARCH_API")
es_key = os.getenv("ELASTICSEARCH_API_KEY")

services = APIRouter()

es_cloud = Elasticsearch(
    es_host,
    api_key=es_key
)

index_name = "bloggen-idx20"

@services.get("/intro-stream")
async def homePage():
    intro_text = "We are working hard to bring you a great experience. Stay tuned!"
    words = intro_text.split(" ")
    def generate_sse():
        for sub in words:
            yield f"data: {sub}\n\n"
            time.sleep(0.05)
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(generate_sse(), media_type="text/event-stream")


@services.post("/upload_images")
async def upload_image(file: UploadFile = File(...)):
    try:
        result = cloudinary.uploader.upload(file.file, folder="blog_images")
        image_url = result.get("secure_url")
        public_id = result.get("public_id")

        return {"image_url": image_url, "public_id":public_id}
    except Exception as e:
        return {"error": str(e)}


@services.get("/search/")
async def search_blogs(q: str = Query(..., min_length=1), db: Session = Depends(create_db)):
    loop = asyncio.get_event_loop()
    res = await loop.run_in_executor(
        None,
        lambda: es_cloud.search(
            index=index_name,
            body={
                "query": {
                    "multi_match": {
                        "query": q,
                        "fields": ["nickname", "title", "blog_content"],
                        "type": "most_fields"
                    }
                }
            },
            size=15
        )
    )
    results = []

    for hit in res["hits"]["hits"]:
        blog = (
            db.query(modules.Blogs)
            .filter(modules.Blogs.blog_id == hit["_source"]["id"])
            .first()
        )
        if blog:
            results.append(
                {
                    "nickname": blog.author.nickname,
                    "avatar_img": blog.author.avatar_img,
                    "title": blog.title,
                    "blog_content": blog.blog_content,
                    "imgURLs": blog.cover_img,
                    "public_id": blog.public_id,
                    "lang": blog.lang,
                    "created_at": blog.create_at.isoformat(),
                    "update_at": blog.update_at.isoformat()
                }
            )


    return results



@services.get("/search-ss/")
async def search_blogs_user(request: Request, q: str = Query(..., min_length=1, max_length=1000), db: Session = Depends(create_db)):
    session_id = request.cookies.get("ss_key")
    if session_id is None:
        return None
    user = db.query(modules.Users).filter(modules.Users.session_key == session_id).first()
    if user:
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(
            None,
            lambda: es_cloud.search(
                index=index_name,
                body={
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "multi_match": {
                                        "query": q,
                                        "fields": ["title", "blog_content"],
                                        "type": "most_fields"
                                    }
                                }
                            ],
                            "filter": [
                                {
                                    "term": {"nickname": user.nickname}
                                }
                            ]
                        }
                    }
                }
            )
        )

        ids = [hit["_source"]["id"] for hit in res["hits"]["hits"]]
        blogs = db.query(modules.Blogs).filter(modules.Blogs.blog_id.in_(ids)).all()

        blog_map = {b.blog_id: b for b in blogs}

        results = []
        for hit in res["hits"]["hits"]:
            blog_id = hit["_source"]["id"]
            blog = blog_map.get(blog_id)
            if blog:
                results.append({
                    "nickname": blog.author.nickname,
                    "avatar_img": blog.author.avatar_img,
                    "title": blog.title,
                    "blog_content": blog.blog_content,
                    "imgURLs": blog.cover_img,
                    "public_id": blog.public_id,
                    "lang": blog.lang,
                    "created_at": blog.create_at.isoformat(),
                    "update_at": blog.update_at.isoformat()
                })

        return results
    return None

# DOWNLOAD_FOLDER = os.path.join(os.getcwd(), "downloads")
# file_path = os.path.join(DOWNLOAD_FOLDER, "ARPSecurityApp.zip")
# @services.get("/download-app")
# async def download_app():
#     print(DOWNLOAD_FOLDER)
#     file_path = os.path.join(DOWNLOAD_FOLDER, "ARPSecurityApp.zip")
#     if not os.path.exists(file_path):
#         print(file_path)
#         abort(404, description="File not found")
#     print(file_path)
#     return send_from_directory(DOWNLOAD_FOLDER, "ARPSecurityApp.zip", as_attachment=True)