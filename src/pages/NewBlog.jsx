

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CreatableSelect from "react-select/creatable";
import AvatarEditor from "react-avatar-editor";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import ImageResize from "quill-image-resize-module-react";
// Quill.register("modules/imageResize", ImageResize);

import SafeContent from "../hooks/DOMpurify.jsx";
import styles from "../assets/css/NewBlog.module.css";
import avatar from "../assets/image/avatar_default.png";
import imgUpload from "../assets/icon/image-upload.png";
import imgDefault from "../assets/image/service-back.png"
import closeIcon from "../assets/icon/close.png";
import addScale from "../assets/icon/add.png";
import minusIcon from "../assets/icon/minus.png";
import reloadCode from "../assets/icon/reload.png";
import Notification from "../components/notification/Notification.jsx";
import useEffectGetTags from "../hooks/useEffectGetTags.jsx";
import useEffectGetNicknames from "../hooks/useEffectGetNicknames.jsx";
import { checkAccount, checkSession } from "../services/chatbot.service.js";
import useEffectCheckSession from "../hooks/useEffectCheckSession.jsx";
import validatePassword from "../auth/checkPass.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function NewBlog (){
    const MAX_NICKNAME_LENGTH = 22;
    const MAX_EMAIL_LENGTH = 40;
    const MAX_TITLE_LENGTH = 60;
    const MAX_PASSKEY_LENGTH = 50;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [userKey, setUserKey] = useState("");
    const [passkey, setPasskey] = useState("");
    const [codeInput, setCodeInput] = useState("");
    const [codeVerify, setCode] = useState("");
    const [urls, setUrls] = useState(null);

    const [uploadAvatar, setAvatar] = useState(null);

    const navigate = useNavigate();
    const { t } = useTranslation();
    const quillRef = useRef(null);
    const [notif, setNotif] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const [existNickname, setCheckNickname] = useState(false);
    const editorRef = useRef(null);
    const [zoomImage, setZoomImage] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [eventCheck, setCheckUser] = useState("");
    const [eventAuth, setEventAuth] = useState(false);
    const [scaleShow, setScaleFrame] = useState(false);
    const [demoBlog, setDemoBlog] = useState(false);
    const checkPass = validatePassword(passkey);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const resetCode = () => {
        if(!nickname.trim() && !email.trim() && !passkey.trim()){
            setNotif({ message: t("newBlog.warningEmptyAccount"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }else{
            verifyCode(email);
            if(codeVerify.code !== ""){
                setNotif({ message: t("contact_page.waitCheck"), type: "waitCheck" });
                setTimeout(() => setNotif(null), 4000);
                setTimeLeft(30);
            }
        }
    }

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            ["code-block"], 
            ["link", "image", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
        ],
        };


    const {options, loading, error} = useEffectGetTags();

    const handleChange = (newValue) => {
        
        const updated = newValue.map(tag => {
            if (typeof tag.value === "string" && isNaN(tag.value)) {
                return { ...tag, label: "etc", value:1};
            }
            return tag;
        });
        setSelectedTags(updated);
    };


    const { data: nicknameList, load, err } = useEffectGetNicknames();

    const closeFrame = () => {
        setIsOpen(!isOpen);
        setCheckUser("");
        setCode("");
    }

    const handleAuth = () => {
        setEventAuth(!eventAuth);
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

    const { data: ss_user, loadSession, errorSession } = useEffectCheckSession();
    if (loadSession) return <p>Loading...</p>;
    if (errorSession) return <p>Error: {errorSession.message}</p>;

    const createUser = async () => {
        if (!nickname.trim() || !email.trim() || !passkey.trim()){
            setNotif({ message: t("newBlog.warningEmptyAccount"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }else{
            try {
                if (nicknameList.includes(nickname)) {
                    setCheckNickname(true);
                }else{
                    setCheckNickname(false);
                    const check = await checkEmail(email);
                    if (check.msg === "notExist"){
                        setCheckUser("");
                        if(checkPass.valid){
                            setCheckUser("");
                            if (codeVerify === ""){
                                verifyCode(email);
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
                                    setCode("");
                                    setPasskey("");
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
                        setCheckUser("Email đã được sử dụng!");
                    }else{
                        setCheckUser("Lỗi xác thực email! Vui lòng nhập đúng định dạng.");
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

    const login = async () => {
        setCheckUser("")
        if(!userKey.trim() || !passkey.trim()){
            setNotif({ message: t("newBlog.warningEmptyAccount"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }
        else{
            try{
                const check = await checkAccount(userKey, passkey);
                if (check.msg === "notUser") {
                    setCheckUser("Tài khoản không tồn tại!");
                }else if (check.msg === "conflict"){
                    setNotif({ message: "Tài khoản đang được đăng nhập nơi khác!", type: "warning" });
                    setTimeout(() => {
                        setNotif(null);
                    }, 3000);
                }else if (check.msg === "loginFailed"){
                    setCheckUser("Sai thông tin đăng nhập!");
                }else if (check.msg === "verify"){
                    if (codeVerify === ""){
                        verifyCode(check.ss_verify);
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
                            setCheckUser("Sai thông tin đăng nhập!");
                        }else{
                            setCodeInput("");
                            const frameCode = document.getElementById("verifyCode");
                            frameCode.style.border = "1px solid #ff9595";
                        }
                    }
                }else if(check.msg === "success"){
                    try {
                        const ss_user = await checkSession(); 
                        if (ss_user.authenticated) {
                            try {
                                const {html, uploadedUrls} = await uploadImages(content);
                                const data = {
                                    "title": title,
                                    "tags": selectedTags.map(tag => tag.value),
                                    "content": html,
                                    "imgURLs": uploadedUrls,
                                };
                                await sendMessage(data);
                                setNotif({ message: t("newBlog.success"), type: "success" });
                                setCode("");
                                setTimeout(() => {
                                    setNotif(null);
                                    navigate("/blogs");
                                }, 3000);
                            } catch (error) {
                                if (uploadedUrls && uploadedUrls.length > 0) {
                                    for (let img of uploadedUrls) {
                                        await deleteImage(img.public_id);
                                    }
                                }
                                setNotif({ message: "Hệ thống blog đang được cập nhật!", type: "error" });
                                setTimeout(() => setNotif(null), 4000);
                            }
                        }
                    } catch (error) {
                        setNotif({ message: "Hệ thống blog đang được cập nhật!", type: "error" });
                        setTimeout(() => setNotif(null), 4000);
                    }
                }
            }catch(Error){
                setNotif({ message: t("contact_page.error"), type: "warning" });
                setTimeout(() => setNotif(null), 4000);
            }
        }
    }
    


    const createBlog = async () => {
        if (!content.trim() || !title.trim()){
            setNotif({ message: t("newBlog.warningEmptyContent"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }
        else{
            const ss_user = await checkSession(); 
            if (ss_user.authenticated){
                try {
                    const {html, uploadedUrls} = await uploadImages(content);
                    const data = {
                        "title": title,
                        "tags": selectedTags.map(tag => tag.value),
                        "content": html,
                        "imgURLs": uploadedUrls,
                    };
                    sendMessage(data);
                    setNotif({ message: t("newBlog.success"), type: "success" });
                    setCode("");
                    setTimeout(() => {
                        setNotif(null);
                        navigate("/blogs");
                    }, 3000);
                } catch (error) {
                    if (uploadedUrls && uploadedUrls.length > 0) {
                        for (let img of uploadedUrls) {
                            await deleteImage(img.public_id);
                        }
                    }
                    setNotif({ message: "Hệ thống blog đang được cập nhật!", type: "error" });
                    setTimeout(() => setNotif(null), 4000);
                }
            }else{
                setIsOpen(true);
            }
        }
    }

    const verifyCode = async (data) =>{
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
            setCode(code);
        }catch (err) {
            setNotif({ message: t("contact_page.error"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
            setCode("")
        }
    }

    const sendMessage = async (data) =>{
        try {
            const response = await fetch(`${API_URL}/create_blog`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
        }catch (err) {
            console.log("Error sending message: ", err);
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

                setUrls(data);

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



    const uploadImages = async (html) => {
        const uploadedUrls = [];
        const div = document.createElement("div");
        div.innerHTML = html;

        const imageUrls = div.querySelectorAll("img");

        for (let img of imageUrls) {
            if (img.src.startsWith("data:")) {

                const blob = await fetch(img.src)
                    .then(res => res.blob())

                const ext = blob.type.split("/")[1] || "png";
                const file = new File([blob], `upload.${ext}`, { type: blob.type });

                const formData = new FormData();
                formData.append("file", file);

                try{
                    const response = await fetch(`${API_URL}/upload_images`, {
                        method: "POST",
                        body: formData
                    });

                    const data = await response.json();
                    img.src = data.image_url;

                    if (data.image_url) uploadedUrls.push(data.image_url);

                }catch (err){
                    setNotif({ message: t("contact_page.error"), type: "warning" });
                    setTimeout(() => setNotif(null), 4000);
                }

            } else {
                uploadedUrls.push(img.src);
            }
            
        }

        return {
            html: div.innerHTML,
            uploadedUrls
        };
    };

    const normalizeContent = (value) => {
        if (!value || value.trim() === "<p><br></p>") {
            setContent("");
        }else{
            setContent(value);
        }
    };

    async function deleteImage(public_id) {
        await cloudinary.uploader.destroy(public_id);
    }

    const watchBlog = () =>{
        setDemoBlog(!demoBlog);
    }

    return( 
    
        <div className="width-100 flex">
            {isOpen && (
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
                            borderRadius={100}
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
                    <div style={{width: "392px", height:"auto", backgroundColor:"#ffffff", borderRadius:"10px", paddingLeft: "34px"}} className="flex flex-column jc-center">
                        <div className="flex jc-space-between" style={{margin:"14px 15px 0px 0px"}}>
                            <h1 style={{marginBottom:"22px", marginTop:"14px"}}>{t("createSession.signUpbtn")}</h1>
                            <img className={styles.closeFrame} style={{padding:"8px", borderRadius:"100%", width:"22px", height:"22px"}}
                                src={closeIcon} 
                                alt=""
                                onClick={loginUser} />
                        </div>
                        <div className="flex items-center" style={{marginRight:"24px", marginBottom:"10px"}}>
                            <div className="relative">
                                <img
                                    className="cursor-pointer"
                                    style={{width:"50px", height:"50px", borderRadius:"100%"}}
                                    src={uploadAvatar ? uploadAvatar.preview : avatar}
                                    alt="Your avatar"
                                    onClick={() => setZoomImage(uploadAvatar.preview)}/>
                                
                                <label style={{top: "16px", left: "18px"}} className="cursor-pointer flex items-center width-auto absolute">
                                    <img style={{height:"28px", marginLeft:"16px", border: "none"}} className={styles.imgUpload} src={imgUpload} alt="Upload avatar" />
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
                        <ul style={{margin:"0px 38px 0px 8px", listStyle:"none", padding:"0"}}>
                            {!checkPass.lengthOk ?(
                                <li style={{marginTop:"6px"}} className="flex items-center">
                                    <img style={{width:"18px", height:"18px"}} className="radius-100" src={checkIcon} alt="" />
                                    <span id="typeLength" style={{fontSize:"14px", color: "#2d2d2dff", marginLeft:"8px"}}>{t("createUser.checkLengthPass")}</span>
                                </li>
                            ):(
                                <li style={{margin:"6px"}} className="flex items-center">
                                    <img style={{width:"18px", height:"18px"}} className="radius-100" src={checked} alt="" />
                                    <span style={{fontSize:"14px", color:"#2d2d2dff", fontWeight:"600", marginLeft:"8px"}}>{t("createUser.checkLengthPass")}</span>
                                </li>
                            )}
                            {!checkPass.hasDigit || !checkPass.hasLower || !checkPass.hasUpper || !checkPass.hasSpecial ?(
                                <li style={{margin:"6px"}} className="flex items-center">
                                    <img style={{width:"18px", height:"18px"}} className="radius-100" src={checkIcon} alt="" />
                                    <span id="typeFormat" style={{fontSize:"14px", color: "#2d2d2dff", marginLeft:"8px"}}>{t("createUser.checkFormatPass")}</span>
                                </li>
                            ):(
                                <li style={{margin:"6px"}} className="flex items-center">
                                    <img style={{width:"18px", height:"18px"}} className="radius-100" src={checked} alt="" />
                                    <span style={{fontSize:"14px", color:"#2d2d2dff", fontWeight:"600", marginLeft:"8px"}}>{t("createUser.checkFormatPass")}</span>
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
                        
                        <div className="flex jc-space-between" style={{margin:"6px 28px 18px 0px"}}>
                            <span style={{fontSize:"14px", marginLeft:"6px"}}>{t("createUser.loginLabel")} <span className="cursor-pointer" style={{color: "#0058a5"}} onClick={handleAuth}> {t("createUser.loginbtn")}</span></span>
                            <button id={styles.submit} onClick={createUser}>{t("createUser.btnSignUp")}</button>
                        </div>
                    </div>
                ):(
                    <div style={{width: "450px", height:"auto", backgroundColor:"#ffffff", borderRadius:"10px", paddingLeft: "34px"}} className="flex flex-column jc-center">
                        <div className="flex jc-space-between" style={{margin:"15px 15px 0 0"}}>
                            <h1 style={{marginBottom:"28px", marginTop:"8px"}}>{t("createSession.loginTitle")}</h1>
                            <img className={styles.closeFrame} style={{padding:"8px", borderRadius:"100%", width:"22px", height:"22px"}}
                                src={closeIcon} 
                                alt=""
                                onClick={loginUser} />
                        </div>
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
                        <div className="flex flex-column" style={{margin: "8px 22px 8px 0px"}}>
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
                        {eventCheck.trim() && (
                            <span style={{fontSize:"14px", color:"#670a0a", margin:"3px 0 12px 2px"}}>{eventCheck}</span>
                        )}
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
                            <span style={{fontSize:"14px", color:"#670a0a", margin:"3px 0 12px 2px"}}>{eventCheck}</span>
                        )}
                    
                        <div className="flex jc-space-between" style={{margin:"6px 28px 28px 0"}}>
                            <span style={{fontSize:"14px"}}>{t("createSession.signUpLabel")} <span className="cursor-pointer" style={{color: "#0058a5"}} onClick={handleAuth}> {t("createSession.signUpbtn")}</span></span>
                            <button id={styles.submit} onClick={login}>{t("createSession.loginTitle")}</button>
                        </div>
                    </div>
                )}
            </div>
            )}
            <div className="container width-100 flex jc-center">
                <div id={styles.frameCreateBlog} className="flex flex-column" style={{width:"58vw" ,marginTop:"40px", marginLeft:"62px"}}>
                    <div className="flex items-center jc-space-between" style={{width:"90%"}}>
                        <h1 style={{marginBottom:"22px"}}>{t("newBlog.titleNewBlog")}</h1>
                    </div>
                    
                    <div className="flex jc-space-between" style={{width:"68%", marginTop:"20px"}}>
                        <div className="flex flex-column jc-start" style={{marginRight:"20px"}}> 
                            <label className={styles.label} htmlFor="title">{t("newBlog.titleLabel")}</label>
                            <textarea className={styles.inputTitle} name="title" placeholder="Title" type="text"
                                maxLength={MAX_TITLE_LENGTH}
                                onChange={(e) => {
                                    if (e.target.value.length <= MAX_TITLE_LENGTH) {
                                        setTitle(e.target.value)
                                    }
                                }}/>
                        </div>
                        
                    </div>
                    <div id={styles.blockTags} className="flex flex-column jc-space-between" style={{width:"16vw"}}>
                        <label style={{marginTop:"14px",marginBottom:"10px"}}>{t("newBlog.topicLabel")}</label>
                        <CreatableSelect
                            isMulti
                            options={options}
                            value={selectedTags}  
                            onChange={(e) => {handleChange(e)}}
                            placeholder={t("newBlog.placeholderTags")}
                        />
                    </div>
                    <div id={styles.blockContent} className="flex flex-column" style={{marginTop: "20px", width:"50vw", marginBottom:"50px"}}>
                        <ReactQuill ref={quillRef} modules={modules} style={{margin:"5px 0"}} 
                            onChange={normalizeContent}
                            id={styles.contentFrame} 
                            placeholder={t("newBlog.placeholderContent")} 
                            required/>
                    </div>

                    <div id={styles.btnCreateBlog} className="flex jc-end" style={{margin:"18px 0px 25px 0px"}}>
                        <button id={styles.btnDemoBlog} onClick={watchBlog}>{t("newBlog.btnSubmit")}</button>
                        <button id={styles.btnSubmit} onClick={createBlog}>{t("newBlog.btnSubmit")}</button>
                    </div>
                </div>
                {demoBlog &&(
                    <div id={styles.frameDemoBlog} className="width-100 flex flex-column">
                        <div class={styles.blogContent}>
                            <div className="flex width-100">
                                {nickname ? (
                                <div className="flex items-center">
                                    <img
                                    style={{width:"32px", height:"32px", borderRadius:"100%", cursor:"pointer"}}
                                    src={uploadAvatar ? uploadAvatar.preview : avatar}
                                    alt={nickname}
                                    onClick={() => setZoomImage(uploadAvatar.preview)}/>
                                    <p style={{marginLeft:"10px", fontSize:"16px"}}>{nickname}</p>
                                </div>
                                ):(
                                    <div className="flex items-center">
                                        <img
                                        style={{width:"32px", height:"32px", borderRadius:"100%", cursor:"pointer"}}
                                        src={uploadAvatar ? uploadAvatar.preview : avatar}
                                        alt={nickname}
                                        onClick={() => setZoomImage(uploadAvatar.preview)}/>
                                        <p style={{marginLeft:"10px", fontSize:"16px"}}>Happy</p>
                                    </div>
                                )}
                            </div>
                            <div className="width-100">
                                {title ? (
                                    <h2 style={{whiteSpace:"pre-wrap", wordWrap:"break-word", overflowWrap: "anywhere"}}>{title}</h2>
                                ):(
                                    <h2 style={{whiteSpace:"pre-wrap", wordWrap:"break-word", overflowWrap: "anywhere"}}>{t("newBlog.titleDefault")}</h2>
                                )}
                            </div>
                            {content ? (
                                <SafeContent html={content}/>
                            ) : (
                                <SafeContent html={t("newBlog.descriptionDefault")}/>
                            )}
                            {content.trim() === "" && (
                                <div className="flex flex-wrap" style={{marginTop:"18px"}}>
                                    <img className={styles.imageFrame}
                                        src={imgDefault} 
                                        alt="AI Furture"
                                        onClick={() => setZoomImage(imgDefault)}/>
                                </div>
                            )}
                        </div>
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
                )}
                <div id={styles.blogframe} className="width-100 flex-column">
                    <div id={styles.blogContent}>
                        <div className="flex width-100">
                            {nickname ? (
                            <div className="flex items-center">
                                <img
                                style={{width:"32px", height:"32px", borderRadius:"100%", cursor:"pointer"}}
                                src={uploadAvatar ? uploadAvatar.preview : avatar}
                                alt={nickname}
                                onClick={() => setZoomImage(uploadAvatar.preview)}/>
                                <p style={{marginLeft:"10px", fontSize:"16px"}}>{nickname}</p>
                            </div>
                            ):(
                                <div className="flex items-center">
                                    <img
                                    style={{width:"32px", height:"32px", borderRadius:"100%", cursor:"pointer"}}
                                    src={uploadAvatar ? uploadAvatar.preview : avatar}
                                    alt={nickname}
                                    onClick={() => setZoomImage(uploadAvatar.preview)}/>
                                    <p style={{marginLeft:"10px", fontSize:"16px"}}>Happy</p>
                                </div>
                            )}
                        </div>
                        <div className="width-100">
                            {title ? (
                                <h2 style={{whiteSpace:"pre-wrap", wordWrap:"break-word", overflowWrap: "anywhere"}}>{title}</h2>
                            ):(
                                <h2 style={{whiteSpace:"pre-wrap", wordWrap:"break-word", overflowWrap: "anywhere"}}>{t("newBlog.titleDefault")}</h2>
                            )}
                        </div>
                        {content ? (
                            <SafeContent html={content}/>
                        ) : (
                            <SafeContent html={t("newBlog.descriptionDefault")}/>
                        )}
                        {content.trim() === "" && (
                            <div className="flex flex-wrap" style={{marginTop:"18px"}}>
                                <img className={styles.imageFrame}
                                    src={imgDefault} 
                                    alt="AI Furture"
                                    onClick={() => setZoomImage(imgDefault)}/>
                            </div>
                        )}
                    </div>
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
            </div>
            {notif && <Notification message={notif.message} type={notif.type} />}
        </div>
    );
}

export default NewBlog;