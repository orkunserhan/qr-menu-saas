import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OrdersTracker } from "@/components/admin/OrdersTracker";
import { Link } from "@/src/i18n/routing";
import { Button } from "@/components/ui/Button";
import HelpWidget from "@/components/admin/HelpWidget";
import { getTranslations } from "next-intl/server";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function OrdersPage({ params }: PageProps) {
    const { id: restaurantId } = await params;
    const supabase = await createClient();
    const t = await getTranslations('restAdmin');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

    if (!restaurant) return <div>{t('not_found')}</div>

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
            {/* Minimal Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <a href={`/admin/restaurants/${restaurantId}`} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">← {t('tableLayout')}</a>
                    <div>
                        <h1 className="font-bold text-xl text-gray-900 dark:text-white">{t('orders.title')}</h1>
                        <p className="text-xs text-green-600 animate-pulse font-medium">● Live</p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6">
                <OrdersTracker restaurantId={restaurantId} />
            </main>
            <HelpWidget />
        </div>
    );
}
