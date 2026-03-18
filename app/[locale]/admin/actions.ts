'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUserRole } from '@/utils/get-role'

// --- RESTORAN OLUŞTURMA ---
export async function createRestaurant(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Oturum açmanız gerekiyor.' };

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const address = formData.get('address') as string
    const wifi_pass = formData.get('wifi_pass') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const category = formData.get('category') as string
    const google_place_id = formData.get('google_place_id') as string

    // Varsayılan Lisans (3 Ay)
    const subscription_end_date = new Date();
    subscription_end_date.setMonth(subscription_end_date.getMonth() + 3);

    const { error } = await supabase
        .from('restaurants')
        .insert({
            owner_id: user.id,
            name,
            slug,
            address,
            wifi_pass,
            phone,
            email,
            category,
            google_place_id,
            subscription_end_date: subscription_end_date.toISOString(),
            is_open: true, // Varsayılan: Açık
            is_active: true // Varsayılan: Lisans Aktif
        })

    if (error) {
        if (error.code === '23505') {
            return { error: 'Bu URL uzantısı (slug) zaten alınmış.' }
        }
        return { error: 'Hata: ' + error.message }
    }

    revalidatePath('/admin')
    redirect('/admin')
}

// --- RESTORAN GÜNCELLEME (BÖLÜNMÜŞ FORMLAR İÇİN) ---

