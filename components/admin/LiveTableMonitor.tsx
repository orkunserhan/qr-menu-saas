'use client'

import { useState, useEffect } from 'react';
import { getActiveOrders, updateOrderStatus } from '@/app/actions/order-actions';
import { getActiveWaiterCalls, completeWaiterCall } from '@/app/actions/waiter-actions';

// Order Status Colors
const statusColors = {
    pending: 'bg-red-500 text-white animate-pulse', // Yeni Sipariş
    preparing: 'bg-orange-500 text-white', // Hazırlanıyor
    served: 'bg-green-600 text-white', // Servis Edildi
    paid: 'bg-gray-500 text-white',
    cancelled: 'bg-gray-300 text-gray-600'
};

const statusLabels = {
    pending: 'YENİ SİPARİŞ',
    preparing: 'Hazırlanıyor',
    served: 'Servis Edildi',
    paid: 'Ödendi',
    cancelled: 'İptal'
};

const callIcons: Record<string, string> = {
    waiter: '👋',
    payment: '🧾',
    order: '🍽️',
    other: '❓'
};

const callLabels: Record<string, string> = {
    waiter: 'Garson İstiyor',
    payment: 'Hesap İstiyor',
    order: 'Sipariş Verecek',
    other: 'Yardım'
};

export function LiveTableMonitor({ restaurantId, initialTables }: { restaurantId: string, initialTables: any[] }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [waiterCalls, setWaiterCalls] = useState<any[]>([]);
    const [selectedTable, setSelectedTable] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Siparişleri ve Çağrıları Periyodik Olarak Çek
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
        const interval = setInterval(fetchData, 5000); // 5 saniyede bir yenile
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: any) => {
        await updateOrderStatus(orderId, newStatus, restaurantId);
        fetchData();
        if (newStatus === 'paid' || newStatus === 'cancelled') {
            // Modalı kapatma veya yenileme mantığı
        }
    };

    const handleCompleteCall = async (callId: string) => {
        await completeWaiterCall(callId);
        fetchData();
        // Eğer seçili masanın çağrısı bittiyse modalı update et
        if (selectedTable?.activeCall?.id === callId) {
            setSelectedTable((prev: any) => ({ ...prev, activeCall: null }));
        }
    };

    return (
        <div className="space-y-4 relative">

            {/* Bildirim Paneli (Calls without Table ID or General List) */}
            {waiterCalls.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex flex-wrap gap-4 items-center animate-in slide-in-from-top-4">
                    <span className="font-bold text-yellow-800 flex items-center gap-2">
                        🔔 {waiterCalls.length} Aktif Çağrı
                    </span>
                    {waiterCalls.map(call => {
                        const tableName = initialTables.find(t => t.id === call.table_id)?.name || 'Bilinmeyen Masa';
                        return (
                            <div key={call.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm text-sm border border-yellow-100">
                                <span>{callIcons[call.type] || '❓'}</span>
                                <span className="font-bold">{tableName}</span>
                                <span className="text-gray-500 text-xs">({callLabels[call.type] || call.type})</span>
                                <button
                                    onClick={() => handleCompleteCall(call.id)}
                                    className="ml-2 w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-green-100 text-gray-400 hover:text-green-600 rounded-full"
                                >
                                    ✓
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Canlı Alan (Canvas) */}
            <div className="relative w-full h-[600px] bg-gray-900 border-4 border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        CANLI İZLEME MODU
                    </div>
                </div>

                {initialTables.map(table => {
                    // Bu masaya ait aktif siparişi bul
                    const activeOrder = orders.find(o => o.table_id === table.id);
                    // Bu masaya ait aktif çağrıyı bul
                    const activeCall = waiterCalls.find(c => c.table_id === table.id);

                    return (
                        <div
                            key={table.id}
                            onClick={() => setSelectedTable({ table, order: activeOrder, activeCall })}
                            style={{
                                left: `${table.position_x}%`,
                                top: `${table.position_y}%`,
                                position: 'absolute'
                            }}
                            className={`
                                w-20 h-20 rounded-xl shadow-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border-2
                                ${activeCall
                                    ? 'bg-yellow-500 border-yellow-300 text-black animate-bounce shadow-[0_0_20px_rgba(234,179,8,0.8)] z-20'
                                    : activeOrder
                                        ? statusColors[activeOrder.status as keyof typeof statusColors] + ' border-white/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                }
                            `}
                        >
                            {activeCall && (
                                <div className="absolute -top-3 -right-3 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm z-30 text-xs">
                                    {callIcons[activeCall.type]}
                                </div>
                            )}

                            <span className="font-bold text-xs text-center px-1 leading-tight">{table.name}</span>

                            {activeOrder && !activeCall && (
                                <div className="mt-1 flex flex-col items-center">
                                    <span className="text-[10px] font-bold bg-black/20 px-1 rounded">
                                        {activeOrder.total_amount} ₺
                                    </span>
                                    <span className="text-[8px] opacity-90 mt-0.5 uppercase tracking-wider">
                                        {statusLabels[activeOrder.status as keyof typeof statusLabels]}
                                    </span>
                                </div>
                            )}

                            {activeCall && (
                                <div className="mt-1 flex flex-col items-center">
                                    <span className="text-[9px] font-bold uppercase tracking-tight">
                                        {callLabels[activeCall.type]}
                                    </span>
                                </div>
                            )}

                            {/* Sandalyeler (Görsel) */}
                            <div className="absolute -top-2 w-8 h-1 bg-white/20 rounded-full"></div>
                            <div className="absolute -bottom-2 w-8 h-1 bg-white/20 rounded-full"></div>
                        </div>
                    );
                })}
            </div>

            {/* SİPARİŞ & ÇAĞRI DETAY MODALI */}
            {selectedTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setSelectedTable(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            ✕
                        </button>

                        <div className="mb-6 border-b pb-4">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                {selectedTable.table.name}
                                {selectedTable.activeCall && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full animate-pulse border border-yellow-200">
                                        {callIcons[selectedTable.activeCall.type]} Çağrı Var
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-500">Masa Detayı</p>
                        </div>

                        {/* Waiter Call Action */}
                        {selectedTable.activeCall && (
                            <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{callIcons[selectedTable.activeCall.type]}</div>
                                    <div>
                                        <div className="font-bold text-gray-900">{callLabels[selectedTable.activeCall.type]}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(selectedTable.activeCall.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCompleteCall(selectedTable.activeCall.id)}
                                    className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg shadow-sm transition-colors"
                                >
                                    Tamamlandı Olarak İşaretle
                                </button>
                            </div>
                        )}

                        {selectedTable.order ? (
                            <div className="space-y-6">
                                {/* Ürün Listesi */}
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {selectedTable.order.order_items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                            <div className="flex gap-3">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-700">{item.quantity}x</span>
                                                <span className="text-gray-800">{item.products?.name || 'Ürün'}</span>
                                            </div>
                                            <span className="font-medium">{item.price_at_time * item.quantity} ₺</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Müşteri Notu */}
                                {selectedTable.order.customer_note && (
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                                        <span className="font-bold">Not:</span> {selectedTable.order.customer_note}
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                                    <span>Toplam Tutar</span>
                                    <span>{selectedTable.order.total_amount} ₺</span>
                                </div>

                                {/* Durum Butonları */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {selectedTable.order.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedTable.order.id, 'preparing')}
                                            className="col-span-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-orange-200"
                                        >
                                            👨‍🍳 Hazırlamaya Başla
                                        </button>
                                    )}

                                    {selectedTable.order.status === 'preparing' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedTable.order.id, 'served')}
                                            className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-green-200"
                                        >
                                            ✅ Servis Et
                                        </button>
                                    )}

                                    {(selectedTable.order.status === 'served' || selectedTable.order.status === 'preparing') && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedTable.order.id, 'paid')}
                                                className="bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-bold"
                                            >
                                                💳 Hesap Alındı
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedTable.order.id, 'cancelled')}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl font-bold"
                                            >
                                                İptal Et
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-400">
                                {!selectedTable.activeCall && (
                                    <>
                                        <div className="text-4xl mb-3">🍽️</div>
                                        <p>Bu masada aktif sipariş yok.</p>
                                    </>
                                )}
                                <button onClick={() => setSelectedTable(null)} className="mt-4 text-sm text-black underline">Kapat</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
