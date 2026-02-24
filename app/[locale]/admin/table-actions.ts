'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- MASA YÖNETİMİ ---

export async function createTable(restaurantId: string, name: string, color: string = 'gray') {
    const supabase = await createClient()

    // Varsayılan olarak ortaya ekle (50%, 50%)
    const { data, error } = await supabase
        .from('tables')
        .insert({
            restaurant_id: restaurantId,
            name: name,
            color: color,
            position_x: 50,
            position_y: 50,
            shape: 'square'
        })
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath(`/admin/restaurants/${restaurantId}/tables`)
    return { success: true, table: data }
}

export async function updateTablePosition(tableId: string, x: number, y: number, restaurantId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tables')
        .update({ position_x: x, position_y: y })
        .eq('id', tableId)

    if (error) return { error: error.message }
    revalidatePath(`/admin/restaurants/${restaurantId}/tables`)
    return { success: true }
}

export async function deleteTable(tableId: string, restaurantId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)

    if (error) return { error: error.message }
    revalidatePath(`/admin/restaurants/${restaurantId}/tables`)
    return { success: true }
}
