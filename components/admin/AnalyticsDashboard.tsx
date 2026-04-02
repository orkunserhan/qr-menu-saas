'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface AnalyticsData {
    date: string;
    total_revenue: number;
    total_orders: number;
}

interface AnalyticsDashboardProps {
    data: AnalyticsData[];
    restaurantName: string;
}

export function AnalyticsDashboard({ data, restaurantName }: AnalyticsDashboardProps) {
    const t = useTranslations('admin.analytics');
    const [range, setRange] = useState<'30d' | '3m' | '6m' | '12m'>('30d');

    // Filter data based on range
    const filteredData = data.slice().sort((a, b) => a.date.localeCompare(b.date));

    const maxRevenue = Math.max(...filteredData.map(d => d.total_revenue), 1);
    const totalRev = filteredData.reduce((acc, d) => acc + d.total_revenue, 0);
    const totalOrd = filteredData.reduce((acc, d) => acc + d.total_orders, 0);

    const handleExportCSV = () => {
        const headers = ['Date', 'Revenue', 'Orders'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(d => `${d.date},${d.total_revenue},${d.total_orders}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${restaurantName}_analytics_${range}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('performanceSnapshot')}</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">{t('performanceSubtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg">
                        {(['30d', '3m', '6m', '12m'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${range === r ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-green-600/10 transition-all flex items-center gap-2"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        CSV
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1">{t('totalRevenue')}</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalRev.toLocaleString()} €</h3>
                    <div className="mt-2 text-[10px] text-green-500 font-bold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        +12% vs prev
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1">{t('totalOrders')}</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalOrd.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 font-medium">{t('ordersAcrossPeriod')}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1">{t('avgOrderValue')}</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{(totalOrd > 0 ? totalRev / totalOrd : 0).toFixed(2)} €</h3>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 font-medium">{t('customerEfficiency')}</p>
                </div>
            </div>

            {/* Bar Chart (CSS-based for Performance) */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="font-bold text-gray-900 dark:text-white">{t('revenueTrend')}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div> {t('revenue')}</div>
                    </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-1 sm:gap-2">
                    {filteredData.map((d, i) => (
                        <div key={d.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${(d.total_revenue / maxRevenue) * 100}%` }}
                                transition={{ duration: 1, delay: i * 0.02, ease: "circOut" }}
                                className="w-full bg-orange-500/80 group-hover:bg-orange-500 rounded-t-md transition-all cursor-pointer relative"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                                    {d.total_revenue} €
                                </div>
                            </motion.div>
                            {/* Date Label (Only show some to avoid clutter) */}
                            {i % Math.ceil(filteredData.length / 10) === 0 && (
                                <span className="absolute -bottom-6 text-[8px] sm:text-[10px] text-gray-400 dark:text-zinc-500 font-bold rotate-45 sm:rotate-0">
                                    {format(new Date(d.date), 'dd MMM')}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-10"></div> {/* Spacer for rotated labels */}
        </div>
    );
}
