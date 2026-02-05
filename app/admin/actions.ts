'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// ... createRestaurant ...
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

    // Google Maps ID (Opsiyonel)
    const google_place_id = formData.get('google_place_id') as string

    // Abonelik Bitiş Tarihi (Varsayılan 3 ay sonrasını hesapla)
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
            subscription_end_date: subscription_end_date.toISOString()
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

// ... updateRestaurant ...
export async function updateRestaurant(id: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const address = formData.get('address') as string
    const wifi_pass = formData.get('wifi_pass') as string
    const is_active = formData.get('is_active') === 'on'
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const category = formData.get('category') as string
    const google_place_id = formData.get('google_place_id') as string

    // Süper Admin Yetkisi (Normalde burayı kullanıcı değiştirememeli, ama panelden siz yöneteceksiniz)
    const subDateStr = formData.get('subscription_end_date') as string;

    const { error } = await supabase
        .from('restaurants')
        .update({
            name,
            slug,
            address,
            wifi_pass,
            is_active,
            phone,
            email,
            category,
            google_place_id,
            subscription_end_date: subDateStr // Tarihi güncelle
        })
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

// ... Diğerleri aynı ...
export async function deleteRestaurant(id: string) { const supabase = await createClient(); const { error } = await supabase.from('restaurants').delete().eq('id', id); if (error) return { error: error.message }; revalidatePath('/admin'); redirect('/admin'); }
export async function createCategory(restaurantId: string, formData: FormData) { const supabase = await createClient(); const name = formData.get('name') as string; if (!name) return { error: 'Kategori adı gereklidir.' }; const { error } = await supabase.from('categories').insert({ name, restaurant_id: restaurantId, order_index: 0 }); if (error) return { error: 'Kategori eklenemedi: ' + error.message }; revalidatePath(`/admin/restaurants/${restaurantId}`); return { success: true }; }
export async function createProduct(restaurantId: string, categoryId: string, formData: FormData) { const supabase = await createClient(); const name = formData.get('name') as string; const description = formData.get('description') as string; const price = parseFloat(formData.get('price') as string); const imageFile = formData.get('image') as File | null; if (!name || isNaN(price)) return { error: 'Geçersiz veri.' }; let image_url = null; if (imageFile && imageFile.size > 0) { const fileExt = imageFile.name.split('.').pop(); const fileName = `${restaurantId}/${Date.now()}.${fileExt}`; const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, imageFile); if (uploadError) { return { error: 'Resim yüklenemedi: ' + uploadError.message }; } const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(fileName); image_url = publicUrl; } const { error } = await supabase.from('products').insert({ restaurant_id: restaurantId, category_id: categoryId, name, description, price, image_url, is_available: true }); if (error) return { error: 'Ürün eklenemedi: ' + error.message }; revalidatePath(`/admin/restaurants/${restaurantId}`); return { success: true }; }
export async function deleteCategory(id: string, restaurantId: string) { const supabase = await createClient(); await supabase.from('categories').delete().eq('id', id); revalidatePath(`/admin/restaurants/${restaurantId}`); }
export async function deleteProduct(id: string, restaurantId: string) { const supabase = await createClient(); await supabase.from('products').delete().eq('id', id); revalidatePath(`/admin/restaurants/${restaurantId}`); }
