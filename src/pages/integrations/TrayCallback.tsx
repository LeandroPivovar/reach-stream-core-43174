import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export default function TrayCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando conexão com a Tray...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state'); // Contém o userId
      const trayError = searchParams.get('tray_error');
      const shopUrl = localStorage.getItem('tray_shop_url');

      if (trayError) {
        setStatus('error');
        setMessage(trayError);
        toast({
          title: 'Erro na conexão',
          description: trayError,
          variant: 'destructive',
        });
        setTimeout(() => navigate('/integracoes'), 3000);
        return;
      }

      if (!code || !shopUrl) {
        setStatus('error');
        setMessage('Parâmetros de autorização inválidos ou domínio da loja não encontrado.');
        setTimeout(() => navigate('/integracoes'), 3000);
        return;
      }

      try {
        // Chamar o backend para finalizar a conexão
        await api.trayApi.finalizeConnection(code, shopUrl);

        // Limpar dados temporários
        localStorage.removeItem('tray_shop_url');

        setStatus('success');
        setMessage('Conexão com a Tray estabelecida com sucesso!');
        
        toast({
          title: 'Tray conectada!',
          description: `Sua loja ${shopUrl} foi vinculada com sucesso.`,
        });

        // Redirecionar após 2 segundos
        setTimeout(() => navigate('/integracoes'), 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro ao processar conexão com a Tray.');
        toast({
          title: 'Erro na conexão',
          description: 'Não foi possível completar a vinculação.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/integracoes'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg border-primary/10">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center">
            <img src="/icons/tray.png" alt="Tray" className="w-10 h-10 object-contain" />
          </div>

          {status === 'loading' && (
            <>
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <h2 className="text-xl font-semibold">Conectando...</h2>
              </div>
              <p className="text-sm text-muted-foreground text-center">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500" />
              <h2 className="text-xl font-semibold text-green-500 text-center">Tudo pronto!</h2>
              <p className="text-sm text-muted-foreground text-center">{message}</p>
              <p className="text-xs text-muted-foreground text-center animate-pulse">
                Voltando para a página de integrações...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-semibold text-red-500">Ops! Algo deu errado</h2>
              <p className="text-sm text-muted-foreground text-center">{message}</p>
              <button 
                onClick={() => navigate('/integracoes')}
                className="text-primary text-sm font-medium hover:underline"
              >
                Voltar e tentar novamente
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
