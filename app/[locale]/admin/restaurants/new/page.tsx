'use client'

import { createRestaurant } from '@/app/[locale]/admin/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/src/i18n/routing'

export default function NewRestaurantPage() {
    const t = useTranslations('admin.newRestaurant')
    const tCommon = useTranslations('common')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        // Slug hook
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
            setError(t('unexpectedError'));
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-500">{t('description')}</p>
            </div>

            <form className="space-y-6" action={handleSubmit}>
                <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4 shadow-sm">

                    <div className="border-b border-gray-100 pb-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('businessInfo')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                label={t('restaurantName')}
                                placeholder={t('restaurantNamePlaceholder')}
                                required
                            />

                            <div className="w-full space-y-1">
                                <label className="text-sm font-medium text-gray-700">{t('businessType')}</label>
                                <select
                                    name="category"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                                    required
                                >
                                    <option value="">{tCommon('select')}</option>
                                    <option value="Fine Dining">🍽️ {t('typeFineDining')}</option>
                                    <option value="Casual Dining">🍕 {t('typeCasual')}</option>
                                    <option value="Cafe">☕ {t('typeCafe')}</option>
                                    <option value="Bakery">🥐 {t('typeBakery')}</option>
                                    <option value="Bar">🍸 {t('typeBar')}</option>
                                    <option value="Beach">🏖️ {t('typeBeach')}</option>
                                    <option value="Other">{t('typeOther')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                label={tCommon('phone')}
                                placeholder={tCommon('phonePlaceholder')}
                            />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                label={tCommon('email')}
                                placeholder={tCommon('emailPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900">{t('menuSettings')}</h3>
                        <div>
                            <Input
                                id="slug"
                                name="slug"
                                type="text"
                                label={t('slug')}
                                placeholder={tCommon('slugPlaceholder')}
                                required
                            />
                        </div>

                        <Input
                            id="address"
                            name="address"
                            type="text"
                            label={tCommon('address')}
                        />

                        <Input
                            id="wifi_pass"
                            name="wifi_pass"
                            type="text"
                            label={tCommon('wifiPass')}
                            placeholder={tCommon('optional')}
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
                        {tCommon('cancel')}
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? t('creating') : t('createBtn')}
                    </Button>
                </div>
            </form>
        </div>
    )
}
