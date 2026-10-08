import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/components/common/responsive-table";
import { authenticateEmbedded, isShopifyEmbedded as detectShopifyEmbedded } from "@/lib/shopify";

const renderApp = () =>
  createRoot(document.getElementById("root")!).render(<App />);

const renderEmbeddedAuthError = () =>
  createRoot(document.getElementById("root")!).render(
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Não foi possível abrir a Núcleo CRM</h1>
        <p className="mt-3 text-sm text-slate-600">
          A autenticação automática da loja não foi concluída. Tente novamente sem usar o login comum da plataforma.
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </section>
    </main>,
  );

// Detecta o contexto embedded pelos params da URL OU pela marca de sessão da aba
// (um reload interno pode perder ?host/?embedded e cairia no breakout do iframe).
const isShopifyEmbedded = typeof window !== 'undefined' && detectShopifyEmbedded();

if (isShopifyEmbedded) {
  // Rodando embedded no admin da Shopify: NÃO quebramos o iframe.
  // Autenticamos via session token (App Bridge) e renderizamos dentro do iframe.
  authenticateEmbedded()
    .then((authenticated) => {
      if (authenticated) renderApp();
      else renderEmbeddedAuthError();
    })
    .catch((e) => {
      console.error('[Shopify] Erro na autenticação embedded:', e);
      renderEmbeddedAuthError();
    });
} else if (typeof window !== 'undefined' && window.self !== window.top) {
  // Iframe NÃO-Shopify: mantém o comportamento antigo de sair do iframe.
  let breakoutSuccessful = false;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('embedded');
    window.top!.location.href = url.toString();
    breakoutSuccessful = true;
  } catch (e) {
    console.error("Erro ao tentar quebrar o iframe:", e);
  }
  if (!breakoutSuccessful) {
    renderApp();
  }
} else {
  // Usuário normal do CRM (standalone): comportamento inalterado.
  renderApp();
}


