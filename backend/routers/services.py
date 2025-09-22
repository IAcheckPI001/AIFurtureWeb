
import os
import time
import asyncio
# from config import modules
from config.conn import cloudinary 
# from typing import List

# from flask import send_from_directory, abort
from fastapi import APIRouter, File, UploadFile, Query
from fastapi.responses import StreamingResponse

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
async def search_blogs(q: str = Query(..., min_length=1)):
    loop = asyncio.get_event_loop()
    res = await loop.run_in_executor(
        None,
        lambda: es_cloud.search(
            index=index_name,
            query={
                "multi_match": {
                    "query": q,
                    "fields": ["nickname", "title", "blog_content"],
                    "fuzziness": "AUTO"
                }
            }
        )
    )

    results = [
        {
            "title": hit["_source"]["title"],
            "blog_content": hit["_source"]["blog_content"],
            "imgURLs": hit["_source"]["cover_img"],
            "public_id": hit["_source"]["public_id"],
            "language": hit["_source"]["lang"],
            "created_at": hit["_source"]["create_at"],
            "update_at": hit["_source"]["update_at"]
        }
        for hit in res["hits"]["hits"]
    ]

    return results

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