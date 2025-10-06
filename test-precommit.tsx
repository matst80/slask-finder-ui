import React, { useState } from "react";

// This component has unused imports and formatting issues to test pre-commit hook
export const TestPreCommitComponent = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <div>
      <h1>Test Pre-Commit Component</h1>
      <p>Count: {count}</p>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
