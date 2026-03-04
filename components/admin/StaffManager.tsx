'use client';

import { useState } from 'react';
import { addStaff, deleteStaff } from '@/app/actions/feedback-staff-actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function StaffManager({ restaurantId, staffList }: { restaurantId: string, staffList: any[] }) {
    const [loading, setLoading] = useState(false);

    async function handleAdd(formData: FormData) {
        setLoading(true);
        await addStaff(restaurantId, formData);
        setLoading(false);
        // Formu temizle (basitçe reset)
        const form = document.getElementById('add-staff-form') as HTMLFormElement;
        form?.reset();
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 border-b pb-2">👨‍🍳 Personel Yönetimi</h3>
            <p className="text-sm text-gray-500">Ekip çalışanlarınızı buraya ekleyin.</p>

            {/* Liste */}
            <div className="space-y-2">
                {staffList.map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <div className="font-bold text-sm">{person.name}</div>
                            <div className="text-xs text-gray-500">{person.role} • {person.email || '-'}</div>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm('Silmek istediğinize emin misiniz?')) {
                                    await deleteStaff(person.id, restaurantId);
                                }
                            }}
                            className="text-red-500 text-xs hover:underline"
                        >
                            Sil
                        </button>
                    </div>
                ))}
                {staffList.length === 0 && <div className="text-sm text-gray-400 italic">Henüz personel eklenmemiş.</div>}
            </div>

            {/* Ekleme Formu */}
            <form id="add-staff-form" action={handleAdd} className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Input name="name" placeholder="Ad Soyad" required className="bg-white" />
                <select name="role" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-black focus:border-black">
                    <option value="Garson">Garson</option>
                    <option value="Şef">Mutfak Şefi</option>
                    <option value="Barista">Barista</option>
                    <option value="Barmen">Barmen</option>
                    <option value="Komi">Komi</option>
                    <option value="Müdür">Müdür</option>
                </select>
                <Input name="email" type="email" placeholder="E-Posta (Opsiyonel)" className="bg-white" />
                <Input name="phone" type="tel" placeholder="Telefon (Opsiyonel)" className="bg-white" />

                <div className="col-span-2">
                    <Button type="submit" size="sm" className="w-full" disabled={loading}>
                        {loading ? 'Ekleniyor...' : '+ Ekle'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
