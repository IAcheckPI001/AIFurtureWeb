

import { useState } from "react";
import Chatbot from '../chatbot/Chatbot.jsx';

function ChatbotWidget (){

    const [isOpen, setIsOpen] = useState(false);
    const toggleChatbot = () => {
        setIsOpen(prev => !prev);
    };
    const closeWinChatbot = () => {
        setIsOpen(false);
    }

    return (
        <div>
            {isOpen ? (
                <button
                    onClick={closeWinChatbot}
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        zIndex: 1000,
                        padding: "10px 20px",
                        borderRadius: "50px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "none",
                    }}
                >
                    Chat
                </button>
            ):(
                <button
                    onClick={toggleChatbot}
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        zIndex: 1000,
                        padding: "10px 20px",
                        borderRadius: "50px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Chat
                </button>
            )}
        
            {isOpen && (
                <Chatbot closeWinChatbot={closeWinChatbot} />
            )}
        </div>
    );
}

export default ChatbotWidget;