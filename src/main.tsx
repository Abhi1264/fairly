import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { inject } from '@vercel/analytics';
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./lib/store";

inject();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
