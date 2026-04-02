'use client';

import { useState } from 'react';
import { TableEditor } from '@/components/admin/TableEditor';
import { LiveTableMonitor } from '@/components/admin/LiveTableMonitor';
import { TableManagement } from '@/components/admin/TableManagement';
import { LiveTableMap } from '@/components/admin/LiveTableMap';
import { useTranslations } from 'next-intl';

export default function TablesPageClient({ 
    params, 
    initialTables, 
    staffList,
    restaurantName, 
    restaurantSlug 
}: { 
    params: { id: string }, 
    initialTables: any[],
    staffList: any[],
    restaurantName: string,
    restaurantSlug: string
}) {
    const [mode, setMode] = useState<'management' | 'map' | 'monitor' | 'edit'>('management');
    const t = useTranslations('admin.tables');

    const modeIcon = mode === 'monitor' ? '📡' : mode === 'edit' ? '✏️' : mode === 'map' ? '🗺️' : '🪑';

    return (
        <div className="p-4 sm:p-12 max-w-7xl mx-auto space-y-10 min-h-screen">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 animate-in fade-in duration-700">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        {modeIcon} {t('title')}
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 font-medium max-w-xl">
                        {mode === 'monitor'
                            ? t('monitorDesc')
                            : mode === 'edit' 
                                ? t('layoutDesc')
                                : mode === 'map'
                                    ? 'Real-time status map for all tables.'
                                    : t('manageDesc')}
                    </p>
                </div>

                <div className="bg-gray-100 dark:bg-zinc-900 p-1.5 rounded-2xl flex items-center shadow-inner border border-gray-200 dark:border-zinc-800 self-stretch xl:self-auto flex-wrap gap-1">
                    <button
                        onClick={() => setMode('management')}
                        className={`flex-1 xl:flex-none px-5 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'management' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'}`}
                    >
                        {t('title')}
                    </button>
                    <button
                        onClick={() => setMode('map')}
                        className={`flex-1 xl:flex-none px-5 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'map' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'}`}
                    >
                        🗺️ Map
                    </button>
                    <button
                        onClick={() => setMode('monitor')}
                        className={`flex-1 xl:flex-none px-5 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'monitor' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'}`}
                    >
                        {t('monitor')}
                    </button>
                    <button
                        onClick={() => setMode('edit')}
                        className={`flex-1 xl:flex-none px-5 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'edit' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'}`}
                    >
                        {t('layout')}
                    </button>
                </div>
            </div>

            <div className="relative">
                {mode === 'management' && (
                    <TableManagement 
                        restaurantId={params.id} 
                        restaurantName={restaurantName}
                        restaurantSlug={restaurantSlug}
                        initialTables={initialTables} 
                        staffList={staffList}
                    />
                )}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                        <LiveTableMap restaurantId={params.id} initialTables={initialTables || []} staffList={staffList} />
                    </div>
                {mode === 'monitor' && (
                    <LiveTableMonitor restaurantId={params.id} initialTables={initialTables || []} staffList={staffList} />
                )}
                {mode === 'edit' && (
                    <TableEditor 
                        restaurantId={params.id} 
                        restaurantSlug={restaurantSlug}
                        initialTables={initialTables || []} 
                    />
                )}
            </div>
        </div>
    );
}
