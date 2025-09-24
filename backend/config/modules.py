
import os
import json
import requests
from config.database import getSessionLocal
from sqlalchemy import Column, Integer, Unicode, DateTime, ForeignKey, TEXT, Table, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from elasticsearch import Elasticsearch

Base = declarative_base()

class Permission(Base):
    __tablename__ = 'permissions'
    access_id = Column(Unicode(50), nullable=False, primary_key=True)

class SupportsCard(Base):
    __tablename__ = 'supports_card'
    chatbot_id = Column(Integer, primary_key=True, autoincrement=True)
    email_user = Column(Unicode(255), nullable=True)
    inputs_data = Column(TEXT, nullable=True)
    responses = Column(TEXT, nullable=True)
    create_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class Services(Base):
    __tablename__ = 'services'
    service_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Unicode(255), nullable=False)
    content = Column(Unicode(1500), nullable=True)
    image_url = Column(Unicode(1000), nullable=True)
    create_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

blog_tags = Table(
    "blog_tags",
    Base.metadata,
    Column("blog_id", ForeignKey("blogs.blog_id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.tag_id"), primary_key=True)
)

class Tags(Base):
    __tablename__ = 'tags'
    tag_id = Column(Integer, primary_key=True, autoincrement=True)
    tag_content = Column(Unicode(50), nullable=False)

class Users(Base):
    __tablename__ = 'users'
    id = Column(Unicode(255), primary_key=True, nullable=False)
    nickname = Column(Unicode(30), unique=True, nullable=False)
    avatar_img = Column(Unicode(1000), nullable=True)
    session_key = Column(Unicode(255), unique=True, nullable=False)
    create_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    blogs = relationship("Blogs", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comments", back_populates="author", cascade="all, delete-orphan")
    likes = relationship("Likes", back_populates="user", cascade="all, delete-orphan")
    comment_likes = relationship("CommentLikes", back_populates="user", cascade="all, delete-orphan")


class Blogs(Base):
    __tablename__ = 'blogs'
    blog_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Unicode(255), nullable=False)
    blog_content = Column(TEXT, nullable=True)
    cover_img = Column(ARRAY(Unicode(1000)), nullable=True)
    public_id = Column(Unicode(255), unique=True, index=True) 
    create_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    update_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    lang = Column(Unicode(10), nullable=True)
    user_id = Column(Unicode(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    author = relationship("Users", back_populates="blogs")
    comments = relationship("Comments", back_populates="blog", cascade="all, delete-orphan")
    likes = relationship("Likes", back_populates="blog", cascade="all, delete-orphan")

Blogs.tags = relationship("Tags", secondary=blog_tags, back_populates="blogs")
Tags.blogs = relationship("Blogs", secondary=blog_tags, back_populates="tags")

class Likes(Base):
    __tablename__ = 'likes'
    like_id = Column(Integer, primary_key=True, autoincrement=True)
    blog_id = Column(Integer, ForeignKey('blogs.blog_id'), nullable=False)
    user_id = Column(Unicode(255), ForeignKey('users.id'), nullable=False)
    create_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("Users", back_populates="likes")
    blog = relationship("Blogs", back_populates="likes")

    __table_args__ = (UniqueConstraint("user_id", "blog_id", name="unique_blog_like"),)


class Comments(Base):
    __tablename__ = 'comments'
    cmt_id = Column(Integer, primary_key=True, autoincrement=True)
    blog_id = Column(Integer, ForeignKey('blogs.blog_id'), nullable=False)
    user_id = Column(Unicode(255), ForeignKey('users.id'), nullable=False)
    content = Column(TEXT, nullable=True)
    create_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    update_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    author = relationship("Users", back_populates="comments")
    blog = relationship("Blogs", back_populates="comments")
    likes = relationship("CommentLikes", back_populates="comment", cascade="all, delete-orphan")

class CommentLikes(Base):
    __tablename__ = "comment_likes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Unicode(255), ForeignKey("users.id", ondelete="CASCADE"))
    comment_id = Column(Integer, ForeignKey("comments.cmt_id", ondelete="CASCADE"))
    create_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("Users", back_populates="comment_likes")
    comment = relationship("Comments", back_populates="likes")

    __table_args__ = (UniqueConstraint("user_id", "comment_id", name="unique_comment_like"),)


class Contacts(Base):
    __tablename__ = 'contacts'
    contact_id = Column(Integer, primary_key=True, autoincrement=True)
    fullname = Column(Unicode(255), nullable=False)
    email = Column(Unicode(255), nullable=False)
    phone_number = Column(Unicode(30), nullable=False)
    messages = Column(Unicode(1500), nullable=True)
    create_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


def load_tags_from_file():
    secret_path = Path("/etc/secrets/seed_data.json")

    if secret_path.exists():
        path = secret_path
    else:
        print("Not found path file!")

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def seed_tags():
    db = getSessionLocal()
    try:
        count = db.query(Tags).count()
        if count == 0:
            tags = load_tags_from_file()
            for tag in tags:
                db.add(Tags(tag_content=tag))
            db.commit()
            print("Tags inserted successfully")
        else:
            print("Tags already exist, skipping insert")
    except Exception as e:
        db.rollback()
        print(f"Error seeding tags: {e}")
        raise
    finally:
        db.close()


def seed_blogs_from_url():
    try:
        load_dotenv()
        es_host = os.getenv("ELASTICSEARCH_API")
        es_key = os.getenv("ELASTICSEARCH_API_KEY")
        BLOG_SEED_URL = os.getenv("BLOG_SEED_URL")

        es_cloud = Elasticsearch(
            es_host,
            api_key=es_key
        )

        index_name = "bloggen-idx20"
        db = getSessionLocal()
        res = requests.get(BLOG_SEED_URL, timeout=10)
        res.raise_for_status()
        data = res.json()

        for blog in data:
            try:
                current_datetime = datetime.now(timezone.utc)
                date = current_datetime.date()
                exist_user = db.query(Users).filter_by(id=blog["user_id"]).first()
                if not exist_user:
                    new_user = Users(
                        id = blog["user_id"],
                        nickname = blog["nickname"],
                        avatar_img = blog["avatar_img"],
                        session_key = blog["session_key"],
                        create_at = date
                    )
                    db.add(new_user)
                exists = db.query(Blogs).filter_by(public_id=blog["public_id"]).first()
                if not exists:
            
                    new_blog = Blogs(
                        title = blog["title"],
                        blog_content=blog["blog_content"],
                        cover_img=blog["cover_img"],
                        public_id = blog["public_id"],
                        create_at = date,
                        update_at = date,
                        lang = blog["lang"],
                        user_id = blog["user_id"]
                    )
                    blog_idx = {
                        "nickname":blog["nickname"],
                        "title": blog["title"],
                        "blog_content": blog["blog_content"],
                        "cover_img": blog["cover_img"],
                        "public_id": blog["public_id"],
                        "create_at": date,
                        "update_at": date,
                        "lang": blog["lang"],
                        "user_id": blog["user_id"]
                    }
                    db.add(new_blog)
                    db.flush()
                    es_cloud.index(
                        index=index_name,
                        id=new_blog.blog_id,
                        document=blog_idx
                    )
                    db.commit()
            except Exception as e:
                db.rollback()
                print(f"Error: {e}")
    except Exception as e:
        print(f"❌ Error seeding blogs: {e}")