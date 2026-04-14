'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export async function setPasswordWithToken(formData: FormData): Promise<{ error?: string }> {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;
    const locale = (formData.get('locale') as string) || 'en';

    // 1. Doğrulama
    if (!token || !password || !confirmPassword) {
        return { error: 'All fields are required.' };
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match.' };
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters.' };
    }

    const adminSupabase = getAdminClient();

    // 2. Token doğrula
    const { data: tokenRow, error: tokenError } = await adminSupabase
        .from('invitation_tokens')
        .select('*')
        .eq('token', token)
        .single();

    if (tokenError || !tokenRow) {
        return { error: 'Invalid or expired invitation link.' };
    }

    if (tokenRow.used_at) {
        return { error: 'This invitation link has already been used.' };
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
        return { error: 'This invitation link has expired. Please contact support.' };
    }

    // 3. Kullanıcıyı e-postasına göre bul
    const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (listError) return { error: 'Could not verify user.' };

    const targetUser = users.find(u => u.email === tokenRow.email);
    if (!targetUser) return { error: 'User not found.' };

    // 4. Supabase Auth üzerinden şifreyi güncelle
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(targetUser.id, {
        password: password,
    });

    if (updateError) {
        return { error: `Failed to set password: ${updateError.message}` };
    }

    // 5. Profili is_active: true yap + restoranı aktifleştir
    await adminSupabase
        .from('profiles')
        .update({ is_active: true } as any)
        .eq('id', targetUser.id);

    if (tokenRow.restaurant_id) {
        await adminSupabase
            .from('restaurants')
            .update({ is_active: true })
            .eq('id', tokenRow.restaurant_id);
    }

    // 6. Token'ı kullanıldı olarak işaretle
    await adminSupabase
        .from('invitation_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

    // 7. Login sayfasına yönlendir
    redirect(`/${locale}/auth/login?activated=true`);
}

// ── Şifre Sıfırlama için Token Oluştur (Forgot Password) ─────────────────
export async function createResetToken(email: string): Promise<{ token?: string; error?: string }> {
    const adminSupabase = getAdminClient();

    // Kullanıcının var olup olmadığını kontrol et
    const { data: { users } } = await adminSupabase.auth.admin.listUsers();
    const targetUser = users.find(u => u.email === email.toLowerCase());
    if (!targetUser) {
        // Güvenlik açısından hata vermiyoruz
        return { token: undefined };
    }

    const { randomBytes } = await import('crypto');
    const token = randomBytes(32).toString('hex');

    await adminSupabase.from('invitation_tokens').insert({
        token,
        email: email.toLowerCase(),
        restaurant_id: null,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 saat
    });

    return { token };
}
