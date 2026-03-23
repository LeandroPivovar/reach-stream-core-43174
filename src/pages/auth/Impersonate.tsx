import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Impersonate() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            const t = searchParams.get('t');
            const u = searchParams.get('u');

            if (!t || !u) {
                throw new Error('Link inválido ou incompleto.');
            }

            const userData = JSON.parse(atob(u));

            // Realizar login forçado
            login(t, userData);

            // Redirecionar para dashboard em breve
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1000);
        } catch (err) {
            console.error('Falha no impersonate:', err);
            setError('Falha ao autenticar com o link fornecido. Verifique se o link está correto.');
        }
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
