'use client';

import { useState } from 'react';
import { TableEditor } from '@/components/admin/TableEditor';
import { LiveTableMonitor } from '@/components/admin/LiveTableMonitor';

export default function TablesPageClient({ params, initialTables }: { params: { id: string }, initialTables: any[] }) {
    const [mode, setMode] = useState<'monitor' | 'edit'>('monitor');

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {mode === 'monitor' ? '📡 Canlı Salon Takibi' : '✏️ Masa Yerleşimi & Düzeni'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {mode === 'monitor'
                            ? 'Müşteri siparişlerini buradan anlık izleyebilirsiniz.'
                            : 'Restoranınızın oturma planını sürükle-bırak ile düzenleyin.'}
                    </p>
                </div>

                <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                    <button
                        onClick={() => setMode('monitor')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'monitor' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Canlı İzle
                    </button>
                    <button
                        onClick={() => setMode('edit')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'edit' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Düzenle
                    </button>
                </div>
            </div>

            {mode === 'monitor' ? (
                <LiveTableMonitor restaurantId={params.id} initialTables={initialTables || []} />
            ) : (
                <TableEditor restaurantId={params.id} initialTables={initialTables || []} />
            )}
        </div>
    );
}
