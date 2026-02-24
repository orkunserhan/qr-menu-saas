
import { createClient } from "@/utils/supabase/server";
import { toggleFeedbackRead } from "@/app/[locale]/admin/actions";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function FeedbackPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();

    const { data: restaurant } = await supabase.from('restaurants').select('name').eq('id', params.id).single();

    const { data: feedbacks } = await supabase
        .from('feedback')
        .select('*')
        .eq('restaurant_id', params.id)
        .order('created_at', { ascending: false });

    const pendingFeedbacks = feedbacks?.filter(f => f.status === 'pending' || f.rating <= 3) || [];
    const otherFeedbacks = feedbacks?.filter(f => f.status !== 'pending' && f.rating > 3) || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/restaurants/${params.id}`} className="text-gray-400 hover:text-black transition-colors">← Geri</Link>
                        <h1 className="font-bold text-xl text-gray-900">Müşteri Yorumları</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 space-y-8">

                {/* Bekleyen / Düşük Puanlı Yorumlar */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
                            ⚠️ İlgilenilmesi Gerekenler ({pendingFeedbacks.length})
                        </h2>
                        <p className="text-sm text-gray-500">Düşük puanlı geri bildirimler burada listelenir. Bunlar Google'a gitmemiş olabilir.</p>
                    </div>

                    <div className="space-y-4">
                        {pendingFeedbacks.length === 0 ? (
                            <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-400">
                                Süper! Bekleyen olumsuz yorum yok. 🎉
                            </div>
                        ) : (
                            pendingFeedbacks.map((item) => (
                                <div key={item.id} className={`bg-white p-6 rounded-xl border ${item.is_read ? 'border-gray-200 opacity-75' : 'border-red-200 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-red-500">{item.rating} ★</span>
                                            <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("tr-TR")}</span>
                                        </div>
                                        <form action={toggleFeedbackRead.bind(null, item.id, params.id, item.is_read)}>
                                            <button className="text-xs font-bold underline text-gray-500 hover:text-black">
                                                {item.is_read ? 'Okunmadı İşaretle' : 'Okundu İşaretle'}
                                            </button>
                                        </form>
                                    </div>
                                    <p className="text-gray-800 mb-4">{item.comment}</p>
                                    {item.customer_contact && (
                                        <div className="text-sm bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                                            <strong>İletişim:</strong> {item.customer_contact}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Diğer / Yüksek Puanlılar */}
                <section className="pt-8 border-t border-gray-200">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Diğer Yorumlar / Google Yönlendirmeleri</h2>
                    <div className="grid gap-4 opacity-80">
                        {otherFeedbacks.map((item) => (
                            <div key={item.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-lg font-bold text-green-600">{item.rating} ★</span>
                                    <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("tr-TR")}</span>
                                </div>
                                <p className="text-gray-600 text-sm">{item.comment || '(Yorumsuz Puan)'}</p>
                                <div className="mt-2 text-[10px] text-blue-600 font-medium uppercase tracking-wider">
                                    Google'a Yönlendirildi
                                </div>
                            </div>
                        ))}
                        {otherFeedbacks.length === 0 && <p className="text-sm text-gray-400">Henüz yüksek puanlı yorum yok.</p>}
                    </div>
                </section>

            </main>
        </div>
    );
}
