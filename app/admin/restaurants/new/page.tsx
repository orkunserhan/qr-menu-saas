'use client'

import { createRestaurant } from '@/app/admin/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'

export default function NewRestaurantPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        // Slug'ı otomatik formatla
        const slug = formData.get('slug') as string;
        if (slug) {
            formData.set('slug', slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''));
        }

        try {
            const result = await createRestaurant(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
        } catch (e) {
            setError("Beklenmeyen bir hata oluştu.");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Yeni Restoran Ekle</h1>
                <p className="text-gray-500">Menünüzü oluşturmak için işletme detaylarını girin.</p>
            </div>

            <form className="space-y-6" action={handleSubmit}>
                <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4 shadow-sm">

                    <div className="border-b border-gray-100 pb-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">İşletme Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                label="Restoran Adı"
                                placeholder="Örn: Ege Mavisi"
                                required
                            />

                            <div className="w-full space-y-1">
                                <label className="text-sm font-medium text-gray-700">İşletme Türü</label>
                                <select
                                    name="category"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                                    required
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="Fine Dining">🍽️ Restoran (Fine Dining)</option>
                                    <option value="Casual Dining">🍕 Fast Food / Casual</option>
                                    <option value="Cafe">☕ Kafe & Coffee Shop</option>
                                    <option value="Bakery">🥐 Fırın & Pastane</option>
                                    <option value="Bar">🍸 Bar & Pub</option>
                                    <option value="Beach">🏖️ Beach & Otel</option>
                                    <option value="Other">Diğer</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                label="Telefon"
                                placeholder="0212 555 55 55"
                            />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                label="İletişim E-posta"
                                placeholder="info@restoran.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900">Menü Ayarları</h3>
                        <div>
                            <Input
                                id="slug"
                                name="slug"
                                type="text"
                                label="URL Kısa Adı (Slug)"
                                placeholder="ege-mavisi"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Menü Linki: qrmenu.com/<b>ege-mavisi</b>
                            </p>
                        </div>

                        <Input
                            id="address"
                            name="address"
                            type="text"
                            label="Adres"
                            placeholder="Kuruçeşme Sahil Yolu, No: 42..."
                        />

                        <Input
                            id="wifi_pass"
                            name="wifi_pass"
                            type="text"
                            label="WiFi Şifresi"
                            placeholder="Opsiyonel"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        İptal
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Oluşturuluyor..." : "Restoranı Oluştur"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
