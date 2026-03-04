
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();

    // 1. Fetch Products
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, category, image_url, is_available')
        .eq('restaurant_id', params.id);

    // 2. Fetch Views (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: views } = await supabase
        .from('analytics_events')
        .select('product_id, event_type')
        .eq('restaurant_id', params.id)
        .eq('event_type', 'view_product')
        .gte('created_at', thirtyDaysAgo.toISOString());

    // 3. Fetch Orders (Last 30 Days)
    // Note: We need to join with orders table to filter by restaurant_id if order_items doesn't have it, 
    // but order_items usually links to order which has restaurant_id. 
    // For simplicity, let's fetch all order_items for orders of this restaurant.
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, orders!inner(created_at, restaurant_id)')
        .eq('orders.restaurant_id', params.id)
        .gte('orders.created_at', thirtyDaysAgo.toISOString());

    // 4. Data Processing
    const productStats: Record<string, { views: number, orders: number }> = {};

    // Initialize
    products?.forEach(p => {
        productStats[p.id] = { views: 0, orders: 0 };
    });

    // Count Views
    views?.forEach(v => {
        if (v.product_id && productStats[v.product_id]) {
            productStats[v.product_id].views++;
        }
    });

    // Count Orders
    orderItems?.forEach((item: any) => {
        if (item.product_id && productStats[item.product_id]) {
            productStats[item.product_id].orders += item.quantity;
        }
    });

    // Calculate Conversion & Identify "Missed Opportunities"
    const analyzedProducts = products ? products.map(p => {
        const stats = productStats[p.id] || { views: 0, orders: 0 };
        const conversionRate = stats.views > 0 ? (stats.orders / stats.views) * 100 : 0;

        // "Missed Opportunity" Score: High views but low orders.
        // Formula: Views * (1 - ConversionRate/100) -> Weighs absolute views heavily
        const missedOpportunityScore = stats.views - stats.orders;

        return {
            ...p,
            views: stats.views,
            orders: stats.orders,
            conversionRate,
            missedOpportunityScore
        };
    }).sort((a, b) => b.missedOpportunityScore - a.missedOpportunityScore) : [];

    // Filter for actual missed opportunities (High views, low conversion)
    const missedOpportunitiesList = analyzedProducts.filter(p => p.views > 0 && p.conversionRate < 5).sort((a, b) => b.views - a.views);

    const topPerformers = [...analyzedProducts].sort((a, b) => b.orders - a.orders).slice(0, 5);


    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/restaurants/${params.id}`} className="text-gray-400 hover:text-black transition-colors">← Geri</Link>
                        <h1 className="font-bold text-xl text-gray-900">📈 Menü Analitiği</h1>
                    </div>
                    <div className="text-sm text-gray-500">Son 30 Gün</div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-6 space-y-8">

                {/* Insight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Missed Opportunities */}
                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                        <h3 className="text-lg font-bold text-red-900 mb-1">⚠️ İlgi Gören Ama Satılmayanlar</h3>
                        <p className="text-sm text-red-600 mb-4">Bu ürünlere müşteriler çok tıklıyor ancak sipariş vermiyor. Fiyatı veya açıklamayı gözden geçirin.</p>

                        <div className="space-y-4">
                            {missedOpportunitiesList.length === 0 ? (
                                <p className="text-gray-400 text-sm">Şu an için belirgin bir sorun yok.</p>
                            ) : (
                                missedOpportunitiesList.slice(0, 5).map((p, i) => (
                                    <div key={p.id} className="flex items-center gap-4 border-b border-red-50 last:border-0 pb-3 last:pb-0">
                                        <div className="font-bold text-gray-400 w-6">#{i + 1}</div>
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : null}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.price}₺</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-red-600">{p.views} Görüntülenme</div>
                                            <div className="text-xs text-gray-400">{p.orders} Sipariş ({p.conversionRate.toFixed(1)}%)</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                        <h3 className="text-lg font-bold text-green-900 mb-1">🏆 En Çok Satanlar</h3>
                        <p className="text-sm text-green-600 mb-4">Menünüzün yıldızları. Stoklarını her zaman dolu tutun.</p>

                        <div className="space-y-4">
                            {topPerformers.map((p, i) => (
                                <div key={p.id} className="flex items-center gap-4 border-b border-green-50 last:border-0 pb-3 last:pb-0">
                                    <div className="font-bold text-gray-400 w-6">#{i + 1}</div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">{p.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">{p.orders} Adet</div>
                                        <div className="text-xs text-gray-400">Dönüşüm: %{p.conversionRate.toFixed(1)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Full Data Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Tüm Ürün Performansı</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Ürün</th>
                                    <th className="px-6 py-3 font-medium text-right">Görüntülenme</th>
                                    <th className="px-6 py-3 font-medium text-right">Sipariş</th>
                                    <th className="px-6 py-3 font-medium text-right">Dönüşüm Oranı</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {analyzedProducts.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 group">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden">
                                                {p.image_url && <img src={p.image_url} className="w-full h-full object-cover" />}
                                            </div>
                                            {p.name}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">{p.views}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{p.orders}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.conversionRate > 20 ? 'bg-green-100 text-green-700' :
                                                p.conversionRate < 5 && p.views > 10 ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                %{p.conversionRate.toFixed(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
