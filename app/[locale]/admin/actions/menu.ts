'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'

const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

async function deleteFileFromStorage(supabase: any, url: string | null) {
    if (!url) return;
    try {
        const path = url.split('menu-images/').pop();
        if (path) await supabase.storage.from('menu-images').remove([path]);
    } catch (e) {
        console.error('Error deleting file from storage:', e);
    }
}

export async function createCategory(restaurantId: string, formData: FormData) {
    const supabase = await createClient();
    const name = formData.get('name') as string;
    if (!name) return { error: 'Kategori adı gereklidir.' };
    const { error } = await supabase.from('categories').insert({ name, restaurant_id: restaurantId, order_index: 0 });
    if (error) return { error: 'Kategori eklenemedi: ' + error.message };
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    const { data: rest } = await supabase.from('restaurants').select('slug').eq('id', restaurantId).single();
    if (rest?.slug) revalidatePath(`/${rest.slug}`, 'layout');
    return { success: true };
}

export async function createProduct(restaurantId: string, categoryId: string, formData: FormData) {
    const supabase = await createClient();
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const calories = formData.get('calories') ? parseInt(formData.get('calories') as string) : null;
    const preparation_time = formData.get('preparation_time') ? parseInt(formData.get('preparation_time') as string) : null;
    const video_url = formData.get('video_url') as string;
    const imageFile = formData.get('image') as File | null;

    const desc_en = formData.get('description_en') as string;
    const desc_tr = formData.get('description_tr') as string;
    const desc_de = formData.get('description_de') as string;
    const desc_sk = formData.get('description_sk') as string;
    const desc_fr = formData.get('description_fr') as string;
    const desc_it = formData.get('description_it') as string;

    if (!name || isNaN(price)) return { error: 'Geçersiz veri.' };
    if (!desc_en) return { error: 'English description is mandatory (Fallback).' };

    const description_translations = { en: desc_en, tr: desc_tr || '', de: desc_de || '', sk: desc_sk || '', fr: desc_fr || '', it: desc_it || '' };

    let image_url = null;
    if (imageFile && imageFile.size > 0) {
        if (!ALLOWED_FORMATS.includes(imageFile.type)) {
            const tError = await getTranslations('admin.errors');
            return { error: tError('invalidImageFormat') };
        }
        if (imageFile.size > MAX_SIZE) {
            const tError = await getTranslations('admin.errors');
            return { error: tError('imageTooLarge') };
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, imageFile);
        if (uploadError) return { error: 'Resim yüklenemedi: ' + uploadError.message };
        const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(fileName);
        image_url = publicUrl;
    }

    const { error } = await supabase.from('products').insert({
        restaurant_id: restaurantId, category_id: categoryId, name,
        description: desc_en, description_translations, price,
        image_url, video_url, calories, preparation_time, is_available: true
    });

    if (error) return { error: 'Ürün eklenemedi: ' + error.message };
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    const { data: rest } = await supabase.from('restaurants').select('slug').eq('id', restaurantId).single();
    if (rest?.slug) revalidatePath(`/${rest.slug}`, 'layout');
    return { success: true };
}

export async function updateProduct(productId: string, restaurantId: string, formData: FormData) {
    const supabase = await createClient();
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const calories = formData.get('calories') ? parseInt(formData.get('calories') as string) : null;
    const preparation_time = formData.get('preparation_time') ? parseInt(formData.get('preparation_time') as string) : null;
    const video_url = formData.get('video_url') as string;
    const imageFile = formData.get('image') as File | null;

    const desc_en = formData.get('description_en') as string;
    const desc_tr = formData.get('description_tr') as string;
    const desc_de = formData.get('description_de') as string;
    const desc_sk = formData.get('description_sk') as string;
    const desc_fr = formData.get('description_fr') as string;
    const desc_it = formData.get('description_it') as string;

    if (!name || isNaN(price)) return { error: 'Geçersiz veri.' };
    if (!desc_en) return { error: 'English description is mandatory (Fallback).' };

    const description_translations = { en: desc_en, tr: desc_tr || '', de: desc_de || '', sk: desc_sk || '', fr: desc_fr || '', it: desc_it || '' };

    const updates: any = { name, description: desc_en, description_translations, price, video_url, calories, preparation_time };

    if (imageFile && imageFile.size > 0) {
        if (!ALLOWED_FORMATS.includes(imageFile.type)) {
            const tError = await getTranslations('admin.errors');
            return { error: tError('invalidImageFormat') };
        }
        if (imageFile.size > MAX_SIZE) {
            const tError = await getTranslations('admin.errors');
            return { error: tError('imageTooLarge') };
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, imageFile);
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(fileName);
            const { data: oldProduct } = await supabase.from('products').select('image_url').eq('id', productId).single();
            if (oldProduct?.image_url) await deleteFileFromStorage(supabase, oldProduct.image_url);
            updates.image_url = publicUrl;
        }
    }

    const { error } = await supabase.from('products').update(updates).eq('id', productId);
    if (error) return { error: 'Ürün güncellenemedi: ' + error.message };
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    const { data: rest } = await supabase.from('restaurants').select('slug').eq('id', restaurantId).single();
    if (rest?.slug) revalidatePath(`/${rest.slug}`, 'layout');
    return { success: true };
}

export async function toggleProductAvailability(id: string, restaurantId: string, isAvailable: boolean) {
    const supabase = await createClient();
    await supabase.from('products').update({ is_available: isAvailable }).eq('id', id);
    revalidatePath(`/admin/restaurants/${restaurantId}`);
}

export async function deleteCategory(id: string, restaurantId: string) {
    const supabase = await createClient();
    
    // 1. Önce kategoriye ait tüm ürünleri ve içlerindeki resim URL'lerini bul
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('image_url')
        .eq('category_id', id);
        
    if (fetchError) {
        console.error("Kategori ürünleri alınırken hata oluştu:", fetchError);
        return { error: 'Kategori silinmeden önce ürünler alınamadı.' };
    }

    // 2. Bulunan tüm image_url'leri fiziksel olarak Storage üzerinden sil
    if (products && products.length > 0) {
        for (const product of products) {
            if (product.image_url) {
                await deleteFileFromStorage(supabase, product.image_url);
            }
        }
    }

    // 3. Resimler silindikten SONRA Kategoriyi db'den sil
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', id);
    
    if (deleteError) {
        return { error: 'Kategori silinemedi: ' + deleteError.message };
    }
    
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    return { success: true };
}

export async function deleteProduct(id: string, restaurantId: string) {
    const supabase = await createClient();
    const { data: product } = await supabase.from('products').select('image_url').eq('id', id).single();
    if (product?.image_url) await deleteFileFromStorage(supabase, product.image_url);

    await supabase.from('products').delete().eq('id', id);
    revalidatePath(`/admin/restaurants/${restaurantId}`);
}
