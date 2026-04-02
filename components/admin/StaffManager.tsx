'use client';

import { useState } from 'react';
import { addStaff, deleteStaff } from '@/app/actions/feedback-staff-actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

export function StaffManager({ restaurantId, staffList }: { restaurantId: string, staffList: any[] }) {
    const t = useTranslations('components');
    const [loading, setLoading] = useState(false);

    async function handleAdd(formData: FormData) {
        setLoading(true);
        const res = await addStaff(restaurantId, formData);
        setLoading(false);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success(t('save'));
            const form = document.getElementById('add-staff-form') as HTMLFormElement;
            form?.reset();
        }
    }

    const roles = ['Garson', 'Şef', 'Barista', 'Barmen', 'Komi', 'Müdür'];

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-2 flex items-center gap-2">
                {t('staffManagement')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('staffDesc')}</p>

            {/* List */}
            <div className="space-y-2">
                {staffList.map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                        <div>
                            <div className="font-bold text-sm dark:text-gray-200">{person.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {t(`staffRoles.${person.role}`)} • {person.email || '-'}
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm(t('deleteConfirm'))) {
                                    await deleteStaff(person.id, restaurantId);
                                    toast.success(t('delete'));
                                }
                            }}
                            className="text-red-500 text-xs hover:underline font-medium"
                        >
                            {t('delete')}
                        </button>
                    </div>
                ))}
                {staffList.length === 0 && (
                    <div className="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center">
                        {t('staffEmpty')}
                    </div>
                )}
            </div>

            {/* Add Form */}
            <form id="add-staff-form" action={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t dark:border-gray-800">
                <Input name="name" placeholder={t('nameSurname')} required className="bg-white dark:bg-gray-800" />
                <select 
                    name="role" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-black dark:focus:ring-emerald-500 focus:border-black dark:focus:border-emerald-500 outline-none transition-all"
                    defaultValue=""
                >
                    <option value="" disabled>{t('staffRoles.Garson')} / {t('staffRoles.Müdür')}...</option>
                    {roles.map(role => {
                        const label = t(`staffRoles.${role}`);
                        // Fallback check: if translation fails and returns the key, it might look like "staffRoles.Garson"
                        // but we want to ensure we don't show "en", "tr" etc.
                        return (
                            <option key={role} value={role}>{label}</option>
                        );
                    })}
                </select>
                <Input name="email" type="email" placeholder={t('emailOptional')} className="bg-white dark:bg-gray-800" />
                <Input name="phone" type="tel" placeholder={t('phoneOptional')} className="bg-white dark:bg-gray-800" />

                <div className="md:col-span-2">
                    <Button type="submit" size="sm" className="w-full font-bold" disabled={loading}>
                        {loading ? '...' : t('addStaffBtn')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
