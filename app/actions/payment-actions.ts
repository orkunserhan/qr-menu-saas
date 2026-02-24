'use server';

import { stripe } from '@/utils/stripe';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

type LineItem = {
    price_data: {
        currency: string;
        product_data: {
            name: string;
            images?: string[];
        };
        unit_amount: number;
    };
    quantity: number;
};

export async function createCheckoutSession(
    restaurantId: string,
    tableId: string | null,
    cartItems: Array<{ product_id: string; quantity: number; price: number; name: string; image_url?: string | null }>,
    currency: string = 'try'
) {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get('origin');

    // 1. Get Restaurant & Payment Settings
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('is_payment_enabled, stripe_account_id, name, slug')
        .eq('id', restaurantId)
        .single();

    if (!restaurant || !restaurant.is_payment_enabled) {
        return { error: 'Bu restoran için online ödeme aktif değil.' };
    }

    // 2. Create Order in DB (Pending Status)
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            restaurant_id: restaurantId,
            table_id: tableId,
            total_amount: totalAmount,
            status: 'pending',
            payment_status: 'unpaid',
            customer_note: 'Online Ödeme (Stripe) Bekleniyor'
        })
        .select()
        .single();

    if (orderError) {
        return { error: 'Sipariş oluşturulamadı: ' + orderError.message };
    }

    // 3. Insert Order Items
    const orderItemsData = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
    }));

    await supabase.from('order_items').insert(orderItemsData);

    // 4. Create Stripe Checkout Session
    const line_items: LineItem[] = cartItems.map((item) => ({
        price_data: {
            currency: currency.toLowerCase(),
            product_data: {
                name: item.name,
                images: item.image_url ? [item.image_url] : [],
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
    }));

    const sessionParams: any = {
        mode: 'payment',
        line_items,
        success_url: `${origin}/${restaurant.slug}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}&restaurant_id=${restaurantId}`,
        cancel_url: `${origin}/${restaurant.slug}?canceled=true`,
        metadata: {
            orderId: order.id,
            restaurantId: restaurantId,
            tableId: tableId || 'package',
        },
        payment_method_types: ['card'], // Add ideal, bancontact based on region/config if needed
    };

    // If Connected Account exists, route funds there
    if (restaurant.stripe_account_id) {
        sessionParams.payment_intent_data = {
            transfer_data: {
                destination: restaurant.stripe_account_id,
            },
        };
    }

    try {
        const session = await stripe.checkout.sessions.create(sessionParams);

        // Save session ID for verification later
        await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id);

        return { url: session.url };
    } catch (err: any) {
        console.error('Stripe Error:', err);
        return { error: 'Ödeme oturumu başlatılamadı: ' + err.message };
    }
}
