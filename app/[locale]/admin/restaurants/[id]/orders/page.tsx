import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OrdersTracker } from "@/components/admin/OrdersTracker";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function OrdersPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

    if (!restaurant) return <div>Restoran bulunamadı.</div>

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Minimal Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <a href={`/admin/restaurants/${id}`} className="text-gray-400 hover:text-black transition-colors">← Geri</a>
                    <div>
                        <h1 className="font-bold text-xl text-gray-900">Aktif Siparişler</h1>
                        <p className="text-xs text-green-600 animate-pulse font-medium">● Canlı Takip Modu</p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6">
                <OrdersTracker restaurantId={id} />
            </main>
        </div>
    );
}
