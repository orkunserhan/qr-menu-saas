'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function toggleFeedbackRead(id: string, restaurantId: string, currentStatus: boolean) {
    const supabase = await createClient();
    await supabase.from('feedback').update({ is_read: !currentStatus }).eq('id', id);
    revalidatePath(`/admin/restaurants/${restaurantId}/feedback`);
}

export async function deleteFeedback(id: string, restaurantId: string) {
    const supabase = await createClient();
    await supabase.from('feedback').delete().eq('id', id);
    revalidatePath(`/admin/restaurants/${restaurantId}/feedback`);
}
