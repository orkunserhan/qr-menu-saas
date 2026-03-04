
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signout } from "../auth/actions";
import { Link } from "@/src/i18n/routing";
import { Button } from "@/components/ui/Button";
import { getUserRole } from "@/utils/get-role";
import { getTranslations } from 'next-intl/server';
import { SuperAdminDashboard } from "@/components/admin/SuperAdminDashboard";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const supabase = await createClient();
    const role = await getUserRole();
    const t = await getTranslations('admin.dashboard');
    const tSettings = await getTranslations('admin.settings');

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    if (role === 'super_admin') {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex flex-col">
                        <div className="font-bold text-xl tracking-tight">QR Menu Panel</div>
                        <div className="text-xs text-green-600 font-bold mt-1">
                            ⚡ SUPER ADMIN MODU
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <form action={signout}>
                            <Button type="submit" variant="ghost" size="sm">{tSettings('logout')}</Button>
                        </form>
                    </div>
                </nav>

                <main className="p-8 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sistem Genel Bakış</h1>
                        <p className="text-gray-500 mt-2">Platform genelindeki tüm metrikleri ve performansı buradan izleyebilirsiniz.</p>
                    </div>

                    <SuperAdminDashboard user={user} />
                </main>
            </div>
        )
    }

    const { data: profile } = await supabase.from('profiles').select('birth_date').eq('id', user.id).maybeSingle();

    const { data: restaurants } = await supabase
        .from("restaurants")
        .select("*")
        .eq('owner_id', user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex flex-col">
                    <div className="font-bold text-xl tracking-tight">{t('title')}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {t('loggedInAs')} <span className="font-mono text-black">{user.email}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <form action={signout}>
                        <Button type="submit" variant="ghost" size="sm">{tSettings('logout')}</Button>
                    </form>
                </div>
            </nav>

            <main className="p-8 max-w-5xl mx-auto">
                {(() => {
                    const dob = profile?.birth_date || user.user_metadata?.birth_date;
                    if (dob) {
                        const today = new Date();
                        const birthDate = new Date(dob);
                        if (today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth()) {
                            return (
                                <div className="mb-8 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
                                    <div>
                                        <h2 className="text-2xl font-bold">🎂 İyi ki Doğdun, {user.email?.split('@')[0]}! 🎉</h2>
                                        <p className="opacity-90 mt-1">Stil Koçum ailesi olarak yeni yaşının sana şans ve başarı getirmesini dileriz.</p>
                                    </div>
                                    <div className="text-4xl">🎁</div>
                                </div>
                            )
                        }
                    }
                    return null;
                })()}

                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('myRestaurants')}</h1>
                        <p className="text-gray-500 text-sm mt-1">{t('selectRestaurant')}</p>
                    </div>
                </div>

                {!restaurants || restaurants.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                        <div className="text-gray-300 mb-4 text-5xl">🏪</div>
                        <h3 className="text-lg font-medium text-gray-900">{t('noRestaurantsTitle')}</h3>
                        <p className="text-gray-500 mb-6 mt-1">{t('noRestaurantsDesc')}</p>
                        <Link href="/admin/restaurants/new">
                            <Button variant="outline">{t('createRestaurant')}</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <Link
                                key={restaurant.id}
                                href={`/admin/restaurants/${restaurant.id}`}
                                className="group block bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-black/20 transition-all relative"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-500 group-hover:bg-black group-hover:text-white transition-colors">
                                        {restaurant.name.substring(0, 1)}
                                    </div>
                                    {restaurant.is_active ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {t('active')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {t('inactive')}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
                                <p className="text-sm text-gray-500 truncate">/{restaurant.slug}</p>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                                    <span>{t('clickToManage')}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
