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

// --- RESTORAN GÜNCELLEME (YETKİ KONTROLLÜ) ---
export async function updateRestaurant(id: string, formData: FormData) {
    const supabase = await createClient()
    const role = await getUserRole() // Yetkiyi kontrol et

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const address = formData.get('address') as string
    const wifi_pass = formData.get('wifi_pass') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const category = formData.get('category') as string
    const google_place_id = formData.get('google_place_id') as string
    const social_instagram = formData.get('social_instagram') as string
    const social_twitter = formData.get('social_twitter') as string
    const social_facebook = formData.get('social_facebook') as string

    const show_calories = formData.get('show_calories') === 'on'
    const show_preparation_time = formData.get('show_preparation_time') === 'on'

    // Günlük Açık/Kapalı Durumu (Hem Admin Hem Owner değiştirebilir)
    const is_open = formData.get('is_open') === 'on'

    // Kampanya Ayarları
    const campaign_title = formData.get('campaign_title') as string
    const campaign_text = formData.get('campaign_text') as string
    const is_campaign_active = formData.get('is_campaign_active') === 'on'
    const currency = formData.get('currency') as string

    const updates: any = {
        name,
        slug,
        address,
        wifi_pass,
        phone,
        email,
        category,
        google_place_id,
        google_review_url: formData.get('google_review_url') as string,
        social_instagram,
        social_twitter,
        social_facebook,
        show_calories,
        show_preparation_time,
        is_open,
        campaign_title,
        campaign_text,
        is_campaign_active,
        currency,

        // YENİ ALANLAR (Kurumsal)
        owner_name: formData.get('owner_name'),
        company_name: formData.get('company_name'),
        feedback_email: formData.get('feedback_email'),
    }

    // Kritik alanları SADECE Super Admin güncelleyebilir
    if (role === 'super_admin') {
        updates.is_active = formData.get('is_active') === 'on'
        updates.subscription_end_date = formData.get('subscription_end_date') as string
        updates.is_payment_enabled = formData.get('is_payment_enabled') === 'on'
        // Opsiyonel: Admin panelinden manuel stripe ID girme
        if (formData.get('stripe_account_id')) {
            updates.stripe_account_id = formData.get('stripe_account_id') as string
        }
    }

    const { error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', id)

    if (error) {
        if (error.code === '23505') {
            return { error: 'Bu URL uzantısı (slug) zaten kullanılıyor.' }
        }
        return { error: 'Güncelleme hatası: ' + error.message }
    }

    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    revalidatePath(`/${slug}`)

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
        is_available: true,
        // YENİ STOK ALANLARI
        track_stock: formData.get('track_stock') === 'on',
        stock_quantity: formData.get('stock_quantity') ? parseInt(formData.get('stock_quantity') as string) : null
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
