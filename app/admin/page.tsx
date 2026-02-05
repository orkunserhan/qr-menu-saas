import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signout } from "../auth/actions";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminPage() {
    const supabase = await createClient();

    // 1. Kullanıcı kontrolü
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    // 2. Restoranları getir
    const { data: restaurants } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="font-bold text-xl tracking-tight">QR Menu Admin</div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
                    <form action={signout}>
                        <Button type="submit" variant="ghost" size="sm">Çıkış Yap</Button>
                    </form>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8 max-w-5xl mx-auto">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Restoranlarım</h1>
                        <p className="text-gray-500 text-sm mt-1">Yönetmek istediğiniz restoranı seçin.</p>
                    </div>
                    <Link href="/admin/restaurants/new">
                        <Button>
                            + Yeni Restoran Ekle
                        </Button>
                    </Link>
                </div>

                {/* List */}
                {!restaurants || restaurants.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                        <div className="text-gray-300 mb-4 text-5xl">🏪</div>
                        <h3 className="text-lg font-medium text-gray-900">Henüz restoranın yok</h3>
                        <p className="text-gray-500 mb-6 mt-1">İlk restoranını oluşturarak dijital menünü tasarlamaya başla.</p>
                        <Link href="/admin/restaurants/new">
                            <Button variant="outline">Restoran Oluştur</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <Link
                                key={restaurant.id}
                                href={`/admin/restaurants/${restaurant.id}`}
                                className="group block bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-black/20 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-500 group-hover:bg-black group-hover:text-white transition-colors">
                                        {restaurant.name.substring(0, 1)}
                                    </div>
                                    {restaurant.is_active ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Aktif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Pasif
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
                                <p className="text-sm text-gray-500 truncate">/{restaurant.slug}</p>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                                    <span>Yönetmek için tıkla →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
