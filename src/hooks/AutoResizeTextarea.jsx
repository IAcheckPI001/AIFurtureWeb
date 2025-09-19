
import { useRef, useEffect } from 'react';
import chatbotStyles from '../chatbot/Chatbot.module.css'

function AutoResizeTextarea ({value, placeholder, handleKey, onChange}){
   
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "2px";
            inputRef.current.style.height = inputRef.current.scrollHeight - 24 + "px";
        }
    }, [value]);
    

    return (
        <div className="width-100 flex jc-space-evenly" style={{marginBottom: "10px", marginTop: "10px"}}>
            <textarea
                name="chatbot"
                ref={inputRef}
                value={value}
                onKeyDown= {handleKey}
                onChange={onChange}
                className={chatbotStyles.inputTextCb}
                style={{width: "88%", padding: "13px 14px 13px 18px", marginLeft: "12px", height: "22px", borderRadius: "26px", maxHeight: "140px", scrollbarWidth: "thin", scrollBehavior:"smooth", border: "1px solid #dadada", fontSize:"16px"}}
                placeholder= {placeholder}
                type="text"
            />
        </div>
    );
}

export default AutoResizeTextarea;