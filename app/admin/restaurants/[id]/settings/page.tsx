import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SettingsForm } from "@/components/admin/SettingsForm";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function SettingsPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    // Fetch Restaurant
    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

    if (!restaurant) return <div>Restoran bulunamadı.</div>

    // Güvenlik: Sadece sahibi görebilsin (RLS bunu yapar ama Next.js tarafında da check iyidir)
    if (restaurant.owner_id !== user.id) {
        return <div>Yetkisiz erişim.</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href={`/admin/restaurants/${id}`} className="text-gray-400 hover:text-black transition-colors">
                        ← Geri
                    </Link>
                    <h1 className="font-bold text-xl text-gray-900">Ayarlar: {restaurant.name}</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto py-8 px-6">
                <SettingsForm restaurant={restaurant} />
            </div>
        </div>
    );
}
