import { useEffect, useState } from "react";
import { checkSession } from "../services/chatbot.service";



function useEffectCheckSession(){

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkSession()
        .then(res => {
            if (res.authenticated) {
            setData({
                nickname: res.nickname,
                avatar_img: res.avatar_img,
                session_id: res.session_id
            });
            } else {
                setData(null);
            }
        })
        .catch(err => {
            setError(err);
            setData(null);
        })
        .finally(() => setLoading(false));
    }, []);

    return { data, loading, error };
}
export default useEffectCheckSession;