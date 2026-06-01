import React, { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("loading...");
  const API = import.meta.env.VITE_API_URL || "http://localhost:8787";

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus("error"));
  }, [API]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>si-zat_ESD</h1>
      <p>Backend: {status}</p>
      <p>React {React.version} + Vite + Capacitor</p>
    </div>
  );
}

export default App;
