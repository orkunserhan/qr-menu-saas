import { createClient } from '@/utils/supabase/server';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { getTranslations } from 'next-intl/server';
import { archiveOldOrders } from '@/app/[locale]/admin/actions';
import { Button } from '@/components/ui/Button';

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const supabase = await createClient();
    const t = await getTranslations('admin.analytics');

    // Fetch daily analytics data
    const { data: analyticsData } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('restaurant_id', id)
        .order('date', { ascending: false })
        .limit(365);

    // Fetch restaurant info for export
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', id)
        .single();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-xl">📈</span>
                        {t('title')}
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1 font-medium">{t('subtitle')}</p>
                </div>
                
                <form action={async () => {
                    'use server'
                    await archiveOldOrders(id);
                }}>
                    <Button variant="outline" size="sm" className="font-bold text-[10px] uppercase tracking-wider group hover:bg-orange-50 dark:hover:bg-orange-900/10">
                        <svg className="w-3.5 h-3.5 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {t('archiveAndSync')}
                    </Button>
                </form>
            </div>

            <AnalyticsDashboard data={analyticsData || []} restaurantName={restaurant?.name || 'Restaurant'} />
        </div>
    );
}
