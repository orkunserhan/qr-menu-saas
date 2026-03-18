'use client'

import { useState } from 'react'
import { createCategory } from '@/app/[locale]/admin/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTranslations } from 'next-intl'

export function AddCategoryForm({ restaurantId }: { restaurantId: string }) {
    const t = useTranslations('components');
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        await createCategory(restaurantId, formData)
        setLoading(false)
        setIsOpen(false)
    }

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)} variant="secondary" fullWidth className="border-dashed border-2 bg-gray-50 mb-8">
                {t('addCategory')}
            </Button>
        )
    }

    return (
        <form action={handleSubmit} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-semibold mb-3">{t('addCategoryTitle')}</h3>
            <div className="flex gap-2">
                <Input name="name" placeholder={t('addCategoryExample')} autoFocus required />
                <Button type="submit" disabled={loading}>{t('add')}</Button>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>{t('cancel')}</Button>
            </div>
        </form>
    )
}
