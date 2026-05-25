import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ShopifyBillingCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Esse callback é chamado tanto pelo nosso backend (que faz o redirecionamento com success/error)
    // quanto pela Shopify (se quebrar o iframe). Mas, idealmente, a Shopify chama o backend,
    // que faz o processamento e redireciona pra cá com `success=true` ou `error=algo`.

    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const msg = searchParams.get('msg');
    const shop = searchParams.get('shop');

    if (success === 'true') {
      setStatus('success');
      // Tentar quebrar o iframe da Shopify se necessário
      if (typeof window !== 'undefined' && window.self !== window.top) {
        try {
          // Se estivermos dentro da Shopify Admin, precisamos instruir o App Bridge
          // a redirecionar para a página de assinaturas no painel principal
          // (Como estamos fora do context do App Bridge aqui, podemos tentar forçar o top)
          window.top.location.href = `${window.location.origin}/assinaturas?success=true`;
          return;
        } catch (e) {
          console.error("Erro ao redirecionar parent:", e);
        }
      }
    } else if (error) {
      setStatus('error');
      setErrorMessage(msg || 'A assinatura não foi aprovada ou ocorreu um erro.');
    } else {
      // Se não tem success nem error, algo deu errado
      setStatus('error');
      setErrorMessage('Parâmetros inválidos no retorno da Shopify.');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">Processando assinatura...</h2>
        <p className="text-muted-foreground text-center">
          Aguarde enquanto confirmamos sua assinatura com a Shopify.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Assinatura Ativada!</h2>
              <p className="text-muted-foreground">
                Sua assinatura via Shopify foi ativada com sucesso. Você já pode usar todos os recursos do seu plano.
              </p>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/assinaturas')}
            >
              Ir para Assinaturas
            </Button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Falha na Assinatura</h2>
              <p className="text-muted-foreground">
                {errorMessage}
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/assinaturas')}
              >
                Voltar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  const planId = searchParams.get('planId') || '1'; // Default ou pegar do erro se tivéssemos
                  navigate(`/checkout/${planId}`);
                }}
              >
                Tentar Novamente
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
