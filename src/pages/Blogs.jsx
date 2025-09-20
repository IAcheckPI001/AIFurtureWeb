

import { Link } from "react-router-dom";
import { useState, useRef, useEffect  } from "react";
import { useTranslation } from "react-i18next";
import styles from "../assets/css/Blogs.module.css"
import AutoResizeTextarea from "../hooks/AutoResizeTextarea.jsx";
import useEffectGetBlogs from "../hooks/useEffectGetBlogs.jsx";
import LimitText from "../components/LimitText.jsx";
import filterIcon from "../assets/icon/filterIco.png"
import useEffectGetTags from "../hooks/useEffectGetTags.jsx";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

function Blogs (){

    const MAX_SEARCH_LENGTH = 1000;

    const { t } = useTranslation();

    const frameRef = useRef(null);
    const [showAll, setShowAll] = useState(false);
    
    const [text, setText] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);

    const handleIconClick = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (frameRef.current && !frameRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    
    const {options, loading_tags, error_tags} = useEffectGetTags();
    const { data: blogs, loading, error } = useEffectGetBlogs();
    
    useEffect(() => {
        if (selectedTag) {
            setResults([]);
        }
    }, [selectedTag]);

    const filteredBlogs = selectedTag 
    ? blogs.filter(blog => 
        blog.tags && blog.tags.some(tag => tag?.value === selectedTag)
    ):
    blogs;
    

    const displayOptions = showAll ? options : options.slice(0, 10);

    const handleSearch = async (e) => {
        if (e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            if (searchTerm.trim() === "") return;
            const res = await axios.get(`${API_URL}/search?q=${searchTerm}`);
            setResults(res.data);
        }
    }


    return (
        <div className="width-100 container">
            <div className={styles.searchInput}>
                <div className="flex items-center" style={{width: "50vw"}}>
                    <AutoResizeTextarea
                        value={searchTerm}
                        placeholder= {t("blog_page.placeholderInput")}
                        maxLength={MAX_SEARCH_LENGTH}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_SEARCH_LENGTH) {
                                setSearchTerm(e.target.value)
                            }
                        }}
                        handleKey = {handleSearch}/>
                    <div className="relatire cursor-pointer radius-100">
                        <img id={styles.filterIco} onClick={handleIconClick} style={{height:"20px", width:"20px", marginTop:"8px", padding: "8px 10px", borderRadius:"10px"}} src={filterIcon} alt="filter" />
                        {isOpen && (
                            <div ref={frameRef} id={styles.frameFilter} className="flex flex-column">
                                <div style={{marginLeft:"18px"}}>
                                    <h4 style={{marginBottom:"16px"}}>{t("blog_page.filterTitle")}</h4>
                                    {displayOptions
                                    .map((tag) => (
                                        tag !== "etc" ? (
                                            <button onClick={() => setSelectedTag(tag.label)} className={styles.items} key={tag.id}>
                                                {tag.label}
                                                {tag.count !== 0 && (
                                                    <span style={{marginLeft:"8px", padding:"0 5px", borderRadius:"14px", backgroundColor:"white", fontSize:"15px"}}>{tag.count}</span>
                                                )}
                                            </button>
                                        ) : (
                                            <button onClick={() => setSelectedTag(tag.label)} className={styles.items} key={tag.id}>all</button>
                                        )
                                    ))}
                                    {options.length > 10 && (
                                        <button style={{border:"none", background:"none", color:"#3069ba", padding:"8px", cursor:"pointer"}} onClick={() => setShowAll(!showAll)}>
                                            {showAll ? "Show Less" : "Show All"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center">
                    <Link className={styles.btnCreateBlog} to="/create-blog"> {t("blog_page.btnBlog")}</Link>
                </div>
            </div>
            <div id={styles.blogsFrame}>
                <div className="flex flex-column"> 
                    <h3 style={{marginBottom: "10px"}}>{t("blog_page.titleContent")}</h3>
                    <span style={{fontSize: "15px", marginLeft:"2px"}}>{t("blog_page.description")}</span>
                    <div className="flex flex-column" style={{marginTop:"10px"}}>
                       {(results.length > 0 ? results : filteredBlogs).map((blog) => (
                            <div className={styles.blogContent} key={blog.public_id}>
                                <Link id={styles.createBlog} to={`/blogs/${blog.public_id}`}>
                                    <div style={{marginLeft:"26px"}}>
                                        <div className="flex items-center">
                                            <img style={{borderRadius:"100%", width:"30px", height:"28px"}} className="img_user" src={blog.avatar_img || "https://res.cloudinary.com/dhbcyrfmw/image/upload/v1758181154/avatar_default_naxupt.png"} alt="" />
                                            <span className="nameID" style={{fontSize:"16px"}}>{blog.nickname}</span>
                                        </div>
                                        <p className={styles.createDate}>{new Date(blog.created_at).toLocaleString()}</p>
                                        <h2 style={{marginTop: "6px", marginBottom: "10px"}}>{blog.title}</h2>
                                        <div style={{marginRight:"20px"}}>
                                            <LimitText style={{fontSize:"16px"}} text={blog.blog_content} limit={250}/>
                                        </div>
                                        <div>
                                            {blog.imgURLs.length > 0 && (
                                                <div className="flex flex-wrap">
                                                    {blog.imgURLs.map((image, idx) => (
                                                        <img key={idx} className={styles.imgUpload} style={{height:"100px", maxWidth:"70%", maxHeight:"70%", marginLeft:"20px", marginTop:"15px"}} 
                                                        src={image} 
                                                        alt={idx}/>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}    
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Blogs