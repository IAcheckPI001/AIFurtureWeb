
import Chatbot from "./Chat.jsx";
import serivceImg from "../assets/image/service-back.png";
import styles from "../assets/css/Home.module.css"
import LimitText from "../components/LimitText.jsx";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useEffectGetBlogs from "../hooks/useEffectGetBlogs.jsx";

function Home (){

    const { t } = useTranslation();

    const { data: blogs, loading, error } = useEffectGetBlogs();

    return (
        <div className="container">
            <section id = {styles.section0} className="flex jc-space-around width-100">
                <Chatbot/>
            </section>

            <section id = {styles.section1} className="flex flex-column width-100">
                <div className="flex jc-center" style={{width:"80vw", marginTop: "8px", height: "78%", paddingTop: "37px"}}>
                    <div className="flex items-center" style={{marginRight: "58px", marginBottom:"50px"}}>
                        <img src="https://res.cloudinary.com/dhbcyrfmw/image/upload/v1758627288/service-back_pdu5kr.png" className={styles.serivceImg} alt="/other-services" />
                    </div>
                    <div className="flex flex-column" style={{width: "40vw", marginLeft: "8px"}}>
                        <h4 className={styles.sectionName}>{t("service_home.titleContent")}</h4>
                        <h2 className={styles.title}>{t("service_home.target")}</h2>
                        <div className="flex items-center width-100" style={{marginTop:"18px"}}>
                            <p style={{fontSize:"20px"}}>{t("service_home.description")}</p>
                        </div>
                        <div style={{marginTop:"30px"}}>
                            <Link to="/services">
                                <button className={styles.buttonService}>{t("service_home.btn")}</button>
                            </Link>
                        </div>
                    </div>
                    
                </div>
            </section>
            <section id={styles.section3}>
                <div className="flex flex-column items-center" style={{marginBottom: "35px"}}>
                    <span className={styles.sectionName}>{t("blog_home.titleContent")}</span>
                    <span style={{border: "1px solid #afababad", width: "15vw"}}/>
                    <p style={{marginTop: "15px", fontSize:"16px", color:"#434343", marginBottom:"0px"}}>{t("blog_home.description")}</p>
                </div>
                <div className= {styles.container}>
                    {blogs
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3)
                    .map((blog) => (
                        <Link style={{paddingBottom:"32px"}} className="flex flex-column flex-col-3 relative" key={blog.public_id} to={`/blogs/${blog.public_id}`}>
                            <div style={{marginBottom:"8px"}} className="flex items-center" >
                                <img className="img_user" src={blog.avatar_img} alt={blog.title} />
                                <span className={styles.idBlog}>{blog.nickname}</span>
                            </div>
                            <h3 style={{margin:".3em 0!important"}}>{blog.title}</h3>
                            <span style={{fontSize:"14px", fontWeight:600}}>{new Date(blog.created_at).toLocaleString()}</span>
                            <p style={{margin:"8px 0",fontSize:"16px"}} className={styles.description}>
                                <LimitText text = {blog.blog_content} limit = {150} />
                            </p>
                            <span style={{fontSize:"14px",marginTop:"8px", position:"absolute", bottom:"10px"}}>Likes - comments</span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home