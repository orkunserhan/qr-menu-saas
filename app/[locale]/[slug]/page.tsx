import { createClient } from "@/utils/supabase/server";
import { Redirect } from "next";
import ClientMenuPage from "./ClientMenuPage";
import { Restaurant, Category } from "@/types";

interface MenuPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export default async function MenuPage({ params }: MenuPageProps) {
    const { slug, locale } = await params;
    const supabase = await createClient();

    // 1. Restoran Verisini Çek
    const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

    const restaurant = restaurantData as Restaurant | null;

    if (!restaurant) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Restoran bulunamadı.</div>
    }

    // 2. Abonelik Kontrolü (Dondurma Sistemi)
    const now = new Date();
    const subDate = restaurant.subscription_end_date ? new Date(restaurant.subscription_end_date) : null;

    if (subDate && subDate < now) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Hizmet Donduruldu</h1>
                <p className="text-gray-500 text-sm max-w-xs">
                    Bu işletmenin menü hizmet süresi dolmuştur. Lütfen yetkili ile iletişime geçin.
                </p>
            </div>
        )
    }

    if (restaurant.is_active === false) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Bu restoran şu an hizmet vermiyor.</div>
    }

    // 3. Kategorileri ve Ürünleri Çek
    const { data: categoriesData } = await supabase
        .from("categories")
        .select("*, products(*)")
        .eq("restaurant_id", restaurant.id)
        .order("order_index");

    const categories = (categoriesData || []) as Category[];

    // 4. Client Component'e Gönder (Dil seçimi orada olacak)
    return <ClientMenuPage restaurant={restaurant} categories={categories} initialLocale={locale} />;
}
