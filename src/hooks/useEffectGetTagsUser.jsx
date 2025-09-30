

import { useState, useEffect } from "react";
import { getTagsUser } from "../services/chatbot.service";



function useEffectGetTagsUser() {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getTagsUser()
        .then((res) => {
            setOptions(res.data);
            setLoading(false);
        })
        .catch((err) => {
            setError(err);
            setLoading(false);
        });
    }, []);

    
    return {options, loading, error}

}

export default useEffectGetTagsUser;