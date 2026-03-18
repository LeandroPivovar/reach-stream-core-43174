import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Impersonate() {
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
        }
        // No redirect; user should keep this page open in incognito mode.
    }, [location]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Link de Impersonação</h1>
            <p className="text-center max-w-md">
                O token foi armazenado no seu navegador. Abra esta aba em modo anônimo (incógnito) para acessar a conta do usuário selecionado. Você pode fechar esta janela após o carregamento.
            </p>
        </div>
    );
}
