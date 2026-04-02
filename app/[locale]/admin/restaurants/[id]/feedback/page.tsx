import { createClient } from "@/utils/supabase/server";
import { toggleFeedbackRead, deleteFeedback } from "@/app/[locale]/admin/actions";
import { Link } from "@/src/i18n/routing";
import { getTranslations } from "next-intl/server";

export default async function FeedbackPage(props: { params: Promise<{ id: string, locale: string }> }) {
    const params = await props.params;
    const supabase = await createClient();
    const t = await getTranslations('restAdmin.feedback');

    const { data: feedbacks } = await supabase
        .from('feedback')
        .select('*')
        .eq('restaurant_id', params.id)
        .order('created_at', { ascending: false });

    const pendingFeedbacks = feedbacks?.filter(f => f.status === 'pending' || f.rating <= 3) || [];
    const otherFeedbacks = feedbacks?.filter(f => f.status !== 'pending' && f.rating > 3) || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/restaurants/${params.id}`} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                            ← {t('back')}
                        </Link>
                        <h1 className="font-bold text-xl text-gray-900 dark:text-white">{t('title')}</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 space-y-8">

                {/* Pending / Low Rating */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                            ⚠️ {t('pendingTitle')} ({pendingFeedbacks.length})
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('pendingDesc')}</p>
                    </div>

                    <div className="space-y-4">
                        {pendingFeedbacks.length === 0 ? (
                            <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500">
                                {t('emptyPending')}
                            </div>
                        ) : (
                            pendingFeedbacks.map((item) => (
                                <div key={item.id} className={`bg-white dark:bg-gray-900 p-6 rounded-xl border transition-all ${item.is_read ? 'border-gray-200 dark:border-gray-800 opacity-60' : 'border-red-200 dark:border-red-900/50 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-red-500">{item.rating} ★</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(item.created_at).toLocaleDateString(params.locale)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <form action={toggleFeedbackRead.bind(null, item.id, params.id, item.is_read)}>
                                                <button className="text-xs font-bold underline text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
                                                    {item.is_read ? t('markUnread') : t('markRead')}
                                                </button>
                                            </form>
                                            <form action={deleteFeedback.bind(null, item.id, params.id)} onSubmit={(e) => { if(!confirm(t('deleteConfirm'))) e.preventDefault(); }}>
                                                <button className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-tight">
                                                    {t('delete')}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">{item.comment}</p>
                                    {item.customer_contact && (
                                        <div className="text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-100 dark:border-gray-800 inline-block dark:text-gray-300">
                                            <strong className="text-gray-700 dark:text-gray-400">Contact:</strong> {item.customer_contact}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* High Ratings */}
                <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">{t('otherTitle')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherFeedbacks.map((item) => (
                            <div key={item.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 group relative">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{item.rating} ★</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(item.created_at).toLocaleDateString(params.locale)}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 italic">
                                    {item.comment || t('noComment')}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                                        {t('googleRedirected')}
                                    </div>
                                    <form action={deleteFeedback.bind(null, item.id, params.id)} onSubmit={(e) => { if(!confirm(t('deleteConfirm'))) e.preventDefault(); }}>
                                        <button className="opacity-0 group-hover:opacity-100 text-[10px] text-red-400 hover:text-red-500 transition-all font-bold uppercase">
                                            {t('delete')}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                    {otherFeedbacks.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 italic">{t('emptyOther')}</p>}
                </section>

            </main>
        </div>
    );
}
