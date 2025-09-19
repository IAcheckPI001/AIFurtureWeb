

import SafeContent from "../hooks/DOMpurify.jsx";

function LimitText({ text, limit }) {
  const plainText = text.replace(/<[^>]+>/g, "");
  
  if (plainText.length <= limit) {
    return <SafeContent html={plainText} />;
  }
  return <SafeContent html={plainText.slice(0, limit) + "..."} />
}

export default LimitText;
