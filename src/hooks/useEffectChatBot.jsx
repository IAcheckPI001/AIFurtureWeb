

import { useState, useEffect, useRef} from 'react';
import { getChats } from '../services/chatbot.service';

function useEffectChatBot() {

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
    getChats()
        .then((data) => {
            setChats(data);
            setLoading(false);
        })
        .catch((err) => {
            setError(err);
            setLoading(false);
        });
    }, []);


    // useEffect(() => {
    //     endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [chats]);

    return {chats, loading, error, endOfMessagesRef}

}

export default useEffectChatBot;