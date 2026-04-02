'use client';

import { useState, useEffect } from 'react';
import { getActiveOrders, updateOrderStatus } from '@/app/actions/order-actions';
import { getActiveWaiterCalls, completeWaiterCall } from '@/app/actions/waiter-actions';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

// Order Status Colors
const statusColors = {
    pending: 'bg-red-500 text-white animate-pulse', // Yeni Sipariş
    preparing: 'bg-orange-500 text-white', // Hazırlanıyor
    served: 'bg-green-600 text-white', // Servis Edildi
    paid: 'bg-zinc-500 text-white',
    cancelled: 'bg-zinc-300 text-zinc-600'
};

const callIcons: Record<string, string> = {
    waiter: '👋',
    payment: '🧾',
    order: '🍽️',
    other: '❓'
};

export function LiveTableMonitor({ restaurantId, initialTables, staffList = [] }: { restaurantId: string, initialTables: any[], staffList?: any[] }) {
    const t = useTranslations('admin.monitor');
    const tc = useTranslations('components');
    const [orders, setOrders] = useState<any[]>([]);
    const [waiterCalls, setWaiterCalls] = useState<any[]>([]);
    const [selectedTable, setSelectedTable] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const [ordersRes, callsRes] = await Promise.all([
            getActiveOrders(restaurantId),
            getActiveWaiterCalls(restaurantId)
        ]);

        if (ordersRes.success) {
            setOrders(ordersRes.orders || []);
        }
        if (callsRes.success) {
            setWaiterCalls(callsRes.calls || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: any) => {
        await updateOrderStatus(orderId, newStatus, restaurantId);
        fetchData();
    };

    const handleCompleteCall = async (callId: string) => {
        await completeWaiterCall(callId);
        fetchData();
        if (selectedTable?.activeCall?.id === callId) {
            setSelectedTable((prev: any) => ({ ...prev, activeCall: null }));
        }
    };

    return (
        <div className="space-y-4 relative">

            {/* Notification Panel */}
            {waiterCalls.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 p-4 rounded-xl flex flex-wrap gap-4 items-center animate-in slide-in-from-top-4">
                    <span className="font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2">
                        🔔 {t('activeCalls', { count: waiterCalls.length })}
                    </span>
                    {waiterCalls.map(call => {
                        const table = initialTables.find(t => t.id === call.table_id);
                        const tableName = table?.name || t('unknownTable');
                        const assignedStaff = staffList.find(s => s.id === table?.assigned_staff_id);
                        
                        return (
                            <div key={call.id} className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg shadow-sm text-sm border border-orange-100 dark:border-orange-500/10">
                                <span>{callIcons[call.type] || '❓'}</span>
                                <span className="font-bold">{tableName}</span>
                                {assignedStaff && <span className="text-[10px] bg-black text-white px-1.5 rounded font-black">{assignedStaff.name.split(' ')[0]}</span>}
                                <span className="text-gray-500 text-xs">({t(`calls.${call.type}`)})</span>
                                <button
                                    onClick={() => handleCompleteCall(call.id)}
                                    className="ml-2 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 hover:bg-green-100 dark:hover:bg-green-500/20 text-gray-400 hover:text-green-600 rounded-full transition-colors"
                                    title={t('markAsCompleted')}
                                >
                                    ✓
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Live Canvas */}
            <div className="relative w-full h-[600px] bg-zinc-950 border-4 border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="absolute top-6 left-6 z-10">
                    <div className="bg-white/10 text-white px-4 py-2 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md flex items-center gap-3 border border-white/10 uppercase">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                        {t('liveMode')}
                    </div>
                </div>

                {initialTables.map(table => {
                    const activeOrder = orders.find(o => o.table_id === table.id);
                    const activeCall = waiterCalls.find(c => c.table_id === table.id);
                    const assignedStaff = staffList.find(s => s.id === table.assigned_staff_id);

                    return (
                        <div
                            key={table.id}
                            onClick={() => setSelectedTable({ table, order: activeOrder, activeCall, staff: assignedStaff })}
                            style={{
                                left: `${table.position_x}%`,
                                top: `${table.position_y}%`,
                                position: 'absolute'
                            }}
                            className={`
                                w-24 h-24 rounded-2xl shadow-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border-2
                                ${activeCall
                                    ? 'bg-orange-500 border-orange-300 text-white animate-bounce shadow-[0_0_20px_rgba(249,115,22,0.8)] z-20'
                                    : activeOrder
                                        ? statusColors[activeOrder.status as keyof typeof statusColors] + ' border-white/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                                }
                            `}
                        >
                            {assignedStaff && (
                                <div className="absolute -top-2 bg-white text-black text-[7px] font-black px-1.5 py-0.5 rounded-full z-30 shadow-md uppercase">
                                    {assignedStaff.name.split(' ')[0]}
                                </div>
                            )}

                            {activeCall && (
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-orange-600 rounded-full flex items-center justify-center border-2 border-orange-500 shadow-xl z-30 text-lg">
                                    {callIcons[activeCall.type]}
                                </div>
                            )}

                            <span className="font-black text-xs text-center px-1 leading-tight uppercase tracking-tighter">{table.name}</span>

                            {activeOrder && !activeCall && (
                                <div className="mt-1 flex flex-col items-center">
                                    <span className="text-[10px] font-black bg-black/20 px-1.5 rounded">
                                        {activeOrder.total_amount} €
                                    </span>
                                    <span className="text-[8px] font-black opacity-90 mt-0.5 uppercase tracking-widest">
                                        {t(`status.${activeOrder.status}`)}
                                    </span>
                                </div>
                            )}

                            {activeCall && (
                                <div className="mt-1 flex flex-col items-center">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/90">
                                        {t(`calls.${activeCall.type}`)}
                                    </span>
                                </div>
                            )}

                            {/* Decorative Chairs */}
                            <div className="absolute -top-2 w-10 h-1.5 bg-white/10 rounded-full"></div>
                            <div className="absolute -bottom-2 w-10 h-1.5 bg-white/10 rounded-full"></div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Detail */}
            {selectedTable && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 animate-in fade-in transition-all">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl relative scale-in-center border border-white/10">
                        <button
                            onClick={() => setSelectedTable(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="mb-8 border-b dark:border-zinc-800 pb-6">
                            <h3 className="font-black text-3xl text-gray-900 dark:text-white flex items-center gap-3 tracking-tighter">
                                {selectedTable.table.name}
                                {selectedTable.activeCall && (
                                    <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full animate-pulse border border-orange-200 dark:border-orange-500/30 uppercase tracking-widest">
                                        {callIcons[selectedTable.activeCall.type]}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('tableDetails')}</p>
                                {selectedTable.staff && (
                                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                        👤 {selectedTable.staff.name} ({tc(`staffRoles.${selectedTable.staff.role}`)})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Waiter Call Action */}
                        {selectedTable.activeCall && (
                            <div className="mb-8 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 p-6 rounded-3xl flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">{callIcons[selectedTable.activeCall.type]}</div>
                                    <div>
                                        <div className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{t(`calls.${selectedTable.activeCall.type}`)}</div>
                                        <div className="text-xs font-bold text-orange-600/60 font-mono">
                                            {new Date(selectedTable.activeCall.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleCompleteCall(selectedTable.activeCall.id)}
                                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                                >
                                    {t('markAsCompleted')}
                                </Button>
                            </div>
                        )}

                        {selectedTable.order ? (
                            <div className="space-y-8">
                                {/* Product List */}
                                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedTable.order.order_items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-sm border-b dark:border-zinc-800 border-gray-50 pb-4">
                                            <div className="flex gap-4 items-center">
                                                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg font-black text-gray-700 dark:text-zinc-300 text-xs">{item.quantity}x</span>
                                                <span className="text-gray-900 dark:text-zinc-100 font-bold">{item.products?.name || 'Product'}</span>
                                            </div>
                                            <span className="font-black tabular-nums">{item.price_at_time * item.quantity} €</span>
                                        </div>
                                    ))}
                                </div>

                                {selectedTable.order.customer_note && (
                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
                                        <span className="font-black text-zinc-900 dark:text-zinc-200 uppercase text-[10px] block mb-1 tracking-widest">{t('note')}</span> 
                                        {selectedTable.order.customer_note}
                                    </div>
                                )}

                                <div className="flex justify-between items-end pt-4 border-t dark:border-zinc-800">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('totalAmount')}</span>
                                    <span className="text-4xl font-black tabular-nums dark:text-white">{selectedTable.order.total_amount} €</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    {selectedTable.order.status === 'pending' && (
                                        <Button
                                            onClick={() => handleStatusUpdate(selectedTable.order.id, 'preparing')}
                                            className="col-span-2 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                        >
                                            👨‍🍳 {t('startPreparing')}
                                        </Button>
                                    )}

                                    {selectedTable.order.status === 'preparing' && (
                                        <Button
                                            onClick={() => handleStatusUpdate(selectedTable.order.id, 'served')}
                                            className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                                        >
                                            ✅ {t('serve')}
                                        </Button>
                                    )}

                                    {(selectedTable.order.status === 'served' || selectedTable.order.status === 'preparing') && (
                                        <>
                                            <Button
                                                onClick={() => handleStatusUpdate(selectedTable.order.id, 'paid')}
                                                className="bg-black dark:bg-white dark:text-black hover:bg-zinc-800 py-4 rounded-2xl font-black shadow-lg"
                                            >
                                                💳 {t('status.paid')}
                                            </Button>
                                            <Button
                                                onClick={() => handleStatusUpdate(selectedTable.order.id, 'cancelled')}
                                                variant="outline"
                                                className="border-red-200 text-red-600 dark:border-red-900 dark:text-red-400 py-4 rounded-2xl font-black hover:bg-red-50 dark:hover:bg-red-950"
                                            >
                                                {t('status.cancelled')}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                {!selectedTable.activeCall && (
                                    <div className="animate-in zoom-in duration-500">
                                        <div className="text-6xl mb-6">🍽️</div>
                                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs px-10">{t('noActiveOrder')}</p>
                                    </div>
                                )}
                                <Button onClick={() => setSelectedTable(null)} variant="ghost" className="mt-8 text-sm font-bold text-zinc-400 hover:text-zinc-900">
                                    {t('close') || 'CLOSE'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
