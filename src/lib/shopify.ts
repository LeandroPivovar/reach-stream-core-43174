
/**
 * Utilitários para integração com o Shopify App Bridge
 */

// Interface básica para o objeto shopify injetado pelo script da CDN
interface ShopifyAppBridge {
  idToken: () => Promise<string>;
  config?: {
    shop?: string;
    host?: string;
    apiKey?: string;
  };
}

interface EmbeddedUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  planName?: string;
  document?: string;
  address?: string;
  postalCode?: string;
  role?: string;
}

declare global {
  interface Window {
    shopify?: ShopifyAppBridge;
  }
}

// Marca de contexto embedded, para o caso de uma navegação interna descartar os
// parâmetros da URL (?host/?embedded). sessionStorage vive só nesta aba, então
// não afeta o usuário normal do CRM em outra aba.
const EMBEDDED_FLAG_KEY = 'shopify_embedded_context';

const readSession = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeSession = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage bloqueado no iframe — segue só com os params da URL.
  }
};

/**
 * Verifica se o aplicativo está sendo executado dentro do iframe da Shopify (embedded).
 *
 * Os parâmetros só existem na primeira URL carregada pelo admin; navegações
 * internas do React Router podem perdê-los. Por isso o contexto é lembrado
 * na aba assim que detectado.
 */
export const isShopifyEmbedded = (): boolean => {
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  const isEmbeddedParam = urlParams.get('embedded') === '1' || urlParams.get('embedded') === 'true';
  const hasHost = !!urlParams.get('host');

  // O App Bridge é o primeiro script do documento e, portanto, também pode
  // expor `window.shopify` no acesso standalone. A presença do global sozinha
  // não prova contexto embedded; a Shopify fornece host/embedded na entrada.
  if (isEmbeddedParam || hasHost) {
    // Guarda host/shop para sobreviver a reloads que percam a query string.
    const host = urlParams.get('host');
    const shop = urlParams.get('shop') || window.shopify?.config?.shop;
    writeSession(EMBEDDED_FLAG_KEY, '1');
    if (host) writeSession('shopify_host', host);
    if (shop) writeSession('shopify_shop_domain', shop);
    return true;
  }

  return readSession(EMBEDDED_FLAG_KEY) === '1';
};

/**
 * Obtém o token de sessão (ID Token) da Shopify usando o App Bridge
 * Este token é usado para autenticar requisições entre o frontend e o backend
 */
export const getShopifySessionToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined' && isShopifyEmbedded() && window.shopify) {
    try {
      // O método idToken() retorna uma Promise que resolve para o JWT da sessão
      const token = await window.shopify.idToken();
      return token;
    } catch (error) {
      console.error('[Shopify] Erro ao obter Session Token:', error);
      return null;
    }
  }
  return null;
};

/**
 * Obtém o domínio da loja atual do contexto da URL ou do App Bridge
 */
export const getShopifyShopDomain = (): string | null => {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  return (
    urlParams.get('shop') ||
    window.shopify?.config?.shop ||
    readSession('shopify_shop_domain') ||
    null
  );
};

/**
 * Base URL da API (mesma lógica usada no restante do app).
 */
const getApiBaseUrl = (): string => {
  const isProd =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';
  const defaultApiUrl = isProd ? window.location.origin : 'http://localhost:3000';
  const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;
  return API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL;
};

/**
 * Aguarda o App Bridge (window.shopify) ficar disponível (script carrega assíncrono).
 */
const waitForAppBridge = (timeoutMs = 4000): Promise<ShopifyAppBridge | null> => {
  return new Promise((resolve) => {
    if (window.shopify) return resolve(window.shopify);
    const start = Date.now();
    const iv = setInterval(() => {
      if (window.shopify) {
        clearInterval(iv);
        resolve(window.shopify);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(iv);
        resolve(null);
      }
    }, 50);
  });
};

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      },
    );
  });

/**
 * Sessão embedded em memória: iframes de terceiros podem ter localStorage
 * bloqueado (ITP/cookies de terceiros). A fonte de verdade embedded é esta
 * variável; o localStorage é só um cache best-effort.
 */
let embeddedSession: { token: string | null; user: EmbeddedUser | null } = {
  token: null,
  user: null,
};

export const getEmbeddedToken = (): string | null => embeddedSession.token;
export const getEmbeddedUser = (): EmbeddedUser | null => embeddedSession.user;

const trySetLocalStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage bloqueado no iframe — sessão segue apenas em memória.
  }
};

/**
 * Autentica o app embedded usando o session token da Shopify.
 * Fluxo: App Bridge idToken → token-exchange no backend → JWT + user do CRM.
 * Primeiro acesso (loja não conectada): o BACKEND provisiona a conexão via
 * token exchange da Shopify (managed install) — sem redirect de OAuth.
 * Retorna true se autenticou.
 */
export const authenticateEmbedded = async (): Promise<boolean> => {
  if (!isShopifyEmbedded()) return false;

  const shopify = await waitForAppBridge();
  if (!shopify || typeof shopify.idToken !== 'function') {
    console.warn('[Shopify] App Bridge indisponível; autenticação embedded ignorada.');
    return false;
  }

  let idToken: string;
  try {
    // Evita tela branca indefinida quando o iframe está sem contexto válido.
    idToken = await withTimeout(
      shopify.idToken(),
      8000,
      'Tempo limite ao obter o session token da Shopify.',
    );
  } catch (e) {
    console.error('[Shopify] Erro ao obter session token:', e);
    return false;
  }
  if (!idToken) return false;

  const base = getApiBaseUrl();
  const resp = await fetch(`${base}/api/shopify/session/token-exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ sessionToken: idToken }),
  });

  if (!resp.ok) {
    // 409 = conta em conflito (Asaas/outra loja) — mensagem do backend explica.
    if (resp.status === 409) {
      const err = await resp.json().catch(() => null);
      console.error('[Shopify] Conflito de conta:', err?.message || 'conta já vinculada a outro meio de cobrança/loja.');
    } else {
      console.error('[Shopify] Falha na troca de session token:', resp.status);
    }
    return false;
  }

  const data = await resp.json();
  if (data?.token && data?.user) {
    embeddedSession = { token: data.token, user: data.user };
    trySetLocalStorage('token', data.token);
    trySetLocalStorage('user', JSON.stringify(data.user));
    return true;
  }
  return false;
};
