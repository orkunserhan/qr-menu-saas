'use server';

import { createClient } from '@/utils/supabase/server';
import { logSystem } from '@/utils/logger';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- ZOD SCHEMAS ---
const OrderItemSchema = z.object({
    product_id: z.string().uuid(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    options: z.string().optional().or(z.null()),
    name: z.string().optional(),
    image_url: z.string().optional().or(z.null())
});

const CreateOrderSchema = z.object({
    restaurantId: z.string().uuid(),
    tableId: z.string().optional().nullable(),
    totalAmount: z.number().min(0),
    items: z.array(OrderItemSchema).min(1),
    customerNote: z.string().max(500).optional()
});

type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// --- TYPES ---
export type CreateOrderResult =
    | { success: true; orderId: string }
    | { success: false; error: string; code?: string };

export type OrderStatus = 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

// --- ACTIONS ---

/**
 * Creates a new order with validation, robust error handling, and STOCK MANAGEMENT.
 */
export async function createOrder(
    restaurantId: string,
    tableId: string | null,
    items: any[],
    totalAmount: number,
    note?: string
): Promise<CreateOrderResult> {
    const supabase = await createClient()

    // 1. Resolve Table ID if it's a name/slug instead of UUID
    let resolvedTableId: string | null = null;
    if (tableId && tableId.trim() !== '') {
        // Check if it's already a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(tableId)) {
            resolvedTableId = tableId;
        } else {
            // It's a name (e.g. "5"), resolve it
            const { data: tableData } = await supabase
                .from('tables')
                .select('id')
                .eq('restaurant_id', restaurantId)
                .eq('name', tableId)
                .single();
            
            if (tableData) {
                resolvedTableId = tableData.id;
            } else {
                // If table not found by name, we might still insert it as NULL or handle it
                console.warn(`Table not found by name: ${tableId}`);
                resolvedTableId = null;
            }
        }
    }

    const validation = CreateOrderSchema.safeParse({
        restaurantId,
        tableId: resolvedTableId,
        totalAmount,
        items,
        customerNote: note
    });

    if (!validation.success) {
        console.error("Order Validation Failed:", validation.error.format());
        return { success: false, error: "invalidOrderData", code: "VALIDATION_ERROR" };
    }

    const data = validation.data;

    try {
        // --- AVAILABILITY CHECK ---
        const productIds = data.items.map(i => i.product_id);
        const { data: dbProducts, error: prodError } = await supabase
            .from('products')
            .select('id, name, is_available')
            .in('id', productIds);

        if (prodError || !dbProducts) {
            return { success: false, error: "stockCheckError", code: "STOCK_CHECK_ERROR" };
        }

        for (const item of data.items) {
            const product = dbProducts.find(p => p.id === item.product_id);

            if (!product) {
                return { success: false, error: "productNotFound", code: "PRODUCT_NOT_FOUND" };
            }

            if (!product.is_available) {
                return { success: false, error: "outOfStock", code: "OUT_OF_STOCK" };
            }
        }
        // --- END AVAILABILITY CHECK ---

        // 2. Insert Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                restaurant_id: data.restaurantId,
                table_id: data.tableId,
                total_amount: data.totalAmount,
                customer_note: data.customerNote,
                status: 'pending' as OrderStatus,
                payment_status: 'unpaid' as PaymentStatus
            })
            .select()
            .single()

        if (orderError) {
            console.error('Order Insert Error:', orderError);
            await logSystem('Order DB Error', 'error', restaurantId, { error: orderError });
            return { success: false, error: 'orderCreateError', code: "DB_INSERT_ERROR" }
        }

        // 3. Insert Order Items
        const orderItems = data.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_time: item.price,
            options: item.options
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            console.error('Order Items Insert Error:', itemsError);
            await supabase.from('orders').delete().eq('id', order.id);
            await logSystem('Order Items Error', 'error', restaurantId, { error: itemsError });
            return { success: false, error: 'orderItemsError', code: "DB_ITEMS_ERROR" }
        }

        // 4. Trigger Notifications (Supabase Realtime handles this automatically)
        revalidatePath(`/admin/restaurants/${restaurantId}/products`); // Refresh product list for admin to see new stock

        return { success: true, orderId: order.id }

    } catch (err: any) {
        console.error("Unexpected Create Order Error:", err);
        return { success: false, error: "internalError", code: "INTERNAL_ERROR" };
    }
}

/**
 * Fetches active orders for the dashboard.
 */
export async function getActiveOrders(restaurantId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('orders')
        .select(`
            id, 
            created_at, 
            status, 
            table_id, 
            total_amount, 
            customer_note, 
            payment_status,
            order_items (
                id, 
                quantity, 
                price_at_time, 
                options, 
                products (name)
            )
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['pending', 'preparing', 'served'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch Active Orders Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true, orders: data };
}


/**
 * Updates order status.
 */
export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    restaurantId: string
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

    if (error) {
        console.error("Update Status Error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/restaurants/${restaurantId}/orders`);

    if (status === 'paid' || status === 'cancelled') {
        revalidatePath(`/admin/restaurants/${restaurantId}/tables`);
    }

    return { success: true }
}
