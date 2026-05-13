import { useState, useEffect } from 'react';
import { http } from '../services/http.js';

export const useBusinessHours = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkStoreStatus();
        // Verificar status a cada 5 minutos
        const interval = setInterval(checkStoreStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const checkStoreStatus = async () => {
        try {
            setLoading(true);
            const response = await http.get('/orders/business-hours/status');
            setStatus(response.data);
            setError(null);
        } catch (err) {
            setError('Erro ao verificar status da loja');
            console.error('Erro ao verificar status da loja:', err);
        } finally {
            setLoading(false);
        }
    };

    return { status, loading, error, checkStoreStatus };
};
