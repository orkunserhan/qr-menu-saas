'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toggleRestaurantActiveStatus, deleteRestaurant, restoreRestaurant, hardDeleteRestaurant, createRestaurantWithInvite } from '@/app/[locale]/admin/actions';

// Tip tanımları
type RestaurantStat = {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    subscription_end_date: string | null;
    subscription_plan: string;
    owner_email: string | null;
    total_products: number;
    total_categories: number;
    total_feedback: number;
    deleted_at: string | null;
};

export function SuperAdminDashboard({ user }: { user: any }) {
    const [stats, setStats] = useState<RestaurantStat[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations('superAdmin');

    // Invite Form State
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteResult, setInviteResult] = useState<{ success?: boolean; error?: string } | null>(null);

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('admin_restaurant_stats')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setStats(data);
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    // KPI Hesaplamaları
    const totalRestaurants = stats.length;
    const totalProducts = stats.reduce((acc, curr) => acc + curr.total_products, 0);
    const activeSubscriptions = stats.filter(s => s.subscription_plan !== 'free').length;
    const expiringSoon = stats.filter(s => {
        if (!s.subscription_end_date) return false;
        const daysLeft = Math.ceil((new Date(s.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 && daysLeft <= 30;
    });

    const highUsageRestaurants = [...stats].sort((a, b) => b.total_products - a.total_products).slice(0, 5);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-8">
            {/* 1. Üst KPI Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title={t('totalRestaurants')} value={totalRestaurants} icon="🏪" color="bg-blue-50 text-blue-700" />
                <KpiCard title={t('totalProducts')} value={totalProducts} icon="🍔" color="bg-orange-50 text-orange-700" />
                <KpiCard title={t('activeLicenses')} value={activeSubscriptions} icon="✨" color="bg-purple-50 text-purple-700" />
                <KpiCard title={t('upcomingRenewals')} value={expiringSoon.length} icon="⚠️" color="bg-red-50 text-red-700" />
            </div>

            {/* 2. Kritik Uyarılar (Yenileme Zamanı) */}
            {expiringSoon.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-6">
                    <h3 className="font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
                        <span>{t('licenseExpiring')}</span>
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-300/70 mb-4">{t('licenseExpiringDesc')}</p>
                    <div className="grid gap-3">
                        {expiringSoon.map(r => (
                            <div key={r.id} className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{r.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{r.owner_email} | {new Date(r.subscription_end_date!).toLocaleDateString()}</div>
                                </div>
                                <Button size="sm" variant="outline">{t('sendMail')}</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Yüksek Kullanım (High Usage) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t('busiestRestaurants')}</h3>
                    <div className="space-y-4">
                        {highUsageRestaurants.map((r, i) => (
                            <div key={r.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{r.name}</div>
                                        <div className="text-xs text-gray-400">{r.total_categories} {t('category')}</div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-sm text-gray-700 dark:text-gray-300">
                                    {t('productCount', { count: r.total_products })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Veri Kalitesi & Öneriler */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t('dataQuality')}</h3>
                    <div className="space-y-3">
                        {stats.filter(s => s.total_products < 5).map(r => (
                            <div key={r.id} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800/30">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <span className="font-bold text-yellow-900 dark:text-yellow-200">{r.name}</span> {t('looksEmpty', { count: r.total_products })}
                                    <div className="text-xs opacity-80 mt-1">{t('offerHelp')}</div>
                                </div>
                            </div>
                        ))}
                        {stats.every(s => s.total_products >= 5) && (
                            <div className="text-green-600 flex items-center gap-2">
                                <span>✅</span> {t('allGood')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tüm Restoranlar Tablosu */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('allRestaurantsList')}</h3>
                    <Button
                        size="sm"
                        onClick={() => { setShowInviteForm(v => !v); setInviteResult(null); }}
                        className={showInviteForm ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : ''}
                    >
                        {showInviteForm ? '✕ ' + t('cancel') : '✉️ ' + t('addRestaurantTitle')}
                    </Button>
                </div>

                {/* ── Davet Formu ── */}
                {showInviteForm && (
                    <div className="p-6 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                            <span>✉️</span> {t('addRestaurantTitle')}
                        </h4>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setInviteLoading(true);
                                setInviteResult(null);
                                const fd = new FormData(e.currentTarget);
                                const res = await createRestaurantWithInvite(fd);
                                setInviteResult(res);
                                setInviteLoading(false);
                                if (res.success) {
                                    (e.target as HTMLFormElement).reset();
                                }
                            }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                                    {t('restaurantNameLabel')}
                                </label>
                                <input
                                    name="restaurant_name"
                                    type="text"
                                    required
                                    placeholder="Ex: Blue Point"
                                    className="px-4 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                                    {t('ownerEmail')}
                                </label>
                                <input
                                    name="owner_email"
                                    type="email"
                                    required
                                    placeholder="owner@restaurant.com"
                                    className="px-4 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                                    {t('defaultLanguage')}
                                </label>
                                <select
                                    name="default_locale"
                                    className="px-4 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                >
                                    <option value="en">🇬🇧 English</option>
                                    <option value="de">🇩🇪 Deutsch</option>
                                    <option value="it">🇮🇹 Italiano</option>
                                    <option value="sk">🇸🇰 Slovenčina</option>
                                    <option value="fr">🇫🇷 Français</option>
                                    <option value="tr">🇹🇷 Türkçe</option>
                                </select>
                            </div>
                            <div className="md:col-span-3 flex items-center gap-4">
                                <Button type="submit" disabled={inviteLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {inviteLoading ? t('sending') : '✉️ ' + t('sendInvite')}
                                </Button>
                                {inviteResult?.success && (
                                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm flex items-center gap-1">✅ {t('inviteSent')}</span>
                                )}
                                {inviteResult?.error && (
                                    <span className="text-red-600 dark:text-red-400 font-semibold text-sm flex items-center gap-1">❌ {inviteResult.error}</span>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-3">{t('restaurant')}</th>
                                <th className="px-6 py-3">{t('owner')}</th>
                                <th className="px-6 py-3">{t('status')}</th>
                                <th className="px-6 py-3">{t('license')}</th>
                                <th className="px-6 py-3">{t('statistics')}</th>
                                <th className="px-6 py-3 text-right">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {stats.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {r.name}
                                        <div className="text-xs text-gray-400 dark:text-gray-500 font-normal">/{r.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{r.owner_email || '-'}</td>
                                    <td className="px-6 py-4">
                                        {r.deleted_at ? (
                                            <span className="inline-flex px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs font-black animate-pulse">
                                                🗑️ {t('restaurantPendingDeletion')} ({15 - Math.floor((new Date().getTime() - new Date(r.deleted_at).getTime()) / (1000 * 60 * 60 * 24))} {t('days') || 'days'})
                                            </span>
                                        ) : r.is_active ? (
                                            <span className="inline-flex px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs">{t('active')}</span>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 rounded-full text-xs">{t('inactive')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs">
                                            {r.subscription_plan === 'free' ? t('free') : r.subscription_plan}
                                        </div>
                                        {r.subscription_end_date && (
                                            <div className="text-xs text-gray-400">
                                                {t('expires')}: {new Date(r.subscription_end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {t('productCount', { count: r.total_products })} / {t('reviews', { count: r.total_feedback })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Link href={`/admin/restaurants/${r.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold border-gray-200 dark:border-gray-800 hover:bg-black hover:text-white transition-all">
                                                    {t('manage')} →
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h4>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${color} dark:bg-opacity-20`}>
                {icon}
            </div>
        </div>
    );
}
