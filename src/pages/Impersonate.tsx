import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Impersonate() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // Optionally store admin token backup if needed
        }
        // Redirect to dashboard (home)
        navigate('/', { replace: true });
    }, [location, navigate]);

    return null;
}
