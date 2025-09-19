
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import avatar from "../assets/image/avatar_default.png"
import styles from "../assets/css/BlogID.module.css"
import SafeContent from "../hooks/DOMpurify";
import AutoResizeTextarea from "../hooks/AutoResizeTextarea";

function BlogID (){

    const { public_id } = useParams();
    const { t } = useTranslation();

    const [comment, setComment] = useState("");
    const [blog, setBlog] = useState(null);

    const [zoomImage, setZoomImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [translate, setTranslated] = useState(false);
    const [checkUpdateCmt, setCheckUpdate] = useState(false);
    
    
    useEffect(() => {
        if (!public_id) return;

        fetch(`http://localhost:8000/blogs/${public_id}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch blog");
            return res.json();
        })
        .then(data => setBlog(data))
        .catch(err => setError(err))
        .finally(() => setLoading(false));
    }, [public_id]);

    const handleComment = (e) => {
        if (e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            if (comment.trim() === "") return;
            setCheckUpdate(true);
        }
    }


    if (loading) return <p>Loading blog...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!blog) return <p>No blog found</p>;

    return (
        
        <div id={styles.blogframe} className="width-100 flex container">
            <div id={styles.blogContent}>
                <div className="width-100 flex jc-space-between">
                    <h2 style={{marginTop:"50px"}} className={styles.title} >{blog.title}</h2>
                    {blog.translated_content !== "" && (
                        <button className={styles.showTranslate} onClick={() => setTranslated(!translate)}>{translate ? t("blogID.showOrigin") : t("blogID.showTranslate")}</button>
                    )}
                </div>
                {translate ? 
                    <SafeContent html={blog.translated_content}/> : <SafeContent html={blog.blog_content}/>
                }
            </div>
            <div className="flex flex-column">
                <div id={styles.frameActor} className="flex flex-column relative">
                    <div className="flex width-100">
                        <div className="flex items-center" style={{ margin:"18px 0 0 18px"}}>
                            <img
                            style={{width:"30px", height:"28px", borderRadius:"100%"}}
                            src={blog.avatar_img}/>
                            <p style={{marginLeft:"10px", fontSize:"16px"}}>{blog.nickname}</p>
                        </div>
                    </div>
                    <div className="flex items-center" style={{marginLeft:"20px", marginTop:"8px"}}>
                        <span className={styles.label}>{t("blogID.createdDate")}</span>
                        <p id="create_date" style={{marginLeft:"8px"}}>{new Date(blog.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-column" style={{marginBottom:"8px", marginLeft:"20px", marginTop:"4px"}}>
                        <span className={styles.label}>{t("blogID.filterTitle")}</span>
                        <ul className="flex flex-wrap" style={{padding:"inherit", listStyle:"none", marginLeft:"0px"}}>
                        {blog.tags && blog.tags.map((tag) => (
                            <li key={tag?.id} style={{margin:"8px 4px"}}>
                                <span className={styles.items}>{tag?.value}</span>
                            </li> 
                        ))}
                        </ul>
                    </div>
                </div>
                <div style={{marginTop:"8px", width: "322px"}}>
                    <AutoResizeTextarea
                        value={comment}
                        placeholder= "Bạn nghĩ gì về bài viết blog?"
                        handleKey = {handleComment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    {checkUpdateCmt && (
                        <p style={{fontSize:"14px", marginLeft:"8px",color:"#1e9c99"}}>Tính năng đang được phát triển, sẽ được cập nhất sớm!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
export default BlogID;