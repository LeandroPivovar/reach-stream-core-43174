import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function Impersonate() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const authenticate = async () => {
            try {
                const t = searchParams.get('t');
                const u = searchParams.get('u');

                if (!t) {
                    throw new Error('Link inválido ou incompleto.');
                }

                localStorage.setItem('token', t);

                let userData;
                if (u) {
                    try {
                        userData = JSON.parse(decodeURIComponent(escape(atob(u))));
                    } catch {
                        userData = JSON.parse(atob(u));
                    }
                } else {
                    userData = await api.getCurrentUser();
                }

                if (cancelled) return;

                // Realizar login forçado
                login(t, userData);

                // Redirecionar para dashboard em breve
                setTimeout(() => {
                    if (cancelled) return;
                    navigate('/dashboard', { replace: true });
                }, 1000);
            } catch (err) {
                console.error('Falha no impersonate:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (cancelled) return;
                setError('Falha ao autenticar com o link fornecido. Verifique se o link está correto.');
            }
        };

        authenticate();

        return () => {
            cancelled = true;
        };
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
            <Card className="p-8 flex flex-col items-center max-w-sm w-full shadow-brand text-center">
                {error ? (
                    <div className="text-destructive font-medium">{error}</div>
                ) : (
                    <>
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <h2 className="text-xl font-bold mb-2">Acessando como usuário...</h2>
                        <p className="text-muted-foreground text-sm">Validando credenciais de administrador.</p>
                    </>
                )}
            </Card>
        </div>
    );
}
