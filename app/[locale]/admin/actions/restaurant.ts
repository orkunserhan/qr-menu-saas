'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUserRole } from '@/utils/get-role'
import { getTranslations } from 'next-intl/server'

// --- STORAGE UTILS ---
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

async function deleteFileFromStorage(supabase: any, url: string | null) {
    if (!url) return;
    try {
        const path = url.split('menu-images/').pop();
        if (path) {
            await supabase.storage.from('menu-images').remove([path]);
        }
    } catch (e) {
        console.error('Error deleting file from storage:', e);
    }
}

async function uploadImageIfPresent(supabase: any, formData: FormData, fieldName: string, id: string, prefix: string) {
    const file = formData.get(fieldName) as File | null;
    if (file && file.size > 0) {
        if (!ALLOWED_FORMATS.includes(file.type)) throw new Error('invalidImageFormat');
        if (file.size > MAX_SIZE) throw new Error('imageTooLarge');

        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `brands/${id}-${prefix}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, file);
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(fileName);
            return publicUrl;
        } else {
            throw new Error(`Image upload failed for ${fieldName}: ${uploadError.message}`);
        }
    }
    return null;
}

export async function createRestaurant(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You need to be logged in.' };

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const address = formData.get('address') as string
    const wifi_pass = formData.get('wifi_pass') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const category = formData.get('category') as string
    const google_place_id = formData.get('google_place_id') as string

    const subscription_end_date = new Date();
    subscription_end_date.setMonth(subscription_end_date.getMonth() + 3);

    const { data: newRest, error } = await supabase
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
            is_open: true,
            is_active: true
        }).select('id').single();

    if (error) {
        if (error.code === '23505') return { error: 'This URL slug is already taken.' }
        return { error: 'Error: ' + error.message }
    }

    // POST-CREATION HOOK: Add 5 default tables to prevent null pointer errors
    // and ensure Order/Table APIs work correctly on first open.
    if (newRest?.id) {
        const defaultTables = Array.from({ length: 5 }).map((_, i) => ({
            restaurant_id: newRest.id,
            name: `Table ${i + 1}`,
            color: 'gray',
            position_x: 20 + (i * 15),
            position_y: 50,
            shape: 'square'
        }));
        await supabase.from('tables').insert(defaultTables);
    }

    revalidatePath('/admin')
    redirect('/admin')
}

export async function updateRestaurantDailyStatus(id: string, formData: FormData) {
    const supabase = await createClient()
    const is_open = formData.get('is_open') === 'on'
    const { error } = await supabase.from('restaurants').update({ is_open }).eq('id', id)
    if (error) return { error: 'Update error: ' + error.message }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    return { success: true }
}

export async function updateRestaurantBrand(id: string, formData: FormData) {
    const supabase = await createClient()
    let slug = formData.get('slug') as string;
    if (slug) slug = slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

    const updates: any = {
        name: formData.get('name') as string,
        slug: slug,
        address: formData.get('address') as string,
        currency: formData.get('currency') as string,
    }

    try {
        const logoUrl = await uploadImageIfPresent(supabase, formData, 'logo', id, 'logo');
        if (logoUrl) {
            const { data: old } = await supabase.from('restaurants').select('logo_url').eq('id', id).single();
            if (old?.logo_url) await deleteFileFromStorage(supabase, old.logo_url);
            updates.logo_url = logoUrl;
        }

        const coverUrl = await uploadImageIfPresent(supabase, formData, 'cover_image', id, 'cover');
        if (coverUrl) {
            const { data: old } = await supabase.from('restaurants').select('cover_image_url').eq('id', id).single();
            if (old?.cover_image_url) await deleteFileFromStorage(supabase, old.cover_image_url);
            updates.cover_image_url = coverUrl;
        }
    } catch (e: any) {
        const tError = await getTranslations('admin.errors');
        const message = e.message === 'imageTooLarge' || e.message === 'invalidImageFormat' ? tError(e.message) : e.message;
        return { error: message };
    }

    const { error } = await supabase.from('restaurants').update(updates).eq('id', id)
    if (error) {
        if (error.code === '23505') return { error: 'This URL slug is already in use.' }
        return { error: 'Update error: ' + error.message }
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
    if (error) return { error: 'Update error: ' + error.message }
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

export async function updateLiteMode(id: string, is_lite_mode: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from('restaurants').update({ is_lite_mode }).eq('id', id)
    if (error) return { error: 'Update error: ' + error.message }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    return { success: true }
}

export async function updateRestaurantMenuAppearance(id: string, formData: FormData) {
    const supabase = await createClient()
    const updates = {
        show_calories: formData.get('show_calories') === 'on',
        show_preparation_time: formData.get('show_preparation_time') === 'on',
        is_lite_mode: formData.get('is_lite_mode') === 'on',
    }
    const { error } = await supabase.from('restaurants').update(updates).eq('id', id)
    if (error) return { error: 'Update error: ' + error.message }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    return { success: true }
}

export async function updateRestaurantSystem(id: string, formData: FormData) {
    const supabase = await createClient()

    // Auth check: Verify user is authenticated (cookie security protection)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: 'Unauthorized: Please log in first.' };
    }

    // Role check
    const role = await getUserRole()

    if (role !== 'super_admin') {
        return { error: 'Unauthorized operation.' }
    }

    const updates: any = {
        is_active: formData.get('is_active') === 'on',
        subscription_end_date: formData.get('subscription_end_date') as string,
        is_payment_enabled: formData.get('is_payment_enabled') === 'on',
    }
    // Stripe Account ID is missing in the database schema.
    // const stripeId = formData.get('stripe_account_id');
    // if (stripeId !== null) updates.stripe_account_id = stripeId as string;

    const { error } = await supabase.from('restaurants').update(updates).eq('id', id)
    if (error) return { error: 'Güncelleme hatası: ' + error.message }
    revalidatePath(`/admin/restaurants/${id}`)
    revalidatePath(`/admin/restaurants/${id}/settings`)
    return { success: true }
}

export async function deleteRestaurant(id: string) {
    const supabase = await createClient();
    const role = await getUserRole();
    if (role !== 'super_admin') return { error: 'Unauthorized operation.' };

    // Yumuşak silme: Silmek yerine deleted_at değerini giriyoruz.
    const { error } = await supabase
        .from('restaurants')
        .update({ 
            deleted_at: new Date().toISOString(),
            is_active: false 
        })
        .eq('id', id);

    if (error) return { error: error.message };
    
    revalidatePath('/admin');
    return { success: true };
}

export async function restoreRestaurant(id: string) {
    const supabase = await createClient();
    const role = await getUserRole();
    if (role !== 'super_admin') return { error: 'Unauthorized operation.' };

    const { error } = await supabase
        .from('restaurants')
        .update({ 
            deleted_at: null,
            is_active: true 
        })
        .eq('id', id);

    if (error) return { error: error.message };
    
    revalidatePath('/admin');
    return { success: true };
}

export async function hardDeleteRestaurant(id: string) {
    const supabase = await createClient();
    const role = await getUserRole();
    if (role !== 'super_admin') return { error: 'Unauthorized operation.' };

    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (error) return { error: error.message };
    
    revalidatePath('/admin');
    return { success: true };
}

export async function toggleRestaurantActiveStatus(id: string, currentStatus: boolean) {
    const supabase = await createClient();
    const role = await getUserRole();
    if (role !== 'super_admin') return { error: 'Unauthorized operation.' };

    const { error } = await supabase.from('restaurants').update({ is_active: !currentStatus }).eq('id', id);
    if (error) return { error: error.message };
    
    revalidatePath('/admin');
    return { success: true };
}
