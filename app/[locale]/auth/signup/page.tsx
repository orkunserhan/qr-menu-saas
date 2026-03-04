'use client'

import { signupWithRestaurant } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await signupWithRestaurant(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
            // Başarılı ise server action redirect yapacak
        } catch (e: any) {
            console.error(e);
            setError("Bir hata oluştu: " + (e.message || "Bilinmeyen hata"));
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-2xl space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        🚀 Restoran Sahibi Olun
                    </h2>
                    <p className="mt-2 text-gray-500">
                        Hemen kaydolarak dijital menünüzü oluşturun ve sipariş almaya başlayın.
                    </p>
                </div>

                <form className="space-y-6" action={handleSubmit}>

                    {/* BÖLÜM 1: KİŞİSEL BİLGİLER */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">1. Yönetici Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input id="full_name" name="full_name" label="Ad Soyad" placeholder="Örn: Ahmet Yılmaz" required />
                            <Input id="email" name="email" type="email" label="E-posta (Giriş İçin)" placeholder="ornek@sirket.com" required />
                            <Input id="password" name="password" type="password" label="Şifre" placeholder="••••••••" required />
                            <Input id="phone" name="phone" type="tel" label="Cep Telefonu" placeholder="0555 123 45 67" required />
                            <Input id="birth_date" name="birth_date" type="date" label="Doğum Tarihi" required />
                        </div>
                    </div>

                    {/* BÖLÜM 2: RESTORAN BİLGİLERİ */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">2. Restoran Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Input id="restaurant_name" name="restaurant_name" label="Mekan Adı" placeholder="Örn: Lezzet Durağı" required />
                            </div>
                            <Input id="restaurant_slug" name="restaurant_slug" label="Kısa Link (Slug)" placeholder="lezzet-duragi" required />
                            <Input id="restaurant_phone" name="restaurant_phone" type="tel" label="Restoran Telefonu" placeholder="0212 123 45 67" required />
                            <div className="md:col-span-2">
                                <Input id="restaurant_address" name="restaurant_address" label="Adres" placeholder="Mahalle, Cadde, No..." required />
                            </div>
                            <Input id="establishment_date" name="establishment_date" type="date" label="Kuruluş Tarihi (Opsiyonel)" />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button type="submit" fullWidth disabled={loading} size="lg" className="text-lg">
                        {loading ? "Hesap Oluşturuluyor..." : "🎉 Kaydı Tamamla ve Başla"}
                    </Button>
                </form>

                <div className="text-center">
                    <Link href="/auth/login" className="text-sm text-gray-500 hover:text-black underline transition-colors">
                        Zaten hesabın var mı? Giriş yap
                    </Link>
                </div>
            </div>
        </div>
    )
}
