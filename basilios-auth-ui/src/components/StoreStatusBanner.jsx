import { useBusinessHours } from '../hooks/useBusinessHours.js';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function StoreStatusBanner() {
    const { status, loading } = useBusinessHours();

    if (loading || !status) return null;

    if (status.open) {
        return (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4">
                <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-green-800">✅ Loja Aberta</p>
                        <p className="text-xs text-green-700 mt-1">{status.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
            <div className="flex items-start gap-3">
                <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-amber-800">⏰ Loja Fechada</p>
                    <p className="text-xs text-amber-700 mt-1">{status.message}</p>
                    {status.businessHours && (
                        <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700 font-mono">
                            <p className="whitespace-pre-wrap">{status.businessHours}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
