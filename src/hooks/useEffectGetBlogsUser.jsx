

import { useState, useEffect } from "react";
import { getBlogsUser } from "../services/chatbot.service";


function useEffectGetBlogs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
        getBlogsUser()
        .then((res) => {
            setData(res.data);
            setLoading(false);
        })
        .catch((err) => {
            setError(err);
            setLoading(false);
        });
    }, []);

  return { data, loading, error };
}
export default useEffectGetBlogs;