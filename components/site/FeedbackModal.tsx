'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { submitFeedback } from '@/app/actions'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

export function FeedbackModal({ restaurantId, onClose, googleUrl }: { restaurantId: string, onClose: () => void, googleUrl?: string }) {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [isHighRating, setIsHighRating] = useState(false)
    const [rating, setRating] = useState<number>(0)
    const [hoverRating, setHoverRating] = useState<number>(0)
    const t = useTranslations('client')
    const tf = useTranslations('client.feedback')

    async function handleSubmit(formData: FormData) {
        if (rating === 0) {
            toast.error(tf('selectRating'));
            return;
        }
        setLoading(true)
        const ratingVal = Number(formData.get('rating'));

        try {
            const res = await submitFeedback(restaurantId, formData)
            setLoading(false)

            if (res?.success) {
                if (ratingVal >= 4 && googleUrl) {
                    setIsHighRating(true)
                    toast.success(tf('thankYou'), { icon: '⭐️' })
                } else {
                    toast.success(tf('received'))
                }
                setSubmitted(true)
                if (ratingVal < 4) {
                    setTimeout(() => { onClose() }, 2500)
                }
            } else {
                toast.error(tf('error'))
            }
        } catch (error) {
            setLoading(false)
            toast.error(t('connectionError'))
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">⭐</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tf('title')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tf('subtitle')}</p>
                </div>

                {!submitted ? (
                    <form action={handleSubmit} className="space-y-4">
                        {/* Star Rating */}
                        <div className="flex justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <label
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    className={`cursor-pointer transition-all transform hover:scale-110 ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={star}
                                        className="sr-only"
                                        required
                                        checked={rating === star}
                                        onChange={() => setRating(star)}
                                    />
                                    <svg className="w-10 h-10 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                </label>
                            ))}
                        </div>

                        <textarea
                            name="comment"
                            rows={3}
                            placeholder={tf('commentPlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:ring-black focus:border-black text-sm dark:text-white outline-none transition-all"
                            required
                        ></textarea>

                        <Input
                            name="customer_contact"
                            placeholder={tf('contactPlaceholder')}
                            className="text-sm"
                        />

                        <Button type="submit" fullWidth disabled={loading}>
                            {loading ? tf('sending') : tf('submit')}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center py-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <p className="text-green-600 dark:text-green-400 font-medium text-lg">
                            {isHighRating ? tf('highRatingThanks') : tf('received')} ✅
                        </p>
                        {isHighRating && googleUrl && (
                            <a
                                href={googleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md active:scale-95"
                                onClick={onClose}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-2.15-.15-2.15z" /></svg>
                                {tf('rateOnGoogle')}
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
