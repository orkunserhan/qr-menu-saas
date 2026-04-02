'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';

interface OrdersTableProps {
    restaurantId: string;
}

const PAGE_SIZE = 15;

export function OrdersTable({ restaurantId }: OrdersTableProps) {
    const t = useTranslations('components.orders');
    const [orders, setOrders] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchOrders();
    }, [page, restaurantId]);

    const fetchOrders = async () => {
        setLoading(true);
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (!error && data) {
            setOrders(data);
            if (count !== null) setTotalCount(count);
        }
        setLoading(false);
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-xs">{t('orderHistory')}</h3>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold">{totalCount} {t('totalRecords')}</span>
            </div>
            
            <div className="overflow-x-auto min-h-[400px]">
                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 dark:bg-zinc-800/50 text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">{t('date')}</th>
                                <th className="px-6 py-4">{t('table')}</th>
                                <th className="px-6 py-4">{t('totalAmount')}</th>
                                <th className="px-6 py-4">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white">#{order.id.slice(0, 6)}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{format(new Date(order.created_at), 'dd MMM, HH:mm')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs ring-1 ring-blue-100 dark:ring-blue-900/30">
                                            {order.table_number || 'QR'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-black text-gray-900 dark:text-white">
                                        {Number(order.total_amount).toFixed(2)} €
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ring-1 ${
                                            order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' :
                                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 ring-red-100' :
                                            'bg-yellow-50 text-yellow-700 ring-yellow-100'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium italic">
                                        {t('noOrdersFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-4 bg-gray-50/30 dark:bg-zinc-900/50">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.max(0, prev - 1))} 
                    disabled={page === 0 || loading}
                    className="h-8 text-[10px] font-bold uppercase transition-all shadow-sm"
                >
                    {t('prev')}
                </Button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const pageNum = i; // simple logic for now
                         return (
                            <button
                                key={i}
                                onClick={() => setPage(pageNum)}
                                className={`w-8 h-8 text-[10px] font-bold rounded-lg transition-all ${page === pageNum ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                {pageNum + 1}
                            </button>
                        );
                    })}
                    {totalPages > 5 && <span className="text-gray-300 mx-1">...</span>}
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))} 
                    disabled={page >= totalPages - 1 || loading}
                    className="h-8 text-[10px] font-bold uppercase transition-all shadow-sm"
                >
                    {t('next')}
                </Button>
            </div>
        </div>
    );
}
