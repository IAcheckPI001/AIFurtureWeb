

import { Link } from "react-router-dom";
import { useState, useRef, useEffect  } from "react";
import { useTranslation } from "react-i18next";
import styles from "../assets/css/Blogs.module.css"
import AutoResizeTextarea from "../hooks/AutoResizeTextarea.jsx";
import useEffectGetBlogs from "../hooks/useEffectGetBlogs.jsx";
import LimitText from "../components/LimitText.jsx";
import filterIcon from "../assets/icon/filterIco.png"
import avatar from "../assets/image/avatar_default.png";
import imgUpload from "../assets/icon/image-upload.png";
import calendar from "../assets/icon/calendar.png"
import closeIcon from "../assets/icon/close.png";
import addScale from "../assets/icon/add.png";
import minusIcon from "../assets/icon/minus.png";
import reloadCode from "../assets/icon/reload.png";
import arrow_right from "../assets/icon/arrow_right.png";
import arrow_left from "../assets/icon/arrow_left.png";
import useEffectGetTags from "../hooks/useEffectGetTags.jsx";
import useEffectGetNicknames from "../hooks/useEffectGetNicknames.jsx";
import useEffectCheckSession from "../hooks/useEffectCheckSession.jsx";
import { checkAccount, logout } from "../services/chatbot.service.js";
import validatePassword from "../auth/checkPass.jsx";
import axios from "axios";
import Notification from "../components/notification/Notification.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function Blogs (){

    const MAX_SEARCH_LENGTH = 1000;
    const MAX_NICKNAME_LENGTH = 22;
    const MAX_EMAIL_LENGTH = 40;
    const MAX_PASSKEY_LENGTH = 50;

    const { t } = useTranslation();

    const frameRef = useRef(null);
    const frameRefUser = useRef(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [user_id, setUserKey] = useState("");
    const [passkey, setPass] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [codeInput, setCodeInput] = useState("");
    const [codeVerify, setCodeVerify] = useState("");
    const [uploadAvatar, setAvatar] = useState(null);
    const [urls, setUrls] = useState(null);
    const [limit, setLimit] = useState(250);
    const [zoomImage, setZoomImage] = useState(null);
    const [zoomIndex, setZoomIndex] = useState(null);

    
    const [scaleShow, setScaleFrame] = useState(false);
    const [scale, setScale] = useState(1);
    const editorRef = useRef(null);
    const [showAll, setShowAll] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [optionUser, setOptionUser] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [results, setResults] = useState([]);
    const [notif, setNotif] = useState(null);
    const [frameAccount, setCheckAcc] = useState(false);
    const [eventCheck, setCheckUser] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);
    const [existNickname, setCheckNickname] = useState(false);
    const [eventAuth, setEventAuth] = useState(false);
    const checkPass = validatePassword(passkey);


    const handleIconClick = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (frameRef.current && !frameRef.current.contains(event.target)) {
                setIsOpen(false);
            }
            if (frameRefUser.current && !frameRefUser.current.contains(event.target)) {
                setOptionUser(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 640) {
                setLimit(100);
            } else if (window.innerWidth <= 1024) {
                setLimit(180);
            } else {
                setLimit(250);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
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

    const { data: nicknameList, load, err } = useEffectGetNicknames();
    

    const displayOptions = showAll ? options : options.slice(0, 10);

    const handleSearch = async (e) => {
        if (e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            if (searchTerm.trim() === "") return;
            const res = await axios.get(`${API_URL}/search?q=${encodeURIComponent(searchTerm)}`);
            setResults(res.data);
        }
    }
    

    const menuOption = () => {
        setOptionUser(!optionUser);
    }

    const loginUser = () => {
        setCheckAcc(!frameAccount)
        setCheckUser("");
        setCodeVerify("");
    }

    const handleAuth = () => {
        setPass("");
        setEventAuth(!eventAuth);
    }

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const verifyCodeEmail = async (data) =>{
        try {
            const response = await fetch(`${API_URL}/verify_email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({"email": data}),
            });

            if (!response.ok) {
                throw new Error("Failed to send verification email");
            }
            const code = await response.json();
            setCodeVerify(code);
        }catch (err) {
            setNotif({ message: t("contact_page.error"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }
    }

    const resetCode = () => {
        if (eventAuth){
            if(!nickname.trim() || !email.trim() || !passkey.trim()){
                setNotif({ message: t("createUser.warningEmptyAccount"), type: "warning" });
                setTimeout(() => setNotif(null), 4000);
            }else{
                verifyCodeEmail(email);
                setNotif({ message: t("contact_page.waitCheck"), type: "waitCheck" });
                setTimeout(() => setNotif(null), 4000);
                setTimeLeft(30);
            }
        }else{
            if(!user_id.trim() || !passkey.trim()){
                setNotif({ message: t("createSession.warningEmpty"), type: "warning" });
                setTimeout(() => setNotif(null), 4000);
            }else{
                verifyCodeEmail(user_id);
                setNotif({ message: t("contact_page.waitCheck"), type: "waitCheck" });
                setTimeout(() => setNotif(null), 4000);
                setTimeLeft(30);
            }
        }
    }
    

    const createNewUser = async (data) =>{
        try {
            const response = await fetch(`${API_URL}/create_user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }catch (err) {
            console.log("Error sending message: ", err);
        }
    }

    const createUser = async () => {
        if (!nickname.trim() || !email.trim() || !passkey.trim()){
            setNotif({ message: t("createUser.warningEmptyAccount"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }else{
            try {
                if (nicknameList.includes(nickname)) {
                    setCheckNickname(true);
                }else{
                    setCheckNickname(false);
                    const check = await checkEmail(email);
                    if (check.msg === "notExist"){
                        if(checkPass.valid){
                            setCheckUser("");
                            if (codeVerify === ""){
                                verifyCodeEmail(email);
                                if (codeVerify.code !== ""){
                                    setTimeLeft(30);
                                    setNotif({ message: t("contact_page.waitCheck"), type: "waitCheck" });
                                    setTimeout(() => setNotif(null), 4000);
                                    const frameCode = document.getElementById("codeFrame");
                                    const frameInput = document.getElementById("verifyCode");
                                    frameCode.style.display = "flex";
                                    frameInput.style.border = "1px solid #6e9db1";
                                }
                            }else{
                                if (codeInput === codeVerify.code){
                                    await upload_avatar();
                                    const data = {
                                        "email":  email,
                                        "nickname": nickname,
                                        "passkey": passkey,
                                        "avatar_img": !urls ? "https://res.cloudinary.com/dhbcyrfmw/image/upload/v1758627287/avatar_default_ccdqc5.png": urls,
                                    };

                                    createNewUser(data);
                                    setCodeVerify("");
                                    setPass("");
                                    setNickname("");
                                    setEmail("");
                                    setCodeInput();
                                    setEventAuth(false);
                                    setNotif({ message: t("createUser.createSuccess"), type: "success" });
                                    setTimeout(() => {
                                        setNotif(null);
                                    }, 3000);
                                }else{
                                    setCodeInput("");
                                    const frameCode = document.getElementById("verifyCode");
                                    frameCode.style.border = "1px solid #ff9595";
                                }
                            }
                        }else{
                            setNotif({ message: t("createUser.invalidPass"), type: "warning" });
                            setTimeout(() => setNotif(null), 4000);
                        }
                    }else if (check.msg === "exist"){
                        setCheckUser(t("createUser.existEmail"));
                    }else{
                        setCheckUser(t("createUser.notFormatEmail"));
                    }
                    
                }
                
            }catch (error) {
                if (urls)
                    await deleteImage(urls.public_id);
                setNotif({ message: t("contact_page.error"), type: "error" });
                setTimeout(() => setNotif(null), 4000);
            }
        }
    }

    const deleteSession = async () => {
        const check = await logout();
        if (check.msg === "loggedOut"){
            window.location.reload();
        }else if(check.msg === "verify"){
            setNotif({ message: t("createSession.warningExpiredSession"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }
    }

    const login = async () => {
        setCheckUser("")
        if(!user_id.trim() || !passkey.trim()){
            setNotif({ message: t("createSession.warningEmpty"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }
        else{
            try{
                const check = await checkAccount(user_id, passkey);
                if (check.msg === "notUser") {
                    setCheckUser(t("createSession.notFoundUser"));
                }else if (check.msg === "conflict"){
                    setNotif({ message: t("createSession.conflictSession"), type: "warning" });
                    setTimeout(() => {
                        setNotif(null);
                    }, 3000);
                }else if (check.msg === "loginFailed"){
                    setCheckUser(t("createSession.invalidLogin"));
                }else if (check.msg === "verify"){
                    if (codeVerify === ""){
                        verifyCodeEmail(check.ss_verify);
                        if (codeVerify.code !== ""){
                            setTimeLeft(30);
                            setNotif({ message: t("contact_page.waitCheck"), type: "waitCheck" });
                            setTimeout(() => setNotif(null), 4000);
                            const frameCode = document.getElementById("codeFrame");
                            const frameInput = document.getElementById("verifyCode");
                            frameCode.style.display = "flex";
                            frameInput.style.border = "1px solid #6e9db1";
                        }
                    }else{
                        if (codeInput === codeVerify.code){
                            setCheckUser(t("createSession.invalidLogin"));
                        }else{
                            setCodeInput("");
                            const frameCode = document.getElementById("verifyCode");
                            frameCode.style.border = "1px solid #ff9595";
                            setCheckUser(t("createSession.wrongCodeVerify"));
                        }
                    }
                }else if(check.msg === "success"){
                    setNotif({ message: t("createSession.success"), type: "success" });
                    setCodeVerify("");
                    setTimeout(() => {
                        setNotif(null);
                        window.location.reload();
                    }, 3000);
                }
            }catch(Error){
                setNotif({ message: t("contact_page.error"), type: "warning" });
                setTimeout(() => setNotif(null), 4000);
            }
        }
    }

    const checkEmail = async (email) => {
        try{
            const response = await fetch(`${API_URL}/check_email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({"email": email}),
            });

            if (!response.ok) {
                throw new Error("Failed to send verification email");
            }
            const data = await response.json();

            return data
        }catch (err) {
            setNotif({ message: t("contact_page.error"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        
        if (file){
            setAvatar({
                file,
                preview: URL.createObjectURL(file),
            });
        }

        setScaleFrame(true);
        
        e.target.value = "";
    };

    const minusScale = () => {
        if (scale > 1){
            setScale(scale - 0.1);
        }
    }

    const plusScale = () => {
        if (scale < 3){
            setScale(scale + 0.1);
        }
    }

    const handleSave = () => {
        if (editorRef.current) {
            setAvatar(null);
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob((blob) => {
                setAvatar({
                    blob,
                    preview: URL.createObjectURL(blob),
                });
                const formData = new FormData();
                formData.append("file", blob);
            });
            setScaleFrame(false);
        }
    };

    const upload_avatar = async () => {
        if (uploadAvatar){
            try{
                const formData = new FormData();
                formData.append("file", uploadAvatar.blob, "avatar.png");
                const response = await fetch(`${API_URL}/upload_images`, {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();
                setUrls(data)
            }catch (err){
                setNotif({ message: t("contact_page.error"), type: "warning" });
                setTimeout(() => setNotif(null), 4000);
            }
        }else{
            setUrls(null);
        }
        
    };

    const removeImage = () => {
        setAvatar(null);
    };

    async function deleteImage(public_id) {
        await cloudinary.uploader.destroy(public_id);
    }


    const handleNext = (length) => {
        setZoomIndex((prev) => (prev + 1) % length);
    };

    const handlePrev = (length) => {
        setZoomIndex((prev) =>
            prev === 0 ? length - 1 : prev - 1
        );
    };

    const { data: ss_user, loadSession, errorSession } = useEffectCheckSession();
    if (loadSession) return <p>Loading...</p>;
    if (errorSession) return <p>Error: {errorSession.message}</p>;



    return (
        <div className="width-100 container">
            {frameAccount && (
                <div id="frameAccount" style={{backgroundColor:"#00000069"}} className="fixed inset-0 width-100 flex jc-center items-center z-index-1000">
                    {notif && <Notification message={notif.message} type={notif.type} />}
                    {scaleShow && (
                        <div className="flex flex-column height-auto" style={{padding:"18px 20px", backgroundColor:"black", borderRadius:"8px", marginRight:"18px"}}>
                            <AvatarEditor
                                ref={editorRef}
                                image={uploadAvatar.preview}
                                width={200}
                                height={200}
                                border={50}
                                borderRadius={100} // circle crop
                                scale={scale}
                            />
    
                            <div className="flex items-center" style={{margin:"8px 0"}}>
                                <button style={{background:"none"}} onClick={minusScale}>
                                    <img src={minusIcon} className={styles.iconScale} alt=""/>
                                </button>
                                <input
                                    style={{width:"80%", height:"6px", outline: "none", margin:"0 8px"}}
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.1"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                />
                                <button style={{background:"none"}} onClick={plusScale}>
                                    <img src={addScale} className={styles.iconScale} alt=""/>
                                </button>
                            </div>
                            <div className="width-100 flex jc-center">
                                <button onClick={handleSave} id={styles.btnSaveScale}>{t("newBlog.btnScale")}</button>
                            </div>
                        </div>
                    )}
                    {eventAuth ? (
                        <div style={{width: "450px", height:"auto", backgroundColor:"#ffffff", borderRadius:"10px", paddingLeft: "34px"}} className="flex flex-column jc-center">
                            <div className="flex jc-end" style={{margin:"15px 15px 0 0"}}>
                                <img className={styles.closeFrame} style={{padding:"8px", borderRadius:"100%", width:"22px", height:"22px"}}
                                    src={closeIcon} 
                                    alt=""
                                    onClick={loginUser} />
                            </div>
                            <h1 style={{marginBottom:"28px", marginTop:"8px"}}>{t("createSession.signUpbtn")}</h1>
                            <div className="flex items-center" style={{marginRight:"24px", marginBottom:"10px"}}>
                                <div className="relative">
                                    <img
                                        className="cursor-pointer"
                                        style={{width:"58px", height:"58px", borderRadius:"100%"}}
                                        src={uploadAvatar ? uploadAvatar.preview : avatar}
                                        alt="Your avatar"
                                        onClick={() => setZoomImage(uploadAvatar.preview)}/>
                                    
                                    <label style={{top: "34px", left: "32px"}} className="cursor-pointer flex items-center width-auto absolute">
                                        <img className={styles.imgUpload} src={imgUpload} alt="Upload avatar" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            placeholder="Upload image"
                                        />
                                    </label>
                                </div>
                                <p style={{marginLeft:"15px", fontSize:"18px", marginTop:"8px"}}>{nickname || t("newBlog.yourNickname")}</p>
                            </div>
                            <div className="flex flex-column" style={{margin: "11px 0"}}>
                                <label className={styles.label} htmlFor="nickname">{t("newBlog.nicknameLabel")}</label>
                                <input className={styles.inputNickname} 
                                    id="nickname" 
                                    type="text"
                                    maxLength={MAX_NICKNAME_LENGTH}
                                    onChange={(e) => {
                                        if (e.target.value.length <= MAX_NICKNAME_LENGTH) {
                                            setNickname(e.target.value)
                                        }
                                    }}
                                    />
                                {existNickname && (
                                    <span style={{fontSize:"14px", color:"#670a0a"}}>{t("createUser.existNickname")}</span>
                                )}
                            </div>
                            <div className="flex flex-column" style={{margin: "10px 22px 8px 0"}}>
                                <label className={styles.label} htmlFor="email">{t("newBlog.emailLabel")}<span style={{color:"red"}}>*</span></label>
                                <input className={styles.inputEmail} id="email" type="email"
                                    maxLength={MAX_EMAIL_LENGTH}
                                    onChange={(e) => {
                                        if (e.target.value.length <= MAX_EMAIL_LENGTH) {
                                            setEmail(e.target.value)
                                        }
                                    }}
                                    placeholder="example@gmail.com" required/>
                            </div>
                            {eventCheck.trim() && (
                                <span style={{fontSize:"14px", color:"#670a0a"}}>{eventCheck}</span>
                            )}
                            <div className="flex flex-column" style={{margin: "10px 22px 16px 0"}}>
                                <label className={styles.label} htmlFor="passkey">{t("createUser.passLabel")}<span style={{color:"red"}}>*</span></label>
                                <input className={styles.inputEmail} id="passkey" type="password"
                                    maxLength={MAX_PASSKEY_LENGTH}
                                    onChange={(e) => {
                                        if (e.target.value.length <= MAX_PASSKEY_LENGTH) {
                                            setPass(e.target.value)
                                        }
                                    }}
                                    placeholder="#########" required/>
                            </div>
                            <ul style={{margin:"0", paddingLeft:"26px", marginBottom:"14px"}}>
                                {!checkPass.lengthOk ?(
                                    <li style={{margin:"0"}}>
                                        <span id="typeLength" style={{fontSize:"14px", color: "#2d2d2dff"}}>{t("createUser.checkLengthPass")}</span>
                                    </li>
                                ):(
                                    <li style={{margin:"0"}}>
                                        <span style={{fontSize:"14px", color:"#2d2d2dff", fontWeight:"600"}}>{t("createUser.checkLengthPass")}</span>
                                    </li>
                                )}
                                {!checkPass.hasDigit || !checkPass.hasLower || !checkPass.hasUpper || !checkPass.hasSpecial ?(
                                    <li style={{margin:"0"}}>
                                        <span id="typeFormat" style={{fontSize:"14px", color: "#2d2d2dff"}}>{t("createUser.checkFormatPass")}</span>
                                    </li>
                                ):(
                                    <li style={{margin:"0"}}>
                                        <span style={{fontSize:"14px", color:"#2d2d2dff", fontWeight:"600"}}>{t("createUser.checkFormatPass")}</span>
                                    </li>
                                )}
                            </ul>
                    
                            <div id="codeFrame" className="flex flex-column" style={{display:"none", marginBottom:"18px"}}>
                                <label className={styles.label} htmlFor="verifyCode">{t("createUser.verifyCode")}<span style={{color:"red"}}>*</span></label>
                                <div className="flex items-center">
                                    <input className={styles.inputCode} id="verifyCode" type="text" placeholder="######" onChange={(e) => setCodeInput(e.target.value)} required/>
                                    {timeLeft > 0 ? (
                                        <p style={{marginLeft:"12px", fontSize:"14px", color:"#606060ff"}}>{t("createUser.resendCode")} {timeLeft}s</p>
                                    ): (
                                        <img style={{padding:"8px", borderRadius:"100%", width:"20px", height:"20px", marginLeft:"2px", cursor:"pointer"}}
                                            onClick={resetCode} src={reloadCode} 
                                            disabled={timeLeft > 0}>
                                        </img>
                                    )}
                                </div>
                                {eventCheck.trim() && (
                                    <span style={{fontSize:"14px", color:"#670a0a"}}>{eventCheck}</span>
                                )}
                            </div>
                            
                            <div className="flex jc-space-between" style={{margin:"6px 28px 28px 0"}}>
                                <span style={{fontSize:"14px", marginLeft:"6px"}}>{t("createUser.loginLabel")} <span className="cursor-pointer" style={{color: "#0058a5"}} onClick={handleAuth}> {t("createUser.loginbtn")}</span></span>
                                <button id={styles.submit} onClick={createUser}>{t("createUser.btnSignUp")}</button>
                            </div>
                        </div>
                    ):(
                        <div style={{width: "450px", height:"auto", backgroundColor:"#ffffff", borderRadius:"10px", paddingLeft: "34px"}} className="flex flex-column jc-center">
                            <div className="flex jc-end" style={{margin:"15px 15px 0 0"}}>
                                <img className={styles.closeFrame} style={{padding:"8px", borderRadius:"100%", width:"22px", height:"22px"}}
                                    src={closeIcon} 
                                    alt=""
                                    onClick={loginUser} />
                            </div>
                            <h1 style={{marginBottom:"28px", marginTop:"8px"}}>{t("createSession.loginTitle")}</h1>
                            
                            <div className="flex flex-column" style={{margin: "13px 0"}}>
                                <label className={styles.label} htmlFor="user_key">{t("createSession.usernameLabel")}</label>
                                <input className={styles.inputNickname} 
                                    id="user_key" 
                                    type="text"
                                    maxLength={MAX_EMAIL_LENGTH}
                                    onChange={(e) => {
                                        if (e.target.value.length <= MAX_EMAIL_LENGTH) {
                                            setUserKey(e.target.value)
                                        }
                                    }}
                                    placeholder={t("createSession.placeholderUser")} required
                                    />
                            </div>
                            <div className="flex flex-column" style={{margin: "10px 22px 16px 0"}}>
                                 <label className={styles.label} htmlFor="passkey">{t("createSession.passLabel")}</label>
                                <input className={styles.inputEmail} id="passkey" type="password"
                                    maxLength={MAX_PASSKEY_LENGTH}
                                    onChange={(e) => {
                                        if (e.target.value.length <= MAX_PASSKEY_LENGTH) {
                                            setPass(e.target.value)
                                        }
                                    }}
                                    placeholder="#########" required/>
                            </div>
                            <div id="codeFrame" className="flex flex-column" style={{display:"none", marginBottom:"16px"}}>
                                <label className={styles.label} htmlFor="verifyCode">{t("createUser.verifyCode")}<span style={{color:"red"}}>*</span></label>
                                <div className="flex items-center">
                                    <input className={styles.inputCode} id="verifyCode" type="text" placeholder="######" onChange={(e) => setCodeInput(e.target.value)} required/>
                                    {timeLeft > 0 ? (
                                        <p style={{marginLeft:"12px", fontSize:"14px", color:"#606060ff"}}>{t("createUser.resendCode")} {timeLeft}s</p>
                                    ): (
                                        <img style={{padding:"8px", borderRadius:"100%", width:"20px", height:"20px", marginLeft:"2px", cursor:"pointer"}}
                                            onClick={resetCode} src={reloadCode} 
                                            disabled={timeLeft > 0}>
                                        </img>
                                    )}
                                </div>
                            </div>
                            {eventCheck.trim() && (
                                <span style={{fontSize:"14px", color:"#670a0a"}}>{eventCheck}</span>
                            )}
                            <span style={{fontSize:"14px"}}>{t("createSession.signUpLabel")} <span className="cursor-pointer" style={{color: "#0058a5"}} onClick={handleAuth}> {t("createSession.signUpbtn")}</span></span>
                        
                            <div className="flex jc-end" style={{margin:"6px 28px 28px 0"}}>
                                <button id={styles.submit} onClick={login}>{t("createSession.loginTitle")}</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className={styles.searchInput}>
                <div id={styles.frameSearch} className="flex items-center">
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
                                    <div id={styles.frameTag}>
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
                                    </div>
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
                <div className="flex">
                    <div id={styles.framebtnCreateBlog} className="flex items-center" style={{marginRight:"40px"}}>
                        <Link className={styles.btnCreateBlog} to="/create-blog"> {t("blog_page.btnBlog")}</Link>
                    </div>
                    <div id={styles.userOption} className="flex items-center relative">
                    {ss_user ? (
                        <>
                            <img style={{height:"34px", borderRadius:"100%", cursor:"pointer"}} onClick={menuOption} src={ss_user.avatar_img} alt={ss_user.nickname} />
                            {optionUser && (
                                <div ref={frameRefUser} id={styles.frameUser} className="flex flex-column">
                                    <Link to="/manage-blogs"><button className={styles.btnOption}>Blogs</button></Link>
                                    <button className={styles.btnOption}>Services</button>
                                    <button className={styles.btnOption} onClick={deleteSession}>Log out</button>
                                </div>
                            )}
                        </>
                    ):(
                        <img style={{height:"34px", borderRadius:"100%", cursor:"pointer"}} onClick={loginUser} src={avatar} alt="login" />
                    )}
                    </div>
                </div>
            </div>
            <div id={styles.blogsFrame}>
                <div className="flex flex-column"> 
                    <h3 style={{marginBottom: "10px"}}>{t("blog_page.titleContent")}</h3>
                    <span style={{fontSize: "1.23m", marginLeft:"2px"}}>{t("blog_page.description")}</span>
                    <div className="flex flex-column" style={{marginTop:"10px"}}>
                       {(results.length > 0 ? results : filteredBlogs).map((blog) => (
                            <div className={styles.blogContent} key={blog.public_id}>
                                <div style={{border: "1px solid var(--color-border)"}} className={styles.content}>
                                    <Link id={styles.createBlog} className="flex" to={`/blogs/${blog.public_id}`}>
                                        <div style={{margin:"15px 12px 14px 21px"}}>
                                            <div className="flex items-center">
                                                <img style={{borderRadius:"100%", width:"30px", height:"28px"}} className="img_user" src={blog.avatar_img || "https://res.cloudinary.com/dhbcyrfmw/image/upload/v1758181154/avatar_default_naxupt.png"} alt="" />
                                                <span className="nameID" style={{fontSize:"16px"}}>{blog.nickname}</span>
                                                <div className="flex items-center" style={{marginLeft:"17px", marginTop:"2px"}}>
                                                    <img style={{width:"16px", height:"16px", marginRight:"6px"}} src={calendar} alt="date_created" />
                                                    <p className={styles.createDate}>{new Date(blog.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <h2 style={{fontSize: "1.33em", margin: ".33em 0 !important"}}>{blog.title}</h2>
                                            <div style={{marginRight:"20px"}}>
                                                <LimitText style={{fontSize:"1.2em"}} text={blog.blog_content} limit={limit}/>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                {blog.imgURLs.length > 0 && (
                                <>
                                    <span style={{fontSize: ".8em", margin: "8px 0 0 10px", fontWeight:"600"}}>Danh sách ảnh</span>
                                    <div className={styles.frameImages}>
                                        {blog.imgURLs
                                        .slice(0, 2)
                                        .map((image, idx) => (
                                            <img key={idx} className={styles.imgUpload}  
                                            src={image} 
                                            alt={idx}
                                            onClick={() => setZoomIndex(idx)}/>
                                        ))}
                                    </div>
                                </>
                                )}
                            </div>
                        ))}    
                    </div>
                </div>
            </div>
            {zoomIndex && (
                (results.length > 0 ? results : filteredBlogs).map((blog) => (
                    <div className="fixed inset-0 width-100 flex jc-center items-center"
                        style={{backgroundColor:"#00000085", zIndex:"1001"}}
                        onClick={() => setZoomIndex(null)}>
                        <div className="flex jc-center items-center">
                            <img style={{width:"32px", height:"32px"}} src={arrow_left} onClick={() => handlePrev(blog.imgURLs.length)} alt="image_before" />
                            <img
                                style={{width:"auto", padding:"84px", maxWidth:"90%", maxHeight:"90%"}}
                                src={blog.imgURLs[zoomIndex]}
                                alt="Zoom"
                            />
                            <img style={{width:"32px", height:"32px"}} src={arrow_right} onClick={() => handleNext(blog.imgURLs.length)} alt="image_before" />
                        </div>
                    </div>
                ))
            )}
            {zoomImage && (
                <div className="fixed inset-0 width-100 flex jc-center"
                    style={{backgroundColor:"#00000085", zIndex:"1001"}}
                    onClick={() => setZoomImage(null)}>
                    <img
                        style={{width:"auto", padding:"84px", maxWidth:"90%", maxHeight:"90%"}}
                        src={zoomImage}
                        alt="Zoom"
                    />
                </div>
            )}
        </div>
    );
}
export default Blogs