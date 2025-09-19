

import { useState } from "react";
import CreatableSelect from "react-select/creatable";


export default function SelectItemForm(options) {
  const [selectedTags, setSelectedTags] = useState([]);

  return (
    <div>
      <label>Topic</label>
      <CreatableSelect
        isMulti
        options={options}
        value={selectedTags}
        onChange={setSelectedTags}
        placeholder="Type or select tags..."
      />
    </div>
  );
}