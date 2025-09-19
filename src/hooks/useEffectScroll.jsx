import { useState, useEffect } from "react";



function useEffectScroll(text) {

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!text) return;
            setMessages(prev => [...prev, {role: "id_users", content: text}]);
    }, [text])

    return {messages , setMessages}

}

export default useEffectScroll;