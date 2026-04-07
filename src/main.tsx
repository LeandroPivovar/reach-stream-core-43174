import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/components/common/responsive-table";

createRoot(document.getElementById("root")!).render(<App />);
