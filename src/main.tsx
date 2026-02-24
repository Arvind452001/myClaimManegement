import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Keep your existing template styling

import App from "./App";
import { SocketProvider } from "./Context/SocketContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <App />
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
