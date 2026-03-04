'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { verifyPayment } from '@/app/actions/verify-payment';
import { useRouter } from '@/src/i18n/routing';

export default function PaymentSuccessPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const restaurantId = searchParams.get('restaurant_id');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const router = useRouter();
    const [slug, setSlug] = useState<string>('');

    useEffect(() => {
        params.then(p => setSlug(p.slug));
    }, [params]);

    useEffect(() => {
        const verify = async () => {
            if (!sessionId || !orderId || !restaurantId || !slug) return;

            try {
                const result = await verifyPayment(sessionId, orderId);
                if (result.success) {
                    setStatus('success');
                    // Clear cart using restaurant ID
                    localStorage.removeItem(`cart_${restaurantId}`);
                    // Redirect after delay
                    setTimeout(() => {
                        router.push(`/${slug}?payment_success=true`);
                    }, 3000);
                } else {
                    console.error("Payment verification failed:", result.error);
                    setStatus('error');
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus('error');
            }
        };

        verify();
    }, [sessionId, orderId, restaurantId, slug, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
                {status === 'verifying' && (
                    <div className="animate-pulse space-y-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
                        <h2 className="text-xl font-bold text-gray-700">Ödemeniz Doğrulanıyor...</h2>
                        <p className="text-sm text-gray-500">Güvenli ödeme işleminiz kontrol ediliyor.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-in zoom-in duration-300 space-y-4">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
                            🎉
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Ödeme Başarılı!</h2>
                            <p className="text-gray-600 mt-2">Siparişiniz mutfağa iletildi.</p>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400">Menüye yönlendiriliyorsunuz...</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
                            ⚠️
                        </div>
                        <h2 className="text-xl font-bold text-red-700">Bir Sorun Oluştu</h2>
                        <p className="text-gray-600 text-sm">Ödemeniz doğrulanırken beklenmedik bir hata oluştu. Lütfen garsona bilgi veriniz.</p>
                        <button
                            onClick={() => router.push(`/${slug}`)}
                            className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            Menüye Dön
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
