'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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
};

export function SuperAdminDashboard({ user }: { user: any }) {
    const [stats, setStats] = useState<RestaurantStat[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-8">
            {/* 1. Üst KPI Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam Restoran" value={totalRestaurants} icon="🏪" color="bg-blue-50 text-blue-700" />
                <KpiCard title="Toplam Ürün (Yük)" value={totalProducts} icon="🍔" color="bg-orange-50 text-orange-700" />
                <KpiCard title="Aktif Lisanslar" value={activeSubscriptions} icon="✨" color="bg-purple-50 text-purple-700" />
                <KpiCard title="Yaklaşan Yenilemeler" value={expiringSoon.length} icon="⚠️" color="bg-red-50 text-red-700" />
            </div>

            {/* 2. Kritik Uyarılar (Yenileme Zamanı) */}
            {expiringSoon.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="font-bold text-red-800 flex items-center gap-2">
                        <span>⏳ Lisans Süresi Bitiyor!</span>
                    </h3>
                    <p className="text-sm text-red-600 mb-4">Aşağıdaki restoranların lisans süresi 30 günden az kaldı. İletişime geçip yenileme önerin.</p>
                    <div className="grid gap-3">
                        {expiringSoon.map(r => (
                            <div key={r.id} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-bold">{r.name}</div>
                                    <div className="text-xs text-gray-500">{r.owner_email} | {new Date(r.subscription_end_date!).toLocaleDateString()}</div>
                                </div>
                                <Button size="sm" variant="outline">Mail At</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Yüksek Kullanım (High Usage) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">🔥 En Yoğun Restoranlar (Ürün Bazlı)</h3>
                    <div className="space-y-4">
                        {highUsageRestaurants.map((r, i) => (
                            <div key={r.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <div className="font-medium text-sm">{r.name}</div>
                                        <div className="text-xs text-gray-400">{r.total_categories} Kategori</div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-sm text-gray-700">
                                    {r.total_products} Ürün
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Veri Kalitesi & Öneriler */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">💡 Veri Kalitesi & Öneriler</h3>
                    <div className="space-y-3">
                        {stats.filter(s => s.total_products < 5).map(r => (
                            <div key={r.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <span className="font-bold">{r.name}</span> çok boş görünüyor ({r.total_products} ürün).
                                    <div className="text-xs opacity-80 mt-1">Müşteriye ulaşıp menü girişine yardım etmeyi teklif edin.</div>
                                </div>
                            </div>
                        ))}
                        {stats.every(s => s.total_products >= 5) && (
                            <div className="text-green-600 flex items-center gap-2">
                                <span>✅</span> Tüm restoranların veri girişi gayet iyi durumda!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tüm Restoranlar Tablosu */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Tüm Restoranlar Listesi</h3>
                    <Link href="/admin/restaurants/new">
                        <Button size="sm">+ Yeni Ekle</Button>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Restoran</th>
                                <th className="px-6 py-3">Sahibi</th>
                                <th className="px-6 py-3">Durum</th>
                                <th className="px-6 py-3">Lisans</th>
                                <th className="px-6 py-3">İstatistik</th>
                                <th className="px-6 py-3 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {r.name}
                                        <div className="text-xs text-gray-400 font-normal">/{r.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{r.owner_email || '-'}</td>
                                    <td className="px-6 py-4">
                                        {r.is_active ? (
                                            <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Aktif</span>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Pasif</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs">
                                            {r.subscription_plan === 'free' ? 'Ücretsiz' : r.subscription_plan}
                                        </div>
                                        {r.subscription_end_date && (
                                            <div className="text-xs text-gray-400">
                                                Bit: {new Date(r.subscription_end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {r.total_products} Ürün / {r.total_feedback} Yorum
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/restaurants/${r.id}`}>
                                            <Button variant="ghost" size="sm">Yönet →</Button>
                                        </Link>
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
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h4 className="text-3xl font-bold text-gray-900">{value}</h4>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${color}`}>
                {icon}
            </div>
        </div>
    );
}
