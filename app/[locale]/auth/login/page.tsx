'use client'

import { login } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
    const t = useTranslations('auth');
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
            }
        } catch (e: any) {
            // Next.js redirect fırlatır, bunu hata olarak gösterme
            if (e.message === 'NEXT_REDIRECT' || e.digest?.includes('NEXT_REDIRECT')) {
                throw e;
            }
            console.error(e);
            setError(t('unexpectedError') + ': ' + (e.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        {t('title')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {t('desc')}
                    </p>
                </div>

                <form className="space-y-4" action={handleSubmit}>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        label={t('email')}
                        placeholder={t('emailPlaceholder')}
                        required
                    />

                    <Input
                        id="password"
                        name="password"
                        type="password"
                        label={t('password')}
                        placeholder="••••••••"
                        required
                    />

                    {error && (
                        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? t('processing') : t('loginBtnText')}
                    </Button>
                </form>


                <div className="text-center mt-4 space-y-2">
                    <Link
                        href="/auth/forgot-password"
                        className="text-xs text-gray-500 hover:text-black underline transition-colors block"
                    >
                        {t('forgotPasswordDesc')}
                    </Link>

                    {/* 
                    <Link
                        href="/auth/signup"
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors block"
                    >
                        Hesabın yok mu? Kayıt ol (Sadece Yönetici Oluşturabilir)
                    </Link> 
                    */}
                </div>
            </div>
        </div>
    )
}
