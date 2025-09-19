

import { useState } from "react";

function LimitText({ text, limit }) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= limit) {
    return <p>{text}</p>;
  }

  return (
    <div>
      {expanded ? text : text.slice(0, limit) + "... "}
      <span
        onClick={() => setExpanded(!expanded)}
        style={{ color: "blue", cursor: "pointer" }}
      >
        {expanded ? "Show less" : "Read more"}
      </span>
    </div>
  );
}

export default LimitText;