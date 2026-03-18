import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OrdersTracker } from "@/components/admin/OrdersTracker";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function OrdersPage({ params }: PageProps) {
    const { id: restaurantId } = await params; // Renamed 'id' to 'restaurantId' for clarity with the new links
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId) // Use restaurantId here
        .single();

    if (!restaurant) return <div>Restoran bulunamadı.</div>

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Minimal Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <a href={`/admin/restaurants/${restaurantId}`} className="text-gray-400 hover:text-black transition-colors">← Geri</a>
                    <div>
                        <h1 className="font-bold text-xl text-gray-900">Aktif Siparişler</h1>
                        <p className="text-xs text-green-600 animate-pulse font-medium">● Canlı Takip Modu</p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6">
                {/* New navigation buttons added here */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Link href={`/admin/restaurants/${restaurantId}`}>
                        <Button variant="outline" className="shadow-sm font-semibold border-gray-300">🏢 Restoran Paneli</Button>
                    </Link>
                    <Link href={`/admin/restaurants/${restaurantId}/tables`}>
                        <Button variant="outline" className="shadow-sm font-semibold border-gray-300">Masa Düzeni</Button>
                    </Link>
                    <Link href={`/admin/restaurants/${restaurantId}/reports`}>
                        <Button variant="outline" className="shadow-sm font-semibold border-gray-300">📊 Raporlar</Button>
                    </Link>
                    <Link href={`/admin/restaurants/${restaurantId}/orders`}>
                        <Button className="bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 hover:text-white shadow-lg font-extrabold text-lg px-6 py-6 animate-pulse">🔔 Siparişler</Button>
                    </Link>
                    <Link href={`/admin/restaurants/${restaurantId}/waiter-calls`}>
                        <Button className="bg-red-600 text-white border border-red-700 hover:bg-red-700 hover:text-white shadow-lg font-extrabold text-lg px-6 py-6 animate-bounce">🛎️ Garson</Button>
                    </Link>
                    <Link href={`/admin/restaurants/${restaurantId}/feedback`}>
                        <Button variant="outline" className="text-yellow-800 border-yellow-200 hover:bg-yellow-100 shadow-sm font-bold">💬 Yorumlar</Button>
                    </Link>
                    <Link href={`/admin/restaurants/${restaurantId}/settings`}>
                        <Button variant="outline" className="shadow-sm font-semibold border-gray-300 hover:bg-gray-50 text-gray-800">⚙️ Ayarlar</Button>
                    </Link>
                </div>
                <OrdersTracker restaurantId={restaurantId} />
            </main>
        </div>
    );
}
