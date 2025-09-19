


import { useState, useEffect } from "react";
import { getListNickname } from "../services/chatbot.service";


function useEffectGetNicknames() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
        getListNickname()
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
export default useEffectGetNicknames;