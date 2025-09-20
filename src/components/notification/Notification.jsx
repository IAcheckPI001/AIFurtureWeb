
import styles from "./Notification.module.css"
import success from "./success.png"
import waitCheck from "./waitCheck.png"
import warning from "./warning.png"

function Notification({message, type}) {

    return (
        <div id={styles.notifyFrame} className="fixed flex" style={{ width: "300px", minHeight: "80px" }}>
            <div className="flex width-100 items-center" style={{paddingLeft:"16px", backgroundColor:"#f1f1f1", borderRadius:"10px"}}>
                <img className={styles.iconNotification} src={type === "warning" ? warning : type === "waitCheck" ? waitCheck : success} alt="" />
                <p className={styles.font}>{message}</p>
            </div>
        </div>
    );
}

export default Notification;