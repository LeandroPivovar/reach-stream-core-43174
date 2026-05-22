import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/components/common/responsive-table";

// Se o aplicativo estiver sendo carregado dentro de um iframe (como no painel da Shopify),
// redireciona a página principal (top) para rodar o aplicativo standalone fora do iframe.
if (typeof window !== 'undefined' && window.self !== window.top) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('embedded');
    window.top.location.href = url.toString();
  } catch (e) {
    console.error("Erro ao tentar quebrar o iframe da Shopify:", e);
  }
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}

