import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/components/common/responsive-table";

// Se o aplicativo estiver sendo carregado dentro de um iframe (como no painel da Shopify),
// tentamos redirecionar a página principal (top) para rodar o aplicativo standalone fora do iframe.
if (typeof window !== 'undefined' && window.self !== window.top) {
  let breakoutSuccessful = false;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('embedded');
    window.top.location.href = url.toString();
    breakoutSuccessful = true;
  } catch (e) {
    console.error("Erro ao tentar quebrar o iframe da Shopify:", e);
  }
  
  // Se o redirecionamento automático falhar (bloqueado por restrições de cross-origin),
  // renderizamos o app normalmente para que o usuário não fique com a tela em branco.
  if (!breakoutSuccessful) {
    createRoot(document.getElementById("root")!).render(<App />);
  }
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}


