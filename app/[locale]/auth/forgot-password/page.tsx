'use client'
import { resetPassword } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError('')
        setMessage('')

        const res = await resetPassword(formData)
        setLoading(false)

        if (res?.error) {
            setError(res.error)
        } else {
            setMessage('E-posta adresinize sıfırlama bağlantısı gönderildi.')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Şifre Sıfırlama</h2>
                    <p className="text-sm text-gray-500 mt-2">Kayıtlı e-posta adresinizi girin.</p>
                </div>

                {!message ? (
                    <form action={handleSubmit} className="space-y-4">
                        <Input name="email" type="email" label="E-Posta" required />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" fullWidth disabled={loading}>
                            {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center text-green-600 bg-green-50 p-4 rounded-lg">
                        {message}
                    </div>
                )}

                <div className="text-center">
                    <Link href="/auth/login" className="text-sm text-gray-500 hover:text-black">
                        ← Giriş'e Dön
                    </Link>
                </div>
            </div>
        </div>
    )
}
