import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Buscar a assinatura apenas se estiver autenticado
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    isFetching: isSubscriptionFetching
  } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: () => api.getCurrentSubscription(),
    enabled: isAuthenticated,
  });

  if (isLoading || (isAuthenticated && (isSubscriptionLoading || isSubscriptionFetching))) {
    // Mostrar loading enquanto verifica autenticação ou assinatura
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirecionar para login, salvando a rota atual para redirecionar depois
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Rotas permitidas mesmo sem plano ativo
  const allowedPathsWithoutPlan = [
    '/assinaturas',
    '/checkout',
    '/cancelar-assinatura',
    '/conta',
    '/admin',
    '/integrations/shopify/callback',
    '/integrations/nuvemshop/callback'
  ];

  const hasActivePlan = subscription?.status === 'active' && !(subscription as any)?.isExpired;
  const isAllowedPath = allowedPathsWithoutPlan.some(path => {
    // Para rotas de integração, aceitamos sub-rotas. Para as demais, exigimos match exato ou com barra no final
    if (path.startsWith('/integrations/')) {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  });

  // Redirecionar para a página de assinaturas se não tiver plano ativo e estiver tentando acessar outra rota
  if (!hasActivePlan && !isAllowedPath) {
    return <Navigate to="/assinaturas" replace />;
  }

  return <>{children}</>;
}


