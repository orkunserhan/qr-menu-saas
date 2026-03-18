'use client';

import { useState, useEffect, useRef, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getActiveWaiterCalls, completeWaiterCall } from '@/app/actions/waiter-actions';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function WaiterCallsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: restaurantId } = use(params);
    const [calls, setCalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const prevCallsLength = useRef(0);

    // Otel zili sesi (Açık kaynak / Data URI format)
    const bellSoundUrl = 'https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg';

    useEffect(() => {
        fetchCalls();

        const supabase = createClient();
        const channel = supabase
            .channel('waiter-calls-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'waiter_calls',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                (payload) => {
                    const newCall = payload.new;
                    setCalls((prev) => [newCall, ...prev]);

                    // Ses Çal
                    try {
                        const audio = new Audio(bellSoundUrl);
                        audio.play().catch(e => console.log('Audio play blocked:', e));
                    } catch (e) { }

                    toast.success(`${newCall.table_id || 'Bir masa'} garson çağırdı!`, {
                        icon: '🛎️',
                        duration: 5000
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [restaurantId]);

    const fetchCalls = async () => {
        setLoading(true);
        const res = await getActiveWaiterCalls(restaurantId);
        if (res.success && res.calls) {
            setCalls(res.calls);
            prevCallsLength.current = res.calls.length;
        } else {
            toast.error("Çağrılar yüklenemedi.");
        }
        setLoading(false);
    };

    const handleComplete = async (callId: string) => {
        const res = await completeWaiterCall(callId);
        if (res.success) {
            setCalls(calls.filter(c => c.id !== callId));
            toast.success("Çağrı tamamlandı.");
        } else {
            toast.error("İşlem başarısız oldu.");
        }
    };

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'waiter': return { label: 'Garson Çağrısı', icon: '👋', color: 'bg-blue-100 text-blue-700' };
            case 'bill': return { label: 'Hesap İsteği', icon: '🧾', color: 'bg-green-100 text-green-700' };
            case 'order': return { label: 'Sipariş Verecek', icon: '🍽️', color: 'bg-orange-100 text-orange-700' };
            default: return { label: 'Diğer Talepler', icon: '❓', color: 'bg-gray-100 text-gray-700' };
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        🛎️ Garson Çağrıları
                        {calls.length > 0 && (
                            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                                {calls.length} Yeni
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Masalardan gelen anlık çağrıları, hesap ve sipariş isteklerini yönetin.
                    </p>
                </div>
                <button
                    onClick={fetchCalls}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors text-gray-600"
                    title="Yenile"
                >
                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                </div>
            ) : calls.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">😴</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Bekleyen çağrı yok</h3>
                    <p className="text-gray-500">Şu an için tüm masalar memnun görünüyor.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {calls.map((call) => {
                        const { label, icon, color } = getTypeDetails(call.type);
                        const timeAgo = formatDistanceToNow(new Date(call.created_at), { addSuffix: true, locale: tr });
                        const isUrgent = new Date().getTime() - new Date(call.created_at).getTime() > 5 * 60 * 1000; // 5 dkk'dan eski

                        return (
                            <div key={call.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${isUrgent ? 'border-red-200' : 'border-gray-100'} relative overflow-hidden group`}>
                                {isUrgent && (
                                    <div className="absolute top-0 right-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                        Gecikti
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
                                        {icon}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400">{timeAgo}</div>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{label}</h3>
                                <div className="text-gray-600 font-medium bg-gray-50 inline-block px-3 py-1 rounded-lg text-sm mb-6">
                                    Masa: {call.table_id || 'Belirtilmedi'}
                                </div>

                                <button
                                    onClick={() => handleComplete(call.id)}
                                    className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md active:scale-95"
                                >
                                    İlgilenildi
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
