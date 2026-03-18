import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

export default function Impersonate() {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
            setError('Token não encontrado na URL.');
            return;
        }

        const authenticate = async () => {
            try {
                // 1. Set the token first
                localStorage.setItem('token', token);

                // 2. Fetch the user info using the token
                const user = await api.getCurrentUser();

                // 3. Store the user info (AuthProvider requires both)
                localStorage.setItem('user', JSON.stringify(user));

                // 4. Redirect to dashboard
                navigate('/', { replace: true });
            } catch (err) {
                console.error('Erro ao autenticar simulado:', err);
                setError('Falha ao autenticar o usuário. O token pode ter expirado.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        };

        authenticate();
    }, [location, navigate]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-2xl font-bold mb-4 text-destructive">Erro na Simulação</h1>
                <p className="text-center max-w-md mb-6">{error}</p>
                <button
                    onClick={() => navigate('/auth/login')}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                    Voltar para Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4 animate-pulse">Autenticando...</h1>
            <p className="text-center max-w-md">
                Aguarde um momento enquanto preparamos sua sessão.
            </p>
        </div>
    );
}
