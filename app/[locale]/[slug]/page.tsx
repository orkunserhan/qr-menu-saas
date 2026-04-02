import { createClient } from "@/utils/supabase/server";
import ClientMenuPage from "./ClientMenuPage";
import { Restaurant, Category } from "@/types";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

interface MenuPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function MenuPage({ params, searchParams }: MenuPageProps) {
    const { slug, locale } = await params;
    const { table } = await searchParams; // Yakalanan masa numarası
    const supabase = await createClient();

    // 1. Restoran Verisini Çek
    const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

    const restaurant = restaurantData as Restaurant | null;

    if (!restaurant) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400">Restaurant not found.</div>
    }

    // 2. Abonelik Kontrolü (Dondurma Sistemi)
    const now = new Date();
    const subDate = restaurant.subscription_end_date ? new Date(restaurant.subscription_end_date) : null;

    if (subDate && subDate < now) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Service Suspended</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                    This restaurant's menu service has expired. Please contact management.
                </p>
            </div>
        )
    }

    if (restaurant.is_active === false) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400">This restaurant is currently not providing service.</div>
    }

    // 3. Kategorileri ve Ürünleri Çek
    const { data: categoriesData } = await supabase
        .from("categories")
        .select("*, products(*)")
        .eq("restaurant_id", restaurant.id)
        .order("order_index");

    const categories = (categoriesData || []) as Category[];

    // 4. Client Component'e Gönder (Dil seçimi orada olacak)
    return <ClientMenuPage restaurant={restaurant} categories={categories} initialLocale={locale} tableNumber={table} />;
}
