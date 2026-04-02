'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { tr, enUS, de, it, fr, sk } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { updateOrderStatus } from '@/app/actions/order-actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

const dateLocales: any = { tr, en: enUS, de, it, fr, sk };

type Order = {
    id: string;
    table_id: string | null;
    total_amount: number;
    status: 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
    created_at: string;
    customer_note?: string;
    order_items: {
        id: string;
        quantity: number;
        products: {
            name: string;
        } | null;
    }[];
};

export function OrdersTracker({ restaurantId }: { restaurantId: string }) {
    const t = useTranslations('restAdmin.orders');
    const tToast = useTranslations('restAdmin.toast');
    const locale = useLocale();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const supabase = createClient();

    // Unlock audio on first user interaction
    useEffect(() => {
        const unlock = () => {
            setSoundEnabled(true);
            document.removeEventListener('click', unlock);
        };
        document.addEventListener('click', unlock, { once: true });
        return () => document.removeEventListener('click', unlock);
    }, []);

    // Fetch initial orders
    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(name))')
            .eq('restaurant_id', restaurantId)
            .in('status', ['pending', 'preparing', 'served'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch Error:', error);
            toast.error(tToast('loadError'));
        } else {
            setOrders(data as any);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();

        // Subscribe to Realtime changes
        const channel = supabase
            .channel(`orders_tracker_${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        toast.success(`${t('newOrderToast')}!`, {
                            duration: 5000,
                            icon: '🔔'
                        });
                        playNotificationSound();
                        fetchOrders();
                    } else if (payload.eventType === 'UPDATE') {
                        fetchOrders();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [restaurantId]);

    const playNotificationSound = () => {
        if (!soundEnabled) return;
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.8;
            audio.play().catch(e => console.warn('Audio play failed:', e));
        } catch (e) {
            console.error('Audio Error', e);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
        const previousOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        if (newStatus === 'paid' || newStatus === 'cancelled') {
            setTimeout(() => {
                setOrders(prev => prev.filter(o => o.id !== orderId));
            }, 500);
        }

        const result = await updateOrderStatus(orderId, newStatus, restaurantId);
        if (!result.success) {
            toast.error(tToast('error') + ": " + result.error);
            setOrders(previousOrders);
        } else {
            toast.success(tToast('saved'));
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse dark:text-zinc-500">{t('loading')}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode='popLayout'>
                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center py-20 text-gray-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800"
                    >
                        <div className="text-6xl mb-4 grayscale opacity-50">📭</div>
                        <h3 className="text-xl font-medium text-gray-600 dark:text-zinc-400">{t('noActiveOrders')}</h3>
                        <p className="text-sm">{t('noOrdersDesc')}</p>
                    </motion.div>
                ) : (
                    orders.map((order) => (
                        <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={`bg-white dark:bg-zinc-900 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 overflow-hidden flex flex-col ${order.status === 'pending' ? 'border-red-500' :
                                    order.status === 'preparing' ? 'border-yellow-500' :
                                        'border-green-500'
                                }`}
                        >
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-black tracking-widest mb-0.5">
                                            #{order.id.split('-')[0]}
                                        </div>
                                        <h3 className="font-black text-lg md:text-xl text-gray-900 dark:text-zinc-100 italic">
                                            {order.table_id ? `${t('table')} ${order.table_id}` : t('takeaway')}
                                        </h3>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-bold">
                                            🕒 {format(new Date(order.created_at), 'HH:mm', { locale: dateLocales[locale] || enUS })}
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-colors ${order.status === 'pending' ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' :
                                            order.status === 'preparing' ? 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30' :
                                                'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30'
                                        }`}>
                                        {t(`status.${order.status}`)}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 dark:border-zinc-800 last:border-0 border-dashed">
                                            <span className="font-bold text-gray-800 dark:text-zinc-300">
                                                <span className="bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-zinc-400 text-xs mr-2 font-black tabular-nums">x{item.quantity}</span>
                                                {item.products?.name || '---'}
                                            </span>
                                        </div>
                                    ))}
                                    {order.customer_note && (
                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-2.5 rounded-lg text-xs text-orange-800 dark:text-orange-300 mt-2 border border-orange-100 dark:border-orange-900/20 flex gap-2 font-medium">
                                            <span>📝</span>
                                            <span className="italic">{order.customer_note}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusChange(order.id, 'preparing')}
                                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white dark:text-zinc-950 py-2.5 rounded-lg font-black text-sm transition-all shadow-md active:translate-y-0.5"
                                        >
                                            👨‍🍳 {t('startPreparing')}
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => handleStatusChange(order.id, 'served')}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white dark:text-zinc-950 py-2.5 rounded-lg font-black text-sm transition-all shadow-md active:translate-y-0.5"
                                        >
                                            ✅ {t('serve')}
                                        </button>
                                    )}
                                    {order.status === 'served' && (
                                        <button
                                            onClick={() => handleStatusChange(order.id, 'paid')}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:text-zinc-950 py-2.5 rounded-lg font-black text-sm transition-all shadow-md active:translate-y-0.5"
                                        >
                                            💳 {t('closeAccount')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (window.confirm(t('confirmCancel'))) {
                                                handleStatusChange(order.id, 'cancelled');
                                            }
                                        }}
                                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors"
                                    >
                                        {t('cancelOrder')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    );
}
