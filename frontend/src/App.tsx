import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

// ¡La URL de tu backend en Render!
const API_URL = "https://career-genius-backend.onrender.com";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch(API_URL) 
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch(() => setMessage("Error fetching data"));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Message from Backend: <strong>{message}</strong>
        </p>
      </header>
    </div>
  );
}

export default App;
