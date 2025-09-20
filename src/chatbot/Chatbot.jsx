import styles from './Chatbot.module.css'
import { useState } from 'react';
import useEffectChatBot from '../hooks/useEffectChatBot.jsx'
import useEffectScroll from '../hooks/useEffectScroll.jsx';

import fileAttached from '../assets/icon/file_attached.png'
import expandIcon from '../assets/icon/expand.png'

import arrowIcon from '../assets/icon/arrow-234.png'

function Chatbot({ closeWinChatbot }){

    const fileAttached = () => console.log("choose file!")

    const [text, setText] = useState("");
    const [trigger, setTrigger] = useState("");
    const {messages, updateScrollChatbot, setMessages} = useEffectScroll(trigger);

    const handleKey = (e) =>{
        if (e.key === "Enter" && text.trim() !== ""){
            setTrigger(text);
            sendMessage(text);
            setText("");
        }
    };

    const sendMessage = async (message) =>{
        try {
            const responses = await requestMessage(message);
            const reader = responses.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            // First, add an empty chatbot message to update later
            setMessages(prev => [...prev, { role: "responses", content: "" }]);

            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();

                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    fullResponse += chunk;

                    // Update the last chatbot message with new chunk
                    setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === "responses") {
                        const updatedLast = { ...lastMessage, content: fullResponse };
                        return [...prev.slice(0, prev.length - 1), updatedLast];
                    }
                    return prev;
                    });
                }
            }
        } catch (err) {
            console.log("Error sending message: ", err);
        }
    };


    const { chats, loading, error, endOfMessagesRef } = useEffectChatBot();

    return (
        <div id= {styles.chatbot} className="flex flex-column">
            <div id={styles.titleChatbot} className= "flex jc-space-between margin-5-0">
                <p>Chatbot</p>
                
                <div className="flex">
                    <div className= {styles.arrowCloseChatbot} style={{padding:"5px", height: "15px", borderRadius: "100%"}}>
                        <img style={{width: "15px"}} src={expandIcon} alt="" />
                    </div>
                    <div onClick={closeWinChatbot} className= {styles.arrowCloseChatbot} style={{padding:"5px", height: "15px", borderRadius: "100%"}}>
                        <img style={{width: "15px"}} src={arrowIcon} alt="" />
                    </div>
                </div>
            </div>
            <div className={styles.contentChatbot}>
                {chats && chats.length > 0 ? (
                    chats.map((chat) => (
                        <div className={styles.contentUser} key={chat.id_chatbot}>
                            <div className="flex jc-end margin-5-0" style={{paddingLeft:"10%"}}>
                                <div className={styles.textStyle}>
                                    <p className={styles.id_users}>{chat.inputs_user}</p>
                                </div>
                            </div>
                            <div className="flex jc-start margin-5-0" style={{paddingRight:"10%"}}>
                                <p className={styles.responses}>
                                    {chat.responses_chatbot}
                                </p>
                            </div>
                            
                        </div>
                        
                    ))
                ):(
                    <div></div>
                )}
                <div ref={endOfMessagesRef}/>
                {error !== "" && (
                    <p>{loading}</p>
                )

                }
                {messages.length > 0 && messages.map((message, idx) => (
                    <div className={styles.contentUser} key={idx}>
                    {message.role === "id_users" ? (
                        <div className="flex jc-end margin-5-0" style={{paddingLeft:"10%"}}>
                            <p className={styles.id_users}>{message.content}</p>
                        </div>
                    ):(
                        <div className="flex jc-start margin-0-5" style={{paddingRight:"10%"}}>
                            <p className={styles.responses}>{message.content}</p>
                        </div>
                    )}
                    </div>
                ))}
                <div ref={updateScrollChatbot}/>
            </div>
            <div style={{padding: "5px 0"}}>
                <div className={styles.inputsChatbot}>
                    <div onClick={fileAttached} style={{padding:"5px 5px"}}>
                        <img className = {styles.fileAttached} src={fileAttached} alt="" />
                    </div>
                    <input className={styles.inputTextCb} placeholder="Ask anything" type="text" 
                        value={text} 
                        onKeyDown={handleKey} 
                        onChange={(e) => setText(e.target.value)}/>
                </div>
            </div>
        </div>
    )
}

export default Chatbot


