'use client';

import { useState } from 'react';
import { requestWaiter } from '@/app/actions/waiter-actions';
import { WaiterCallType } from '@/types';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

interface WaiterCallModalProps {
    restaurantId: string;
    tableId: string | null;
    onClose: () => void;
}

export function WaiterCallModal({ restaurantId, tableId, onClose }: WaiterCallModalProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [selectedType, setSelectedType] = useState<WaiterCallType | null>(null);
    const t = useTranslations('client');

    const types: { id: WaiterCallType, label: string, icon: string }[] = [
        { id: 'waiter', label: t('waiter'), icon: '👋' },
        { id: 'bill', label: 'Hesap Lütfen', icon: '🧾' },
        { id: 'order', label: 'Sipariş Vereceğim', icon: '🍽️' },
        { id: 'other', label: 'Diğer', icon: '❓' }
    ];

    const handleSubmit = async () => {
        if (!selectedType) return;
        setStatus('loading');

        try {
            await requestWaiter(restaurantId, tableId, selectedType);
            setStatus('success');
            toast.success("Haber Verildi!", { duration: 3000 });
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            toast.error("İstek gönderilemedi.");
        }
    };

    if (status === 'success') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in backdrop-blur-sm">
                <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        ✅
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Haber Verildi!</h3>
                    <p className="text-gray-500">Garsonunuz en kısa sürede masanıza gelecek.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 text-gray-500 hover:text-black rounded-full flex items-center justify-center transition-colors"
                >
                    ✕
                </button>

                <div className="p-6 md:p-8">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
                            👋
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{t('waiter')} Çağır</h2>
                        <p className="text-sm text-gray-500 mt-1">Lütfen talebinizi seçin</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {types.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedType === type.id
                                    ? 'border-black bg-black text-white shadow-md scale-[1.02]'
                                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-2xl mb-2">{type.icon}</span>
                                <span className="text-xs font-bold text-center">{type.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!selectedType || status === 'loading'}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                            ${selectedType ? 'bg-blue-600 hover:bg-blue-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}
                        `}
                    >
                        {status === 'loading' ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Çağır'
                        )}
                    </button>

                    {tableId && (
                        <p className="mt-4 text-center text-xs text-gray-400">
                            Masa: <span className="font-bold text-gray-600">#{tableId}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
