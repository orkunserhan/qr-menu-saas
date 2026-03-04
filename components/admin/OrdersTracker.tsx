'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { updateOrderStatus } from '@/app/actions/order-actions';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

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
            toast.error("Siparişler yüklenemedi");
        } else {
            console.log("Fetched Orders:", data);
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
                    console.log('Realtime Order Update:', payload);
                    if (payload.eventType === 'INSERT') {
                        toast.success(`Yeni Sipariş! Masa: ${payload.new.table_id || 'Belirsiz'}`, {
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
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') console.log('Realtime Subscribed');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [restaurantId]);

    const playNotificationSound = () => {
        try {
            // Updated to look for a reliable path, though user might not have the file yet.
            // Using a standard beep if possible or just logging.
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(e => console.log("Audio play failed", e));
        } catch (e) {
            console.error("Audio Error", e);
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
            toast.error("Durum güncellenemedi: " + result.error);
            setOrders(previousOrders);
        } else {
            toast.success("Durum güncellendi");
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Siparişler Yükleniyor...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode='popLayout'>
                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200"
                    >
                        <div className="text-6xl mb-4 grayscale opacity-50">📭</div>
                        <h3 className="text-xl font-medium text-gray-600">Aktif Sipariş Yok</h3>
                        <p className="text-sm">Yeni siparişler anlık olarak buraya düşecek.</p>
                    </motion.div>
                ) : (
                    orders.map((order) => (
                        <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 overflow-hidden flex flex-col ${order.status === 'pending' ? 'border-red-500' :
                                    order.status === 'preparing' ? 'border-yellow-500' :
                                        'border-green-500'
                                }`}
                        >
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
                                            #{order.id.split('-')[0]}
                                        </div>
                                        <h3 className="font-bold text-lg md:text-xl text-gray-800">
                                            {order.table_id ? `Masa ${order.table_id}` : 'Paket Servis'}
                                        </h3>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            🕒 {format(new Date(order.created_at), 'HH:mm', { locale: tr })}
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${order.status === 'pending' ? 'bg-red-50 text-red-600 border-red-100' :
                                            order.status === 'preparing' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                'bg-green-50 text-green-600 border-green-100'
                                        }`}>
                                        {order.status === 'pending' ? 'Bekliyor' :
                                            order.status === 'preparing' ? 'Hazırlanıyor' :
                                                'Servis Edildi'}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0 border-dashed">
                                            <span className="font-medium text-gray-800">
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 text-xs mr-2">x{item.quantity}</span>
                                                {item.products?.name || 'Silinmiş Ürün'}
                                            </span>
                                        </div>
                                    ))}
                                    {order.customer_note && (
                                        <div className="bg-orange-50 p-2.5 rounded-lg text-xs text-orange-800 mt-2 border border-orange-100 flex gap-2">
                                            <span>📝</span>
                                            <span className="italic">{order.customer_note}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-2 mt-auto pt-4 border-t border-gray-100">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusChange(order.id, 'preparing')}
                                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm active:translate-y-0.5"
                                        >
                                            Hazırlamaya Başla
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => handleStatusChange(order.id, 'served')}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm active:translate-y-0.5"
                                        >
                                            Servis Et
                                        </button>
                                    )}
                                    {order.status === 'served' && (
                                        <button
                                            onClick={() => handleStatusChange(order.id, 'paid')}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm active:translate-y-0.5"
                                        >
                                            Hesabı Kapat (Ödendi)
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Siparişi iptal etmek istediğinize emin misiniz?')) {
                                                handleStatusChange(order.id, 'cancelled');
                                            }
                                        }}
                                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg font-medium text-xs transition-colors"
                                    >
                                        İptal Et
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
