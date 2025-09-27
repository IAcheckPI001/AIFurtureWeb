
import { useState, useRef, useEffect } from "react";
import avatar from "../assets/image/avatar_default.png";
import imgUpload from "../assets/icon/image-upload.png";
import imgDefault from "../assets/image/service-back.png"
import styles from "../assets/css/CreateUser.module.css"
import closeIcon from "../assets/icon/close.png";
import addScale from "../assets/icon/add.png";
import minusIcon from "../assets/icon/minus.png";
import reloadCode from "../assets/icon/reload.png";
import useEffectGetNicknames from "../hooks/useEffectGetNicknames.jsx";


import AvatarEditor from "react-avatar-editor";
function CreateUser(){
    const MAX_NICKNAME_LENGTH = 22;
    const MAX_EMAIL_LENGTH = 40;

    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [codeInput, setCodeInput] = useState("");
    const [codeVerify, setCode] = useState("");
    const [uploadAvatar, setAvatar] = useState(null);
    const [scaleShow, setScaleFrame] = useState(false);

    const [account, setAccount] = useState(null);
    const [scale, setScale] = useState(1);
    const [existNickname, setCheckNickname] = useState(false);
    const [existEmail, setCheckEmail] = useState(false);
    const editorRef = useRef(null);
    const [zoomImage, setZoomImage] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const resetCode = () => {
        if(!nickname.trim() && !email.trim()){
            setNotif({ message: t("newBlog.warningEmptyAccount"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }else{
            verifyCode(email);
            setNotif({ message: t("contact_page.waitCheck"), type: "waitCheck" });
            setTimeout(() => setNotif(null), 4000);
            setTimeLeft(30);
        }
    }

    const { data: nicknameList, load, err } = useEffectGetNicknames();


    const checkAccount = async (email) =>{
        try {
            const response = await fetch(`${API_URL}/check_account`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({"email": email}),
            });

            if (!response.ok) {
                throw new Error("Failed to send verification email");
            }
            const data = await response.json();

            setAccount(data);
            return data
        }catch (err) {
            setNotif({ message: t("contact_page.error"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }
    }

    const verifyCode = async (email) =>{
        try {
            const response = await fetch(`${API_URL}/verify_email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({"email": email}),
            });

            if (!response.ok) {
                throw new Error("Failed to send verification email");
            }
            const code = await response.json();
            setCode(code);
        }catch (err) {
            setNotif({ message: t("contact_page.error"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }
    }

    const sendMessage = async (data) =>{
        try {
            const response = await fetch(`${API_URL}/create_blog`, {
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
        setSelectedImages(prev => {
            return file.length > 0 ? [file[file.length - 1]] : [];
        });
        
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

                return data.image_url

            }catch (err){
                setNotif({ message: t("contact_page.error"), type: "warning" });
                setTimeout(() => setNotif(null), 4000);
            }
        }
        
    };

    const removeImage = () => {
        setAvatar(null);
    };


    const createAccount = async () => {
        if (!nickname.trim() && !email.trim()){
            setNotif({ message: t("newBlog.warningEmptyAccount"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }else{
            try {
                if (nicknameList.includes(nickname)) {
                    setCheckNickname(true);
                }else{
                    const check = await checkAccount(email);
                    if (check === null){
                        setCheckNickname(false);
                        if (codeVerify === ""){
                            verifyCode(email);
                            setTimeLeft(30);
                            setNotif({ message: t("contact_page.waitCheck"), type: "waitCheck" });
                            setTimeout(() => setNotif(null), 4000);
                            const frameCode = document.getElementById("codeFrame");
                            const frameInput = document.getElementById("verifyCode");
                            frameCode.style.display = "flex";
                            frameInput.style.border = "1px solid #6e9db1";
                        }else{
                            if (codeInput === codeVerify.code){
                                const { html, uploadedUrls } = await uploadImages(content);
                                const urls = await upload_avatar();
                                const data = {
                                    "email":  email,
                                    "nickname": nickname,
                                    "avatar_img": urls.trim == "" ? "https://res.cloudinary.com/dhbcyrfmw/image/upload/v1758627287/avatar_default_ccdqc5.png": urls,
                                };

                                sendMessage(data);
                                setNotif({ message: t("newBlog.success"), type: "success" });
                                setCode("");
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
                        setCheckEmail(true);
                    }
                }
                
            }catch (error) {
                const { html, uploadedUrls } = await uploadImages(content);
                if (uploadedUrls && uploadedUrls.length > 0) {
                    for (let img of uploadedUrls) {
                        await deleteImage(img.public_id);
                    }
                }
                // res.status(500).json({ error: "Server error" });
                setNotif({ message: t("contact_page.error"), type: "error" });
                setTimeout(() => setNotif(null), 4000);
            }
        }
        
    }

    return (
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
            <div style={{width: "450px", height:"auto", backgroundColor:"#ffffff", borderRadius:"10px", paddingLeft: "34px"}} className="flex flex-column jc-center">
                <div className="flex jc-end" style={{margin:"15px 15px 0 0"}}>
                    <img className={styles.closeFrame} style={{padding:"8px", borderRadius:"100%", width:"22px", height:"22px"}}
                        src={closeIcon} 
                        alt=""
                        onClick={closeFrame} />
                </div>
                <h1 style={{marginBottom:"28px", marginTop:"8px"}}>{t("newBlog.createUser")}</h1>
                {nickname ? (
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
                        <p style={{marginLeft:"15px", fontSize:"18px", marginTop:"8px"}}>{nickname}</p>
                    </div>
                ):(
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
                        <p style={{marginLeft:"15px", fontSize:"18px", marginTop:"8px"}}>{t("newBlog.yourNickname")}</p>
                    </div>
                )}
                <div className="flex flex-column" style={{margin: "13px 0"}}>
                    <label className={styles.label} htmlFor="nickname">{t("newBlog.nicknameLabel")}</label>
                    <input className={styles.inputNickname} 
                        id="nickname" 
                        type="text"
                        value={nickname}
                        maxLength={MAX_NICKNAME_LENGTH}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_NICKNAME_LENGTH) {
                                setNickname(e.target.value)
                            }
                        }}
                        />
                    {existNickname && (
                        <span style={{color:"#670a0a", fontSize:"14px", marginTop:"5px"}}>{t("newBlog.checkNickname")}</span>
                    )}
                </div>
                <div className="flex flex-column" style={{margin: "10px 22px 26px 0"}}>
                    <label className={styles.label} htmlFor="email">{t("newBlog.emailLabel")}<span style={{color:"red"}}>*</span></label>
                    <input className={styles.inputEmail} id="email" type="email"
                        maxLength={MAX_EMAIL_LENGTH}
                        value={email}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_EMAIL_LENGTH) {
                                setEmail(e.target.value)
                            }
                        }}
                        placeholder="example@gmail.com" required/>
                    {existEmail && (
                        <span style={{color:"#670a0a", fontSize:"14px", marginTop:"5px"}}>{t("newBlog.checkNickname")}</span>
                    )}
                </div>

                <div id="codeFrame" className="flex flex-column" style={{display:"none"}}>
                    <label className={styles.label} htmlFor="verifyCode">{t("newBlog.verifyCode")}<span style={{color:"red"}}>*</span></label>
                    <div className="flex items-center">
                        <input className={styles.inputCode} id="verifyCode" type="text" placeholder="######" onChange={(e) => setCodeInput(e.target.value)} required/>
                        {timeLeft > 0 ? (
                            <p style={{marginLeft:"12px", fontSize:"14px", color:"#606060ff"}}>{t("newBlog.resendCode")}{timeLeft}s</p>
                        ): (
                            <img style={{padding:"8px", borderRadius:"100%", width:"20px", height:"20px", marginLeft:"2px", cursor:"pointer"}}
                                onClick={resetCode} src={reloadCode} 
                                disabled={timeLeft > 0}>
                            </img>
                        )}
                    </div>
                </div>
            
                <div className="flex jc-end" style={{margin:"6px 28px 28px 0"}}>
                    <button id={styles.submit} onClick={createAccount}>{t("newBlog.btnSubmit")}</button>
                </div>
            </div>
        </div>
    );
}
export default CreateUser;