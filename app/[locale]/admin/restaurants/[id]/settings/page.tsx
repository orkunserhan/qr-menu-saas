import { createClient } from '@/utils/supabase/server';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { StaffManager } from '@/components/admin/StaffManager';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { getTranslations } from 'next-intl/server';
import LiteModeToggle from '@/components/admin/LiteModeToggle';

export default async function SettingsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();
    const t = await getTranslations('restAdmin');

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

            {/* Sağ Taraf: Personel Yönetimi ve Görünüm */}
            <div className="space-y-6">

                {/* Görünüm ve Dil Ayarları */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('appearanceAndLang')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('themeAndLangDesc')}</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('panelTheme')}</label>
                            <ThemeSwitcher />
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('panelLang')}</label>
                            <LanguageSwitcher />
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                             <LiteModeToggle 
                                restaurantId={restaurant.id} 
                                initialLiteMode={restaurant.is_lite_mode} 
                             />
                        </div>
                    </div>
                </div>

                {/* Personel Yönetimi */}
                <StaffManager restaurantId={params.id} staffList={staffList || []} />
            </div>
        </div>
    );
}
