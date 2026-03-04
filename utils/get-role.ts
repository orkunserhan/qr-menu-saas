import { createClient } from "./supabase/server";

export type UserRole = 'super_admin' | 'restaurant_owner' | null;

export async function getUserRole(): Promise<UserRole> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Veritabanında kayıt yoksa NULL döner, varsayılan atamayız. 
    // Böylece "Profil Yok" durumunu ayırt edebiliriz.
    return profile?.role || null;
}
