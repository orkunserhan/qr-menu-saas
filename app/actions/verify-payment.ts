'use server';

import { stripe } from '@/utils/stripe';
import { createClient } from '@/utils/supabase/server';

export async function verifyPayment(sessionId: string, orderId: string) {
    const supabase = await createClient();

    try {
        // 1. Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // 2. Check payment status
        if (session.payment_status === 'paid') {
            // 3. Update Order in DB
            const { error } = await supabase
                .from('orders')
                .update({
                    payment_status: 'paid',
                    status: 'preparing', // Automatically move to preparing or keep pending but marks paid
                    customer_note: 'Online Ödeme Başarılı ✅'
                })
                .eq('id', orderId)
                .eq('stripe_session_id', sessionId); // Extra security

            if (error) {
                console.error("DB Update Error", error);
                return { success: false, error: 'Veritabanı güncellenemedi.' };
            }

            return { success: true };
        } else {
            return { success: false, error: 'Ödeme tamamlanmadı veya beklemede.' };
        }
    } catch (err: any) {
        console.error("Verification Error", err);
        return { success: false, error: err.message };
    }
}
