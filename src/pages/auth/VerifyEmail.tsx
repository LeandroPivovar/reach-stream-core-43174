import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não fornecido');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await api.verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
        toast({
          title: 'E-mail verificado!',
          description: 'Sua conta foi ativada com sucesso',
        });
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro ao verificar e-mail');
        toast({
          title: 'Erro ao verificar e-mail',
          description: error instanceof Error ? error.message : 'Token inválido ou expirado',
          variant: 'destructive',
        });
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-bold text-gradient">Núcleo</span>
          </div>
        </div>

        <Card className="p-6 shadow-brand">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Verificando e-mail...</h3>
                <p className="text-sm text-muted-foreground">
                  Aguarde enquanto verificamos seu e-mail
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">E-mail Verificado!</h3>
                <p className="text-sm text-muted-foreground">
                  {message || 'Sua conta foi ativada com sucesso. Agora você pode fazer login.'}
                </p>
              </div>

              <Button onClick={() => navigate('/auth/login')} className="w-full">
                Fazer Login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Erro na Verificação</h3>
                <p className="text-sm text-muted-foreground">
                  {message || 'Token inválido ou expirado. Solicite um novo e-mail de verificação.'}
                </p>
              </div>

              <div className="space-y-2">
                <Button onClick={() => navigate('/auth/login')} className="w-full">
                  Ir para Login
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth/resend-verification')} 
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar E-mail de Verificação
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar para login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default VerifyEmail;


