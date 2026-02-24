'use server';

import { createClient } from "@/utils/supabase/server";

export async function requestWaiter(restaurantId: string, tableId: string | null, type: string) {
    const supabase = await createClient();

    // prevent spam? (Check if active call exists for this table & type in last 5 mins?)
    // For now, just insert.

    const { error } = await supabase.from('waiter_calls').insert({
        restaurant_id: restaurantId,
        table_id: tableId,
        type: type, // 'waiter', 'bill', 'order'
        status: 'pending'
    });

    if (error) {
        console.error("Waiter Call Error:", error);
        return { success: false, error: 'İstek gönderilemedi.' };
    }

    return { success: true };
}

export async function getActiveWaiterCalls(restaurantId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('waiter_calls')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, calls: data };
}

export async function completeWaiterCall(callId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('waiter_calls')
        .update({ status: 'completed' })
        .eq('id', callId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
