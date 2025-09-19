
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { verifyEmail } from "../services/chatbot.service";


function authEmail(){

    const { t } = useTranslation();
    const [codeVerify, setCode] = useState("");
    const [notif, setNotif] = useState(null);

    useEffect(() => {
        verifyEmail()
        .then((res) => setCode(res.data))

        .catch((err) => {
            setNotif({ message: t("contact_page.error"), type: "warning" });
            setTimeout(() => setNotif(null), 4000);
        });
    }, []);

    return {codeVerify, notif};
}

export default authEmail;