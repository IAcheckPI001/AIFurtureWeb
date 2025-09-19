

import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../assets/css/Contact.module.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Notification from "../components/notification/Notification.jsx";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Contact (){

    const MAX_FIRSTNAME_LENGTH = 25
    const MAX_LASTNAME_LENGTH = 20
    const MAX_EMAIL_LENGTH = 50
    const MAX_CODE_LENGTH = 6
    const MAX_PHONE_LENGTH = 25
    const MAX_CONTENT_LENGTH = 2500
    
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [codeInput, setCodeInput] = useState("");
    const [codeVerify, setCode] = useState("");
    const [phone, setPhone] = useState("");
    const [content, setContent] = useState("");
    const [notif, setNotif] = useState(null);
    const { t } = useTranslation();
    
    const sendContact = async () => {
        if(!email.trim() || !lastName.trim()){
            setNotif({ message: t("contact_page.warningEmpty"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        }else{
            try {
                if (codeVerify === ""){
                    verifyCode(email);
                    setNotif({ message: t("contact_page.waitCheck"), type: "waitCheck" });
                    setTimeout(() => setNotif(null), 4000);
                    const frameCode = document.getElementById("codeFrame");
                    frameCode.style.display = "flex";
                }
                else{
                    if (codeInput === codeVerify.code){
                        const data = {
                            "firstName":  firstName,
                            "lastName": lastName,
                            "email": email,
                            "code": codeVerify,
                            "phone": phone,
                            "content": content
                        };
                        sendMessage(data);
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                        setNotif({ message: t("contact_page.success"), type: "success" });
                        setTimeout(() => setNotif(null), 4000);
                        setCode("");
                    }
                    else{
                        setCodeInput("");
                        const frameCode = document.getElementById("code_input");
                        frameCode.style.border = "1px solid #ff9595";
                    }
                }   
            } catch (error) {
                setNotif({ message: t("contact_page.error"), type: "waitCheck" });
                setTimeout(() => setNotif(null), 4000);
            }
        }
    }

    const verifyCode = async (data) =>{
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
            const response = await fetch(`${API_URL}/create_contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }catch (err) {
            console.log("Error sending message: ", err);
        }
    }
    

    return (
        <div className="container width-100 flex jc-center">
            <div className="flex flex-column" style={{width:"58vw" ,marginTop:"40px"}}>
                <div className="flex items-center jc-space-between" style={{width:"90%"}}>
                    <h1 style={{marginBottom:"25px", fontSize:"34px"}}>{t("contact_page.titleContent")}</h1>
                </div>

                <div className="flex jc-space-between" style={{width:"60%"}}>
                    <div className="flex flex-column jc-start">
                        <label className={styles.label} htmlFor="firstName">{t("contact_page.labelFirstName")}</label>
                        <input className={styles.inputName} id="firstName" 
                        maxLength={MAX_FIRSTNAME_LENGTH}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_FIRSTNAME_LENGTH) {
                                setFirstName(e.target.value)
                            }
                        }}  
                        type="text"/>
                    </div>
                    <div className="flex flex-column jc-start">
                        <label className={styles.label} htmlFor="lastName">{t("contact_page.labelLastName")}<span style={{color:"red"}}> *</span></label>
                        <input className={styles.inputName} id="lastName" 
                        maxLength={MAX_LASTNAME_LENGTH}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_LASTNAME_LENGTH) {
                                setLastName(e.target.value)
                            }
                        }}
                        type="text" required/>
                    </div>
                </div>
                
                <div className="flex">
                    <div className="flex flex-column" style={{marginTop: "20px", width:"40%"}}>
                        <label className={styles.label} htmlFor="email">{t("contact_page.labelEmail")}<span style={{color:"red"}}> *</span></label>
                        <input className={styles.inputEmail} id="email" 
                            maxLength={MAX_EMAIL_LENGTH}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_EMAIL_LENGTH) {
                                    setEmail(e.target.value)
                                }
                            }}  
                            type="email" placeholder="example@gmail.com" required/>
                    </div>
                    <div id="codeFrame" className="flex flex-column" style={{marginTop: "20px", display:"none"}}>
                        <label className={styles.label} htmlFor="code_input">{t("contact_page.labelCode")} <span style={{color:"red"}}>*</span></label>
                        <input className={styles.inputCode} id="code_input" 
                            maxLength={MAX_CODE_LENGTH}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_CODE_LENGTH) {
                                    setCodeInput(e.target.value)
                                }
                            }}  
                            placeholder="######" 
                            type="text" required/>
                    </div>
                </div>
                <div className="flex flex-column" style={{marginTop: "20px"}}>
                    <label className={styles.label} htmlFor="phone">{t("contact_page.labelPhone")}<span style={{color:"red"}}> *</span></label>
                    <PhoneInput id="phone" 
                        maxLength={MAX_PHONE_LENGTH}
                        country={"vn"}
                        value={phone}
                        onChange={(value) => {
                            if (value.length <= MAX_PHONE_LENGTH) {
                                setPhone(value);
                            }
                        }} 
                        inputStyle={{ width: "300px" }}
                        inputProps={{
                            name: "phone",
                            required: true,
                            type: "tel",
                            pattern: "^\\+?[0-9]{9,15}$"
                        }}
                        type="tel" 
                        placeholder="0111 222 444"/>
                </div>
                
                <div className="flex flex-column" style={{marginTop: "20px"}}>
                    <label className={styles.label} htmlFor="message">{t("contact_page.labelMessage")}</label>
                    <textarea className={styles.textareaMessage} name="message" id="message" 
                        maxLength={MAX_CONTENT_LENGTH}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                                setContent(e.target.value)
                            }
                        }} 
                        placeholder={t("contact_page.placeholderMessage")} required></textarea>
                </div>
                <div style={{marginTop:"25px", marginBottom:"25px"}}>
                    <button id={styles.submit} onClick={sendContact}> {t("contact_page.btnSubmit")}</button>
                </div>
            </div>
            {notif && <Notification message={notif.message} type={notif.type} />}
        </div>
    );

}

export default Contact