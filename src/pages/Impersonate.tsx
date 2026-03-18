import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Impersonate() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // After setting the token, redirect to dashboard
            const timer = setTimeout(() => {
                navigate('/', { replace: true });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [location, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Autenticando...</h1>
            <p className="text-center max-w-md">
                Aguarde um momento enquanto preparamos sua sessão.
            </p>
        </div>
    );
}
