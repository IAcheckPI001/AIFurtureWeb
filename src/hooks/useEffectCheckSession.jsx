import { useEffect, useState } from "react";
import { checkSession } from "../services/chatbot.service";



function useEffectCheckSession(){

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkSession()
        .then(res => {
            const data = res.data;
            if (data.authenticated) {
            setData({
                nickname: data.nickname,
                avatar_img: data.avatar_img,
                session_id: data.session_id
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