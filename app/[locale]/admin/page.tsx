
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signout } from "../auth/actions";
import { Link } from "@/src/i18n/routing";
import { Button } from "@/components/ui/Button";
import { getUserRole } from "@/utils/get-role";
import { getTranslations } from 'next-intl/server';
import { SuperAdminDashboard } from "@/components/admin/SuperAdminDashboard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import HelpWidget from "@/components/admin/HelpWidget";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const supabase = await createClient();
    const role = await getUserRole();
    const t = await getTranslations('admin.dashboard');
    const tSettings = await getTranslations('admin.settings');
    const tSuper = await getTranslations('superAdmin');

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    if (role === 'super_admin') {
        return (
            <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
                <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex justify-between items-center sticky top-0 z-10 transition-colors">
                    <div className="flex flex-col">
                        <div className="font-bold text-xl tracking-tight">{tSuper('panelTitle')}</div>
                        <div className="text-xs text-green-600 font-bold mt-1">{tSuper('mode')}</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <LanguageSwitcher />
                        <form action={signout}>
                            <Button type="submit" variant="ghost" size="sm">{tSettings('logout')}</Button>
                        </form>
                    </div>
                </nav>

                <main className="p-8 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{tSuper('overview')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">{tSuper('overviewDesc')}</p>
                    </div>
                    <SuperAdminDashboard user={user} />
                </main>
                <HelpWidget />
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
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
            <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex justify-between items-center sticky top-0 z-10 transition-colors">
                <div className="flex flex-col">
                    <div className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">{t('title')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('loggedInAs')} <span className="font-mono text-black dark:text-white">{user.email}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
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
                                <div className="mb-8 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">🎂 {t('happyBirthday', { name: user.email?.split('@')[0] || '' })} 🎉</h2>
                                        <p className="opacity-90 mt-1">{t('birthdayWish')}</p>
                                    </div>
                                    <div className="text-4xl text-white">🎁</div>
                                </div>
                            )
                        }
                    }
                    return null;
                })()}

                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{role === 'super_admin' ? tSuper('panelTitle') : t('myRestaurants')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('selectRestaurant')}</p>
                    </div>
                </div>

                {!restaurants || restaurants.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-zinc-800 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🏪</div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('noRestaurantsTitle')}</h3>
                        <p className="text-gray-500 dark:text-zinc-500 mb-8 mt-2 font-medium max-w-sm mx-auto">{t('noRestaurantsDesc')}</p>
                        <Link href="/admin/restaurants/new">
                            <Button className="bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest px-10 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all text-xs">
                                ✨ {t('createRestaurant')}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <Link
                                key={restaurant.id}
                                href={`/admin/restaurants/${restaurant.id}`}
                                className="group block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:border-black/20 dark:hover:border-white/20 transition-all relative"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                        {restaurant.name.substring(0, 1)}
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${restaurant.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'}`}>
                                        {restaurant.is_active ? t('active') : t('inactive')}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{restaurant.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">/{restaurant.slug}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <HelpWidget />
        </div>
    );
}
