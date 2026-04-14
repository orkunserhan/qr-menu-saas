'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { setPasswordWithToken } from './actions';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

function SetPasswordForm() {
    const t = useTranslations('auth');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const mode = searchParams.get('mode'); // 'reset' for forgot-password flow

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError(t('tokenInvalid'));
        }
    }, [token, t]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        formData.set('token', token || '');
        formData.set('locale', document.documentElement.lang || 'en');

        const password = formData.get('password') as string;
        const confirm = formData.get('confirm_password') as string;

        if (password !== confirm) {
            setError(t('passwordMismatch'));
            setLoading(false);
            return;
        }

        try {
            const result = await setPasswordWithToken(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
            // Başarı durumunda server action redirect yapıyor
        } catch (err: any) {
            // NEXT_REDIRECT hatasını yut (normal redirect akışı)
            if (err?.digest?.includes('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
                throw err;
            }
            setError(t('unexpectedError'));
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        {mode === 'reset' ? t('resetTitle') : t('setPasswordTitle')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {mode === 'reset' ? t('resetDesc') : t('setPasswordDesc')}
                    </p>
                </div>

                {/* Token hatalıysa */}
                {!token && (
                    <div className="text-center bg-red-50 border border-red-100 rounded-xl p-6">
                        <p className="text-red-600 font-medium">{t('tokenInvalid')}</p>
                        <Link href="/auth/login" className="mt-4 inline-block text-sm text-gray-500 hover:text-black underline">
                            {t('backToLogin')}
                        </Link>
                    </div>
                )}

                {/* Form */}
                {token && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                                {t('newPassword')}
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                                {t('confirmPassword')}
                            </label>
                            <input
                                name="confirm_password"
                                type="password"
                                required
                                minLength={8}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t('processing')}
                                </>
                            ) : (
                                t('setPasswordBtn')
                            )}
                        </button>
                    </form>
                )}

                <div className="text-center">
                    <Link href="/auth/login" className="text-sm text-gray-400 hover:text-black transition-colors">
                        {t('backToLogin')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        }>
            <SetPasswordForm />
        </Suspense>
    );
}
