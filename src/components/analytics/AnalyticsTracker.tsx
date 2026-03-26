import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useInternalAnalytics } from '@/hooks/use-internal-analytics';

export function AnalyticsTracker() {
  const location = useLocation();
  const { trackPageView } = useInternalAnalytics();

  useEffect(() => {
    // Mapeamento amigável de rotas para nomes de tela
    const routeNames: Record<string, string> = {
      '/': 'Dashboard Principal',
      '/campanhas': 'Campanhas',
      '/vendas': 'Vendas',
      '/contatos': 'Contatos',
      '/produtos': 'Produtos',
      '/categorias': 'Categorias (Usuário)',
      '/conexoes': 'Conexões',
      '/rastreamento': 'Rastreamento (Pixel)',
      '/rastreamento/documentacao': 'Documentação do Pixel',
      '/integracoes': 'Integrações',
      '/assinaturas': 'Assinaturas',
      '/checkout': 'Checkout',
      '/cancelar-assinatura': 'Cancelamento',
      '/indicacoes': 'Indicações',
      '/conta': 'Minha Conta',
      '/cupons': 'Cupons',
      '/admin': 'Dashboard Admin',
      '/admin/overview': 'Visão Geral do Sistema (Admin)',
      '/admin/categories': 'Categorias (Admin)',
      '/admin/users': 'Usuários (Admin)',
      '/admin/webhooks': 'Logs de Webhooks (Admin)',
      '/admin/settings': 'Configurações (Admin)',
      '/admin/notifications': 'Notificações (Admin)',
      '/admin/plans': 'Planos (Admin)',
      '/admin/finance': 'Financeiro (Admin)',
      '/admin/capacity': 'Capacidade do Sistema (Admin)',
      '/admin/segmentations': 'Segmentações (Admin)',
      '/admin/email-requests': 'Solicitações de E-mail (Admin)',
    };

    const pageName = routeNames[location.pathname] || `Página: ${location.pathname}`;
    trackPageView(pageName);
  }, [location.pathname, trackPageView]);

  return null;
}
