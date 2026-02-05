'use client'

import { login, signup } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        try {
            const result = isLogin ? await login(formData) : await signup(formData);
            if (result?.error) {
                setError(result.error);
            }
        } catch (e) {
            setError("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        {isLogin ? "Panel'e Giriş Yap" : "Hesap Oluştur"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        QR Menü sisteminizi yönetmek için giriş yapın.
                    </p>
                </div>

                <form className="space-y-4" action={handleSubmit}>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        label="E-posta"
                        placeholder="ornek@sirket.com"
                        required
                    />

                    <Input
                        id="password"
                        name="password"
                        type="password"
                        label="Şifre"
                        placeholder="••••••••"
                        required
                    />

                    {error && (
                        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? "İşleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
                    </Button>
                </form>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs text-gray-500 hover:text-black underline transition-colors"
                    >
                        {isLogin ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
                    </button>
                </div>
            </div>
        </div>
    )
}
