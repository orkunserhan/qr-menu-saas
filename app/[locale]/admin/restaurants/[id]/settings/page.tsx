import { createClient } from '@/utils/supabase/server';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { StaffManager } from '@/components/admin/StaffManager';

export default async function SettingsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();

    // Restoran Bilgisi
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !restaurant) {
        console.error("Settings Error:", error);
        return <div>Restoran bulunamadı. (ID: {params.id})</div>;
    }

    // Kullanıcı Rolü ve Personel Listesi
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

    const { data: staffList } = await supabase
        .from('restaurant_staff')
        .select('*')
        .eq('restaurant_id', params.id)
        .order('created_at');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Sol Taraf: Genel Ayarlar */}
            <div className="lg:col-span-2">
                <SettingsForm restaurant={restaurant} role={profile?.role || null} />
            </div>

            {/* Sağ Taraf: Personel Yönetimi */}
            <div>
                <StaffManager restaurantId={params.id} staffList={staffList || []} />
            </div>
        </div>
    );
}
