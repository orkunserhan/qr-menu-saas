'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// --- PERSONEL İŞLEMLERİ ---

export async function addStaff(restaurantId: string, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    const { error } = await supabase.from('restaurant_staff').insert({
        restaurant_id: restaurantId,
        name,
        role,
        email,
        phone
    });

    if (error) return { error: 'Personel eklenemedi: ' + error.message };

    revalidatePath(`/admin/restaurants/${restaurantId}/settings`); // Ayarlar sayfasında listelenecek
    return { success: true };
}

export async function deleteStaff(id: string, restaurantId: string) {
    const supabase = await createClient();
    await supabase.from('restaurant_staff').delete().eq('id', id);
    revalidatePath(`/admin/restaurants/${restaurantId}/settings`);
}




// RESTORAN BİLGİLERİNİ GÜNCELLE (Şirket Bilgileri & Feedback Maili)
export async function updateRestaurantOwnerInfo(restaurantId: string, formData: FormData) {
    const supabase = await createClient();

    const updates = {
        owner_name: formData.get('owner_name'),
        company_name: formData.get('company_name'),
        feedback_email: formData.get('feedback_email'),
    };

    const { error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurantId);

    if (error) return { error: error.message };
    revalidatePath(`/admin/restaurants/${restaurantId}/settings`);
    return { success: true };
}
