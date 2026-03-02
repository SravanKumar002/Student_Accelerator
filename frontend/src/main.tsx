import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

if (typeof document !== "undefined") {
  document.title = "Student Accelerator";
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);

