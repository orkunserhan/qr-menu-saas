'use client'

import { updateRestaurant } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export function SettingsForm({ restaurant }: { restaurant: any }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Tarihi formatla (YYYY-MM-DDTHH:mm) - HTML date input için uygun format
    const defaultDate = restaurant.subscription_end_date
        ? new Date(restaurant.subscription_end_date).toISOString().slice(0, 16)
        : '';

    const handleUpdate = async (formData: FormData) => {
        setLoading(true);
        setMessage(null);

        // Slug formatlama
        const slug = formData.get('slug') as string;
        if (slug) {
            formData.set('slug', slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''));
        }

        try {
            const res = await updateRestaurant(restaurant.id, formData);
            if (res?.error) {
                setMessage(res.error);
            } else {
                setMessage("Ayarlar başarıyla güncellendi. ✅");
            }
        } catch (error) {
            setMessage("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleUpdate} className="space-y-6 max-w-xl">

            {/* Temel Bilgiler */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Genel Bilgiler</h3>
                <Input
                    label="Restoran Adı"
                    name="name"
                    defaultValue={restaurant.name}
                    required
                />
                <Input
                    label="URL Kısa Adı (Slug)"
                    name="slug"
                    defaultValue={restaurant.slug}
                    required
                />
                <Input
                    label="Adres"
                    name="address"
                    defaultValue={restaurant.address}
                />
            </div>

            {/* İletişim & Entegrasyon */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">İletişim & Google Maps</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Telefon"
                        name="phone"
                        defaultValue={restaurant.phone}
                    />
                    <Input
                        label="E-posta"
                        name="email"
                        defaultValue={restaurant.email}
                    />
                </div>

                <div>
                    <Input
                        label="Google Maps Place ID / Link"
                        name="google_place_id"
                        defaultValue={restaurant.google_place_id}
                        placeholder="Örn: ChIJ..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Google Maps'te mekanınıza gidin, "Yorum Yaz" butonunun linkini veya Place ID'sini buraya yapıştırın.
                    </p>
                </div>
            </div>

            {/* Sistem & Abonelik */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Sistem & Abonelik Yönetimi</h3>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Aktif Durum</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="is_active" defaultChecked={restaurant.is_active} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Abonelik Bitiş Tarihi</label>
                    <input
                        type="datetime-local"
                        name="subscription_end_date"
                        defaultValue={defaultDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    />
                    <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Bu tarih geçerse menü erişime kapanır (Dondurulur).</p>
                </div>
            </div>

            <Button type="submit" disabled={loading} fullWidth>
                {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </Button>

            {message && (
                <div className={`p-4 rounded-lg text-sm text-center font-medium ${message.includes('başarıyla') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}
        </form>
    );
}
