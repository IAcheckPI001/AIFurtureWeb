

import DOMPurify from "dompurify";
import styles from "../assets/css/NewBlog.module.css";

function SafeContent({ html }) {
  const cleanHtml = DOMPurify.sanitize(html);

  return <div id="styleContent" className={styles.frameCode} style={{whiteSpace:"pre-wrap", wordWrap:"break-word", overflowWrap: "anywhere"}} 
    dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}

export default SafeContent;