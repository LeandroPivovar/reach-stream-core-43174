import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [show2fa, setShow2fa] = useState(false);
  const [tfaCode, setTfaCode] = useState('');
  const [tfaEmail, setTfaEmail] = useState('');

  // Mostrar mensagem se vier do registro
  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      toast({
        title: 'Conta criada!',
        description: state.message,
      });
    }
  }, [location.state, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.twoFactorRequired) {
        setShow2fa(true);
        setTfaEmail(response.email || formData.email);
        toast({
          title: 'Autenticação de Dois Fatores',
          description: 'Um código de segurança foi enviado para o seu e-mail.',
        });
        return;
      }

      // Usar o contexto de autenticação para fazer login
      if (response.token && response.user) {
        login(response.token, response.user);
        completeLogin(response);
      } else {
        throw new Error('Erro ao processar resposta de login');
      }
    } catch (error) {
      toast({
        title: 'Erro ao fazer login',
        description: error instanceof Error ? error.message : 'Credenciais inválidas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.verify2fa(tfaEmail, tfaCode);

      if (response.token && response.user) {
        login(response.token, response.user);
        completeLogin(response);
      } else {
        throw new Error('Código inválido ou expirado');
      }
    } catch (error) {
      toast({
        title: 'Erro na verificação',
        description: error instanceof Error ? error.message : 'Código inválido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeLogin = (response: any) => {
    // Verificar se há uma conexão pendente da Nuvemshop
    const pendingConnection = localStorage.getItem('nuvemshop_pending_connection');
    if (pendingConnection) {
      try {
        const connectionData = JSON.parse(pendingConnection);
        api.connectNuvemshop(connectionData).then(() => {
          localStorage.removeItem('nuvemshop_pending_connection');
          toast({
            title: 'Nuvemshop conectada!',
            description: 'Sua loja foi conectada com sucesso após o login.',
          });
          navigate('/integracoes', { replace: true });
        }).catch(err => {
          console.error('Erro ao completar conexão Nuvemshop:', err);
        });
        return;
      } catch (error) {
        console.error('Erro ao completar conexão Nuvemshop:', error);
      }
    }

    toast({
      title: 'Login realizado com sucesso!',
      description: 'Bem-vindo de volta',
    });

    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
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
            Faça login na sua conta
          </p>
        </div>

        <Card className="p-6 shadow-brand">
          {!show2fa ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2faSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Digite o código de 6 dígitos enviado para:
                </p>
                <p className="font-medium">{tfaEmail}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tfaCode">Código de Segurança</Label>
                <Input
                  id="tfaCode"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-[10px] font-bold"
                  value={tfaCode}
                  onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || tfaCode.length !== 6}>
                {isLoading ? 'Verificando...' : 'Verificar Código'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setShow2fa(false)}
                disabled={isLoading}
              >
                Voltar para o login
              </Button>
            </form>
          )}

          {!show2fa && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link to="/auth/register" className="text-primary hover:underline font-medium">
                  Criar conta
                </Link>
              </p>
            </div>
          )}
        </Card>

        {/* 2FA Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Protegemos sua conta com autenticação de dois fatores
          </p>
        </div>
      </div>
    </div>
  );
}