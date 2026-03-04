'use server'

import { createClient } from "@/utils/supabase/server";

export async function submitFeedback(restaurantId: string, formData: FormData) {
    const supabase = await createClient();

    const rating = Number(formData.get('rating'));
    const comment = formData.get('comment');
    const contact = formData.get('customer_contact');

    if (!rating) return { error: "Puanlama eksik" };

    // 4 ve üzeri yıldızlar direkt onaylı (Google'a yönlendirilecek), düşükler onaya düşer
    const status = rating >= 4 ? 'approved' : 'pending';

    const { error } = await supabase.from('feedback').insert({
        restaurant_id: restaurantId,
        rating: rating,
        comment: comment ? comment.toString() : '',
        customer_contact: contact ? contact.toString() : null,
        status: status,
        is_read: false
    });

    if (error) {
        console.error("Feedback error:", error);
        return { error: "Hata oluştu" };
    }

    return { success: true };
}

export async function logAnalyticsEvent(restaurantId: string, productId: string | null, eventType: string) {
    const supabase = await createClient();
    await supabase.from('analytics_events').insert({
        restaurant_id: restaurantId,
        product_id: productId,
        event_type: eventType
    });
}
