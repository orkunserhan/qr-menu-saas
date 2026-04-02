'use client';

import { useState, useEffect, useRef, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getActiveWaiterCalls, completeWaiterCall } from '@/app/actions/waiter-actions';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS, de, it, fr, sk } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';
import HelpWidget from '@/components/admin/HelpWidget';

const dateLocales: any = { tr, en: enUS, de, it, fr, sk };

export default function WaiterCallsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: restaurantId } = use(params);
    const t = useTranslations('restAdmin.waiter');
    const tToast = useTranslations('restAdmin.toast');
    const locale = useLocale();
    const [soundEnabled, setSoundEnabled] = useState(false);
    
    const [calls, setCalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const prevCallsLength = useRef(0);

    const bellSoundUrl = '/sounds/notification.mp3';

    // Unlock audio on first user interaction
    useEffect(() => {
        const unlock = () => setSoundEnabled(true);
        document.addEventListener('click', unlock, { once: true });
        return () => document.removeEventListener('click', unlock);
    }, []);

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

                    if (soundEnabled) {
                        try {
                            const audio = new Audio(bellSoundUrl);
                            audio.volume = 0.9;
                            audio.play().catch(e => console.log('Audio play blocked:', e));
                        } catch (e) { }
                    }

                    toast.success(`${t('table')} ${newCall.table_id || t('tablePlaceholder')} ${t('newBadge')}!`, {
                        icon: '🛎️',
                        duration: 5000
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [restaurantId, soundEnabled]); // Depend on soundEnabled to play correctly

    const fetchCalls = async () => {
        setLoading(true);
        const res = await getActiveWaiterCalls(restaurantId);
        if (res.success && res.calls) {
            setCalls(res.calls);
            prevCallsLength.current = res.calls.length;
        } else {
            toast.error(tToast('loadError'));
        }
        setLoading(false);
    };

    const handleComplete = async (callId: string) => {
        const res = await completeWaiterCall(callId);
        if (res.success) {
            setCalls(calls.filter(c => c.id !== callId));
            toast.success(tToast('waiterCallResolved'));
        } else {
            toast.error(tToast('error'));
        }
    };

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'waiter': return { label: t('types.waiter'), icon: '👋', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' };
            case 'bill': return { label: t('types.bill'), icon: '🧾', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' };
            case 'order': return { label: t('types.order'), icon: '🍽️', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' };
            default: return { label: t('types.other'), icon: '❓', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors uppercase italic">
                            {t('title')}
                            {calls.length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">
                                    {calls.length} {t('newBadge')}
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 dark:text-zinc-500 mt-2 transition-colors font-medium">
                            {t('description')}
                        </p>
                    </div>
                    <button
                        onClick={fetchCalls}
                        className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm transition-all text-gray-600 dark:text-zinc-500"
                    >
                        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-black/20 dark:border-white/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                ) : calls.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-zinc-800 shadow-sm transition-colors">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl grayscale opacity-50">😴</div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{t('emptyTitle')}</h3>
                        <p className="text-gray-500 dark:text-zinc-500 font-medium">{t('emptyDesc')}</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {calls.map((call) => {
                            const { label, icon, color } = getTypeDetails(call.type);
                            const timeAgo = formatDistanceToNow(new Date(call.created_at), { 
                                addSuffix: true, 
                                locale: dateLocales[locale] || enUS 
                            });
                            const isUrgent = new Date().getTime() - new Date(call.created_at).getTime() > 5 * 60 * 1000;

                            return (
                                <div key={call.id} className={`bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border-2 transition-all ${isUrgent ? 'border-red-200 dark:border-red-900/30' : 'border-gray-50 dark:border-zinc-800'} relative overflow-hidden group`}>
                                    {isUrgent && (
                                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                                            {t('urgentLabel')}
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${color}`}>
                                            {icon}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-widest">{timeAgo}</div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{label}</h3>
                                    <div className="text-gray-700 dark:text-zinc-300 font-black bg-gray-100 dark:bg-zinc-800 inline-block px-3 py-1 rounded-lg text-xs mb-6 transition-colors shadow-inner italic border border-gray-200 dark:border-zinc-700">
                                        {t('table')}: {call.table_id || t('tablePlaceholder')}
                                    </div>

                                    <button
                                        onClick={() => handleComplete(call.id)}
                                        className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/5"
                                    >
                                        {t('buttonDone')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <HelpWidget />
        </div>
    );
}
