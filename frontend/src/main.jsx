import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./components/layout/layout.css";
import App from "./App.jsx";

// ✦ Keep-Alive — يمنع Render من تنويم الباك-أند
const keepAlive = () => {
  fetch(`${import.meta.env.VITE_API_URL}/`).catch(() => {});
};
keepAlive();
setInterval(keepAlive, 9 * 60 * 1000);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);