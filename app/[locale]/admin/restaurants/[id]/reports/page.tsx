import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Günlük Ciro ve Sipariş Sayısı
    const { data: todayOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', params.id)
        .gte('created_at', today.toISOString())
        .neq('status', 'cancelled'); // İptal edilenler hariç

    // Tüm Zamanlar Toplamı
    const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('restaurant_id', params.id)
        .neq('status', 'cancelled');
    const { data: feedbacks } = await supabase.from('feedback').select('rating, comment, created_at').eq('restaurant_id', params.id).order('created_at', { ascending: false });

    if (error) {
        return <div className="p-8 text-red-500">Rapor verisi çekilemedi.</div>;
    }

    // Hesaplamalar
    const dailyTotal = todayOrders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;
    const dailyCount = todayOrders?.length || 0;
    const totalRevenue = allOrders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;

    // Yorum İstatistikleri
    const totalFeedback = feedbacks?.length || 0;
    const avgRating = totalFeedback > 0
        ? (feedbacks?.reduce((acc, f) => acc + f.rating, 0) || 0) / totalFeedback
        : 0;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📊 Raporlar & İstatistikler</h1>
                    <p className="text-gray-500">Restoranınızın performansını takip edin.</p>
                </div>
                <div className="text-sm bg-gray-100 px-3 py-1 rounded text-gray-600">
                    {new Date().toLocaleDateString('tr-TR')}
                </div>
            </div>

            {/* Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Günlük Ciro */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">
                            💰
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Bugünkü Ciro</p>
                            <h3 className="text-2xl font-bold text-gray-900">{dailyTotal} ₺</h3>
                        </div>
                    </div>
                </div>

                {/* Günlük Sipariş */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
                            🧾
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Bugünkü Sipariş</p>
                            <h3 className="text-2xl font-bold text-gray-900">{dailyCount} Adet</h3>
                        </div>
                    </div>
                </div>

                {/* Toplam Ciro */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
                            💎
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Toplam Kazanç</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalRevenue} ₺</h3>
                        </div>
                    </div>
                </div>

                {/* Müşteri Memnuniyeti (YENİ) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-2xl">⭐</div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Memnuniyet</p>
                            <h3 className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)} / 5</h3>
                            <p className="text-xs text-gray-400">{totalFeedback} yorum</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* İki Tablo Yan Yana: Siparişler ve Yorumlar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basit Sipariş Geçmişi Tablosu */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Son Siparişler (Bugün)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Saat</th>
                                    <th className="px-6 py-3 font-medium">Tutar</th>
                                    <th className="px-6 py-3 font-medium">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {todayOrders?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-gray-600">
                                            {new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-green-600 font-bold">
                                            {order.total_amount} ₺
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status === 'paid' ? 'Ödendi' :
                                                    order.status === 'pending' ? 'Bekliyor' :
                                                        order.status === 'served' ? 'Servis Edildi' :
                                                            order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!todayOrders || todayOrders.length === 0) && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-gray-400">Henüz bugün sipariş yok.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Son Yorumlar Tablosu (YENİ) */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Son Değerlendirmeler</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px]">
                        {feedbacks?.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">Henüz bir yorum yok.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {feedbacks?.map((f, i) => (
                                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, stars) => (
                                                    <svg key={stars} className={`w-4 h-4 ${stars < f.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(f.created_at).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 italic">"{f.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
