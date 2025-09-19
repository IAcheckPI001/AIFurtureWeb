
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()
api_secure = os.getenv("api_secret")

cloudinary.config(
    cloud_name="dhbcyrfmw",
    api_key="467771123866264",
    api_secret=api_secure,
    secure=True
)
