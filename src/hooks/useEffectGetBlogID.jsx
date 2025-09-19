
import { useEffect, useState } from "react";
import { getBlogID } from "../services/chatbot.service";
import { useParams } from "react-router-dom";

function useEffectGetBlogID (){

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { public_id } = useParams();

    useEffect(() => {
        if (!public_id) return;

        getBlogID(public_id)
        .then((res) => {
            setBlog(res.data);
        })
        .catch(err => {
            setError(err);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [public_id]);


    return { blog, loading, error };
}

export default useEffectGetBlogID;