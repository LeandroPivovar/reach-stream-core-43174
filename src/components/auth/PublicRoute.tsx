import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Mostrar loading enquanto verifica autenticação
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se já estiver autenticado, redirecionar para o dashboard.
  // Preserva a query string: no modo embedded da Shopify os params host/shop
  // precisam sobreviver à navegação para o App Bridge funcionar em reloads.
  if (isAuthenticated) {
    return <Navigate to={{ pathname: '/visao-geral', search: window.location.search }} replace />;
  }

  return <>{children}</>;
}


