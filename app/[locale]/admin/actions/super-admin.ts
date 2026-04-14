'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/mailer';
import { randomBytes } from 'crypto';

// ── Supabase Admin Client (service_role — RLS bypass) ──────────────────────
function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
    }

    return createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ── Calling user must be super_admin ───────────────────────────────────────
async function assertSuperAdmin() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'super_admin') throw new Error('Forbidden');
}

// ── createRestaurantWithInvite ─────────────────────────────────────────────
export async function createRestaurantWithInvite(formData: FormData): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await assertSuperAdmin();

        const restaurantName = (formData.get('restaurant_name') as string)?.trim();
        const ownerEmail = (formData.get('owner_email') as string)?.trim().toLowerCase();
        const defaultLocale = (formData.get('default_locale') as string) || 'en';
        const slug = restaurantName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        if (!restaurantName || !ownerEmail) {
            return { success: false, error: 'Restaurant name and email are required.' };
        }

        const adminSupabase = getAdminClient();

        // 1. Kullanıcı oluştur (is_active: false — henüz şifre belirlenmedi)
        const { data: newUser, error: userError } = await adminSupabase.auth.admin.createUser({
            email: ownerEmail,
            email_confirm: true, // E-posta doğrulaması bizim token sistemimiz üzerinden
            user_metadata: { full_name: restaurantName + ' Owner' },
        });

        if (userError) {
            // Kullanıcı zaten varsa direkt devam et
            if (!userError.message.includes('already registered')) {
                return { success: false, error: `User creation failed: ${userError.message}` };
            }
        }

        const userId = newUser?.user?.id;

        if (userId) {
            // 2. Profil oluştur/güncelle
            await adminSupabase.from('profiles').upsert({
                id: userId,
                email: ownerEmail,
                full_name: restaurantName + ' Owner',
                role: 'restaurant_owner',
            });

            // 3. Restoran oluştur (is_active: false — onay bekliyor)
            const { data: restaurant, error: restError } = await adminSupabase
                .from('restaurants')
                .insert({
                    owner_id: userId,
                    name: restaurantName,
                    slug: slug,
                    email: ownerEmail,
                    is_active: false, // Super Admin onayına kadar pasif
                })
                .select('id')
                .single();

            if (restError) {
                return { success: false, error: `Restaurant creation failed: ${restError.message}` };
            }

            // 4. Tek kullanımlık güvenli token oluştur
            const token = randomBytes(32).toString('hex');

            const { error: tokenError } = await adminSupabase
                .from('invitation_tokens')
                .insert({
                    token,
                    email: ownerEmail,
                    restaurant_id: restaurant.id,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                });

            if (tokenError) {
                return { success: false, error: `Token creation failed: ${tokenError.message}` };
            }

            // 5. Hoş geldin e-postası gönder
            await sendWelcomeEmail({
                email: ownerEmail,
                token,
                locale: defaultLocale,
                restaurantName,
            });
        }

        return { success: true };
    } catch (err: any) {
        console.error('[createRestaurantWithInvite]', err);
        return { success: false, error: err.message || 'Unexpected error occurred.' };
    }
}