async function uploadImageIfPresent(supabase: any, formData: FormData, fieldName: string, id: string, prefix: string) {
    const file = formData.get(fieldName) as File | null;
    if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `brands/${id}-${prefix}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, file);
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(fileName);
            return publicUrl;
        } else {
            console.error(`Upload error for ${fieldName}:`, uploadError);
            throw new Error(`Görsel (${fieldName}) yüklenemedi: ${uploadError.message}`);
        }
    }
    return null;
}

export async function updateRestaurantDailyStatus(id: string, formData: FormData) {
    const supabase = await createClient()
    const is_open = formData.get('is_open') === 'on'
    const { error } = await supabase.from('restaurants').update({ is_open }).eq('id', id)
    if (error) return { error: 'Güncelleme hatası: ' + error.message }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    return { success: true }
}

export async function updateRestaurantBrand(id: string, formData: FormData) {
    const supabase = await createClient()

    // Slug formatlama
    let slug = formData.get('slug') as string;
    if (slug) {
        slug = slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    }

    const updates: any = {
        name: formData.get('name') as string,
        slug: slug,
        address: formData.get('address') as string,
        currency: formData.get('currency') as string,
    }

    try {
        const logoUrl = await uploadImageIfPresent(supabase, formData, 'logo', id, 'logo');
        if (logoUrl) updates.logo_url = logoUrl;

        const coverUrl = await uploadImageIfPresent(supabase, formData, 'cover_image', id, 'cover');
        if (coverUrl) updates.cover_image_url = coverUrl;
    } catch (e: any) {
        return { error: `${e.message} Lütfen boyutların ve uzantının uygun olduğundan emin olun (Örn: 800x800 px, max 2MB).` }
    }

    const { error } = await supabase.from('restaurants').update(updates).eq('id', id)
    if (error) {
        if (error.code === '23505') return { error: 'Bu URL uzantısı (slug) zaten kullanılıyor.' }
        return { error: 'Güncelleme hatası: ' + error.message }
    }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    if (updates.slug) revalidatePath(`/${updates.slug}`)
    return { success: true }
}

export async function updateRestaurantCorporate(id: string, formData: FormData) {
    const supabase = await createClient()
    const updates = {
        owner_name: formData.get('owner_name') as string,
        company_name: formData.get('company_name') as string,
        feedback_email: formData.get('feedback_email') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        google_place_id: formData.get('google_place_id') as string,
        google_review_url: formData.get('google_review_url') as string,
        social_instagram: formData.get('social_instagram') as string,
        social_facebook: formData.get('social_facebook') as string,
        social_twitter: formData.get('social_twitter') as string,
    }
    const { error } = await supabase.from('restaurants').update(updates).eq('id', id)
    if (error) return { error: 'Güncelleme hatası: ' + error.message }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    return { success: true }
}

export async function updateRestaurantCampaign(id: string, formData: FormData) {
    const supabase = await createClient()
    const updates = {
        is_campaign_active: formData.get('is_campaign_active') === 'on',
        campaign_title: formData.get('campaign_title') as string,
        campaign_text: formData.get('campaign_text') as string,
    }
    const { error } = await supabase.from('restaurants').update(updates).eq('id', id)
    if (error) return { error: 'Güncelleme hatası: ' + error.message }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    return { success: true }
}

export async function updateRestaurantMenuAppearance(id: string, formData: FormData) {
    const supabase = await createClient()
    const updates = {
        show_calories: formData.get('show_calories') === 'on',
        show_preparation_time: formData.get('show_preparation_time') === 'on',
    }
    const { error } = await supabase.from('restaurants').update(updates).eq('id', id)
    if (error) return { error: 'Güncelleme hatası: ' + error.message }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    return { success: true }
}

export async function updateRestaurantSystem(id: string, formData: FormData) {
    const supabase = await createClient()
    const role = await getUserRole()
    if (role !== 'super_admin') return { error: 'Yetkisiz işlem.' }

    const updates: any = {
        is_active: formData.get('is_active') === 'on',
        subscription_end_date: formData.get('subscription_end_date') as string,
        is_payment_enabled: formData.get('is_payment_enabled') === 'on',
    }

    // Eğer stripe_account_id gelmişse veya boşaltılmışsa güncelle (undefined değilse)
    const stripeId = formData.get('stripe_account_id');
    if (stripeId !== null) {
        updates.stripe_account_id = stripeId as string;
    }

    const { error } = await supabase.from('restaurants').update(updates).eq('id', id)
    if (error) return { error: 'Güncelleme hatası: ' + error.message }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    return { success: true }
}

export async function deleteRestaurant(id: string) {
    const supabase = await createClient();
    // RLS already protects this, but extra check is good
    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin');
    redirect('/admin');
}

export async function createCategory(restaurantId: string, formData: FormData) {
    const supabase = await createClient();
    const name = formData.get('name') as string;
    if (!name) return { error: 'Kategori adı gereklidir.' };
    const { error } = await supabase.from('categories').insert({ name, restaurant_id: restaurantId, order_index: 0 });
    if (error) return { error: 'Kategori eklenemedi: ' + error.message };
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    return { success: true };
}

export async function createProduct(restaurantId: string, categoryId: string, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const calories = formData.get('calories') ? parseInt(formData.get('calories') as string) : null;
    const preparation_time = formData.get('preparation_time') ? parseInt(formData.get('preparation_time') as string) : null;
    const video_url = formData.get('video_url') as string;
    const imageFile = formData.get('image') as File | null;

    if (!name || isNaN(price)) return { error: 'Geçersiz veri.' };

    let image_url = null;
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, imageFile);
        if (uploadError) { return { error: 'Resim yüklenemedi: ' + uploadError.message }; }
        const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(fileName);
        image_url = publicUrl;
    }

    const { error } = await supabase.from('products').insert({
        restaurant_id: restaurantId,
        category_id: categoryId,
        name,
        description,
        price,
        image_url,
        video_url,
        calories,
        preparation_time,
        is_available: true
    });

    if (error) return { error: 'Ürün eklenemedi: ' + error.message };
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    return { success: true };
}

// --- STOK DURUMU GÜNCELLEME (YENİ) ---
export async function toggleProductAvailability(id: string, restaurantId: string, isAvailable: boolean) {
    const supabase = await createClient();
    await supabase.from('products').update({ is_available: isAvailable }).eq('id', id);
    revalidatePath(`/admin/restaurants/${restaurantId}`);
}

export async function deleteCategory(id: string, restaurantId: string) { const supabase = await createClient(); await supabase.from('categories').delete().eq('id', id); revalidatePath(`/admin/restaurants/${restaurantId}`); }
export async function deleteProduct(id: string, restaurantId: string) { const supabase = await createClient(); await supabase.from('products').delete().eq('id', id); revalidatePath(`/admin/restaurants/${restaurantId}`); }

export async function toggleFeedbackRead(id: string, restaurantId: string, currentStatus: boolean) {
    const supabase = await createClient();
    await supabase.from('feedback').update({ is_read: !currentStatus }).eq('id', id);
    revalidatePath(`/admin/restaurants/${restaurantId}/feedback`);
}
