
/**
 * Utilitários para integração com o Shopify App Bridge
 */

// Interface básica para o objeto shopify injetado pelo script da CDN
interface ShopifyAppBridge {
  idToken: () => Promise<string>;
  config: {
    shop: string;
    host: string;
    apiKey: string;
  };
}

/**
 * Verifica se o aplicativo está sendo executado dentro do iframe da Shopify (embedded)
 */
export const isShopifyEmbedded = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbeddedParam = urlParams.get('embedded') === '1' || urlParams.get('embedded') === 'true';
  
  return isEmbeddedParam || !!(window as any).shopify;
};

/**
 * Obtém o token de sessão (ID Token) da Shopify usando o App Bridge
 * Este token é usado para autenticar requisições entre o frontend e o backend
 */
export const getShopifySessionToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined' && (window as any).shopify) {
    try {
      // O método idToken() retorna uma Promise que resolve para o JWT da sessão
      const token = await (window as any).shopify.idToken();
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
  return urlParams.get('shop') || (window as any).shopify?.config?.shop || null;
};
