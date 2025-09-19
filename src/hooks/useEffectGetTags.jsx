
import { useState, useEffect } from "react";
import { getTags } from "../services/chatbot.service";



function useEffectGetTags() {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getTags()
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

export default useEffectGetTags;