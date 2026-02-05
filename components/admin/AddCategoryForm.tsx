'use client'

import { useState } from 'react'
import { createCategory } from '@/app/admin/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AddCategoryForm({ restaurantId }: { restaurantId: string }) {
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
                + Yeni Kategori Ekle
            </Button>
        )
    }

    return (
        <form action={handleSubmit} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-semibold mb-3">Kategori Ekle</h3>
            <div className="flex gap-2">
                <Input name="name" placeholder="Örn: Ana Yemekler" autoFocus required />
                <Button type="submit" disabled={loading}>Ekle</Button>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>İptal</Button>
            </div>
        </form>
    )
}
