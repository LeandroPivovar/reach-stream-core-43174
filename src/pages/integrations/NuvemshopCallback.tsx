import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export default function NuvemshopCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando conexão...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Verificar se houve erro na autorização
      if (error) {
        setStatus('error');
        setMessage('A autorização foi negada ou ocorreu um erro.');
        toast({
          title: 'Erro na conexão',
          description: 'Não foi possível conectar com a Nuvemshop.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/integracoes'), 3000);
        return;
      }

      // Verificar parâmetros obrigatórios
      if (!code || !state) {
        setStatus('error');
        setMessage('Parâmetros de autorização inválidos.');
        toast({
          title: 'Erro na conexão',
          description: 'Parâmetros de autorização inválidos.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/integracoes'), 3000);
        return;
      }

      // Verificar state (CSRF protection)
      const savedState = localStorage.getItem('nuvemshop_oauth_state');
      if (state !== savedState) {
        setStatus('error');
        setMessage('Token de segurança inválido.');
        toast({
          title: 'Erro na conexão',
          description: 'Token de segurança inválido.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/integracoes'), 3000);
        return;
      }

      try {
        // O backend já processou o callback e redirecionou para cá
        // Verificar se há token_data na query string (base64)
        const tokenDataBase64 = searchParams.get('token_data');
        const success = searchParams.get('success');

        let tokenData: { access_token: string; user_id: string; scope: string } | null = null;

        if (tokenDataBase64 && success === 'true') {
          // Decodificar o token_data (base64)
          try {
            const decoded = atob(tokenDataBase64);
            tokenData = JSON.parse(decoded);
          } catch (e) {
            console.error('Erro ao decodificar token_data:', e);
            throw new Error('Erro ao processar dados de autenticação');
          }
        } else {
          // Fallback: tentar buscar da query string antiga (para compatibilidade)
          const accessToken = searchParams.get('access_token');
          const userId = searchParams.get('user_id');
          const scope = searchParams.get('scope') || '';

          if (accessToken && userId) {
            tokenData = {
              access_token: accessToken,
              user_id: userId,
              scope: scope,
            };
          }
        }

        if (!tokenData || !tokenData.access_token || !tokenData.user_id) {
          throw new Error('Dados de autenticação não encontrados');
        }

        // Verificar se o usuário está autenticado
        const token = localStorage.getItem('token');
        if (!token) {
          // Salvar dados temporariamente e redirecionar para login
          localStorage.setItem('nuvemshop_pending_connection', JSON.stringify({
            storeId: tokenData.user_id,
            accessToken: tokenData.access_token,
            scope: tokenData.scope || '',
          }));
          setStatus('error');
          setMessage('Você precisa estar autenticado para completar a conexão. Redirecionando para login...');
          setTimeout(() => navigate('/auth/login'), 2000);
          return;
        }

        // Salvar a conexão usando o endpoint protegido
        await api.connectNuvemshop({
          storeId: tokenData.user_id,
          accessToken: tokenData.access_token,
          scope: tokenData.scope || '',
        });

        // Limpar dados temporários
        localStorage.removeItem('nuvemshop_oauth_state');

        setStatus('success');
        setMessage('Conexão estabelecida com sucesso!');
        
        toast({
          title: 'Nuvemshop conectada!',
          description: `Sua loja foi conectada com sucesso.`,
        });

        // Redirecionar após 2 segundos
        setTimeout(() => navigate('/integracoes'), 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro ao processar conexão.');
        toast({
          title: 'Erro na conexão',
          description: 'Não foi possível completar a conexão.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/integracoes'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h2 className="text-xl font-semibold">Processando conexão...</h2>
              <p className="text-sm text-muted-foreground text-center">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500" />
              <h2 className="text-xl font-semibold text-green-500">Conexão estabelecida!</h2>
              <p className="text-sm text-muted-foreground text-center">{message}</p>
              <p className="text-xs text-muted-foreground text-center">
                Redirecionando para a página de integrações...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-semibold text-red-500">Erro na conexão</h2>
              <p className="text-sm text-muted-foreground text-center">{message}</p>
              <p className="text-xs text-muted-foreground text-center">
                Redirecionando para a página de integrações...
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

