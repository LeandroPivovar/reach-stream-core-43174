import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe seu e-mail',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.resendVerificationEmail(email);
      setIsSuccess(true);
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada',
      });
    } catch (error) {
      toast({
        title: 'Erro ao reenviar e-mail',
        description: error instanceof Error ? error.message : 'Não foi possível reenviar o e-mail',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-muted-foreground">
            Reenviar e-mail de verificação
          </p>
        </div>

        <Card className="p-6 shadow-brand">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enviaremos um novo e-mail de verificação para este endereço
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Reenviar E-mail'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">E-mail Enviado!</h3>
                <p className="text-sm text-muted-foreground">
                  Se o e-mail existir e a conta não estiver verificada, um novo e-mail foi enviado para <strong>{email}</strong>
                </p>
              </div>

              <Button onClick={() => navigate('/auth/login')} className="w-full">
                Ir para Login
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para login</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}


