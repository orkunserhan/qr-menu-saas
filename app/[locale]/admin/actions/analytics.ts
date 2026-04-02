'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function archiveOldOrders(restaurantId: string) {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: ordersToArchive } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .in('status', ['paid', 'cancelled'])
        .lt('created_at', thirtyDaysAgo.toISOString());

    if (!ordersToArchive || ordersToArchive.length === 0) return { success: true, count: 0 };

    const aggregations: Record<string, { total_revenue: number, total_orders: number }> = {};
    ordersToArchive.forEach(order => {
        const date = order.created_at.split('T')[0];
        if (!aggregations[date]) aggregations[date] = { total_revenue: 0, total_orders: 0 };
        if (order.status === 'paid') aggregations[date].total_revenue += order.total_amount || 0;
        aggregations[date].total_orders += 1;
    });

    for (const [date, data] of Object.entries(aggregations)) {
        const { data: current } = await supabase
            .from('daily_analytics')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .eq('date', date)
            .maybeSingle();

        const upsertData = {
            restaurant_id: restaurantId,
            date,
            total_revenue: (current?.total_revenue || 0) + data.total_revenue,
            total_orders: (current?.total_orders || 0) + data.total_orders,
        };

        await supabase.from('daily_analytics').upsert(upsertData, { onConflict: 'restaurant_id,date' });
    }

    const orderIds = ordersToArchive.map(o => o.id);
    const { error: deleteError } = await supabase.from('orders').delete().in('id', orderIds);

    if (deleteError) return { error: deleteError.message };

    revalidatePath(`/admin/restaurants/${restaurantId}/analytics`);
    return { success: true, archived: orderIds.length };
}

export async function sendMonthlyReportEmail(restaurantId: string) {
    console.log(`[Enterprise CRM] Preparing monthly report for restaurant ${restaurantId}...`);
    return { success: true, message: "Report logic initialized. Deployment pending CRM credentials." };
}
