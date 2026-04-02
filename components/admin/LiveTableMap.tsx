'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';

type TableStatus = 'empty' | 'busy' | 'waiter';

interface TableInfo {
    id: string;
    name: string;
    status: TableStatus;
    orderCount: number;
    waiterCount: number;
    assigned_staff_id?: string | null;
}

export function LiveTableMap({ restaurantId, initialTables, staffList = [] }: { restaurantId: string; initialTables: any[]; staffList?: any[] }) {
    const t = useTranslations('admin.tables');
    const [tableMap, setTableMap] = useState<TableInfo[]>([]);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchStatuses = useCallback(async () => {
        const supabase = createClient();

        const [tablesRes, ordersRes, waiterRes] = await Promise.all([
            supabase.from('tables').select('id, name, status, assigned_staff_id').eq('restaurant_id', restaurantId),
            supabase
                .from('orders')
                .select('table_id')
                .eq('restaurant_id', restaurantId)
                .in('status', ['pending', 'preparing', 'served']),
            supabase
                .from('waiter_calls')
                .select('table_id')
                .eq('restaurant_id', restaurantId)
                .eq('is_completed', false)
        ]);

        const tables = tablesRes.data || initialTables;
        const activeOrders = ordersRes.data || [];
        const activeCalls = waiterRes.data || [];

        const orderCountByTable: Record<string, number> = {};
        for (const o of activeOrders) {
            if (o.table_id) orderCountByTable[o.table_id] = (orderCountByTable[o.table_id] || 0) + 1;
        }

        const waiterCountByTable: Record<string, number> = {};
        for (const w of activeCalls) {
            if (w.table_id) waiterCountByTable[w.table_id] = (waiterCountByTable[w.table_id] || 0) + 1;
        }

        const map: TableInfo[] = tables.map((table) => {
            const oCount = orderCountByTable[table.id] || 0;
            const wCount = waiterCountByTable[table.id] || 0;
            
            // Derive status: 
            // 1. If waiter call active -> waiter
            // 2. If active orders exist -> busy
            // 3. Fallback to the table.status from database (for cases like "reserved" or manual "busy")
            let status: TableStatus = table.status || 'empty';
            if (wCount > 0) status = 'waiter';
            else if (oCount > 0) status = 'busy';
            
            return { 
                id: table.id, 
                name: table.name, 
                status, 
                orderCount: oCount, 
                waiterCount: wCount,
                assigned_staff_id: table.assigned_staff_id 
            };
        });

        setTableMap(map);
        setLastUpdated(new Date());
    }, [restaurantId, initialTables]);

    useEffect(() => {
        fetchStatuses();

        const supabase = createClient();

        const channel = supabase
            .channel(`table_map_${restaurantId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, fetchStatuses)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'waiter_calls', filter: `restaurant_id=eq.${restaurantId}` }, fetchStatuses)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `restaurant_id=eq.${restaurantId}` }, fetchStatuses)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [restaurantId, fetchStatuses]);

    const busyCount = tableMap.filter(t => t.status !== 'empty').length;
    const emptyCount = tableMap.filter(t => t.status === 'empty').length;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-2 rounded-xl">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">{emptyCount} Empty</span>
                </div>
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-red-700 dark:text-red-400">{busyCount} Active</span>
                </div>
                <button
                    onClick={fetchStatuses}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1.5 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </button>
            </div>

            {/* Table Grid */}
            {tableMap.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-zinc-600">
                    <div className="text-5xl mb-3">🪑</div>
                    <p className="font-medium">No tables configured yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {tableMap.map((table) => {
                        const assignedStaff = staffList.find(s => s.id === table.assigned_staff_id);
                        return (
                            <div
                                key={table.id}
                                className={`relative flex flex-col items-center justify-center rounded-2xl p-4 shadow-sm border-2 transition-all cursor-default select-none aspect-square group ${
                                    table.status === 'waiter'
                                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 shadow-orange-200 dark:shadow-orange-900/30'
                                        : table.status === 'busy'
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-400 shadow-red-200 dark:shadow-red-900/30'
                                        : 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-800'
                                }`}
                            >
                                {/* Staff Tooltip/Badge */}
                                {assignedStaff && (
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-[8px] font-black px-1.5 py-0.5 rounded-full z-10 shadow-lg border border-white/20 dark:border-black/20 whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">
                                        👤 {assignedStaff.name.split(' ')[0]}
                                    </div>
                                )}

                                {/* Status dot */}
                                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                                    table.status === 'waiter' ? 'bg-orange-500 animate-bounce' :
                                    table.status === 'busy' ? 'bg-red-500 animate-pulse' :
                                    'bg-green-500'
                                }`}></div>

                                {/* Icon */}
                                <div className="text-2xl mb-1">
                                    {table.status === 'waiter' ? '🛎️' : table.status === 'busy' ? '🍽️' : '🪑'}
                                </div>

                                {/* Table name */}
                                <span className={`text-[10px] font-black text-center leading-tight uppercase ${
                                    table.status === 'waiter' ? 'text-orange-700 dark:text-orange-400' :
                                    table.status === 'busy' ? 'text-red-700 dark:text-red-400' :
                                    'text-green-700 dark:text-green-500'
                                }`}>
                                    {table.name}
                                </span>

                                {/* Counters */}
                                {(table.orderCount > 0 || table.waiterCount > 0) && (
                                    <div className="flex gap-1 mt-1.5 flex-wrap justify-center">
                                        {table.orderCount > 0 && (
                                            <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                                {table.orderCount}🍽️
                                            </span>
                                        )}
                                        {table.waiterCount > 0 && (
                                            <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                                                {table.waiterCount}🛎️
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
