'use client'

import {
    updateRestaurantDailyStatus,
    updateRestaurantBrand,
    updateRestaurantCorporate,
    updateRestaurantCampaign,
    updateRestaurantMenuAppearance,
    updateRestaurantSystem,
    deleteRestaurant,
    restoreRestaurant,
    hardDeleteRestaurant
} from "@/app/[locale]/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploader } from "./ImageUploader";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function SettingsForm({ restaurant, role }: { restaurant: any, role: string|null }) {
    const t = useTranslations('components');
    const [loadingSection, setLoadingSection] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, { type: 'success' | 'error', text: string }>>({});

    const isAdmin = role === 'super_admin';

    const handleUpdate = async (section: string, actionFn: (id: string, formData: FormData) => Promise<any>, formData: FormData) => {
        setLoadingSection(section);
        const newMessages = { ...messages };
        delete newMessages[section];
        setMessages(newMessages);

        if (section === 'brand') {
            const slug = formData.get('slug') as string;
            if (slug) {
                formData.set('slug', slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''));
            }
        }

        try {
            const res = await actionFn(restaurant.id, formData);
            if (res?.error) {
                setMessages(prev => ({ ...prev, [section]: { type: 'error', text: res.error } }));
            } else {
                setMessages(prev => ({ ...prev, [section]: { type: 'success', text: t('settingsUpdated') } }));
            }
        } catch (error) {
            setMessages(prev => ({ ...prev, [section]: { type: 'error', text: "An error occurred." } }));
        } finally {
            setLoadingSection(null);
        }
    };

    const StatusMessage = ({ section }: { section: string }) => {
        const msg = messages[section];
        if (!msg) return null;
        return (
            <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {msg.text}
            </div>
        );
    };

    const SaveButton = ({ section, label = "Save" }: { section: string, label?: string }) => (
        <div className="mt-6">
            <Button type="submit" disabled={loadingSection === section} fullWidth>
                {loadingSection === section ? "Saving..." : label}
            </Button>
            <StatusMessage section={section} />
        </div>
    );

    return (
        <div className="space-y-6 max-w-xl relative">

            {/* SİLİNME UYARISI / GERİ YÜKLEME PANELİ */}
            {restaurant.deleted_at && (
                <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-2xl p-6 mb-6 shadow-xl animate-pulse">
                    <div className="flex items-start gap-4">
                        <span className="text-4xl">⚠️</span>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-red-800 dark:text-red-400 uppercase italic">
                                {t('restaurantPendingDeletion')}
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-3">
                                {t('deletionGracePeriodDesc', { days: 15 - Math.floor((new Date().getTime() - new Date(restaurant.deleted_at).getTime()) / (1000 * 60 * 60 * 24)) })}
                            </p>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={async () => {
                                        const res = await restoreRestaurant(restaurant.id);
                                        if (res.success) window.location.reload();
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-sm"
                                >
                                    {t('restoreRestaurant')}
                                </Button>
                                <Button 
                                    onClick={async () => {
                                        if (confirm(t('confirmHardDelete', { name: restaurant.name }))) {
                                            setLoadingSection('delete');
                                            try {
                                                const res = await hardDeleteRestaurant(restaurant.id);
                                                if (res?.error) {
                                                    alert(res.error);
                                                } else {
                                                    window.location.href = '/admin';
                                                }
                                            } catch (e) {
                                                alert("Error!");
                                            } finally {
                                                setLoadingSection(null);
                                            }
                                        }
                                    }}
                                    variant="outline"
                                    className="border-red-600 text-red-600 hover:bg-red-50 font-bold px-4 py-2 rounded-lg text-sm"
                                >
                                    💣 {t('hardDeleteNow')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end mb-2">
                <a
                    href={`/${restaurant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 bg-black text-white hover:bg-gray-800 h-10 px-4 text-sm gap-2 shadow-sm"
                >
                    View Live Menu
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>

            {/* Restoran Durumu */}
            <form action={(fd) => handleUpdate('daily', updateRestaurantDailyStatus, fd)} className={`p-6 rounded-xl border shadow-sm space-y-4 ${restaurant.is_open ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 border-gray-200/50">{t('dailyStatus')}</h3>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{restaurant.is_open ? t('openNow') : t('closedNow')}</span>
                        <span className="text-xs text-gray-500">{restaurant.is_open ? t('canOrder') : t('warnClosed')}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="is_open" defaultChecked={restaurant.is_open ?? true} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                <SaveButton section="daily" label={t('saveStatus')} />
            </form>

            <form action={(fd) => handleUpdate('brand', updateRestaurantBrand, fd)} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">{t('brandAppearance')}</h3>
                <Input label={t('restaurantName')} name="name" defaultValue={restaurant.name} required />
                <ImageUploader name="logo" label={t('restaurantLogo')} existingImageUrl={restaurant.logo_url} aspectRatioText="1:1 Kare" maxWidth={800} />
                <ImageUploader name="cover_image" label={t('coverPhoto')} existingImageUrl={restaurant.cover_image_url} maxWidth={1600} aspectRatioText="16:9 Sinematik" />
                <Input label={t('urlSlug')} name="slug" defaultValue={restaurant.slug} required />
                <Input label={t('address')} name="address" defaultValue={restaurant.address} />
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('currency')}</label>
                    <select name="currency" defaultValue={restaurant.currency || 'EUR'} className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-black focus:border-black text-sm shadow-sm">
                        <option value="EUR">€ Euro</option><option value="TRY">₺ Türk Lirası</option><option value="USD">$ Dolar</option><option value="GBP">£ Sterlin</option>
                    </select>
                </div>
                <SaveButton section="brand" label={t('saveBrand')} />
            </form>

            <form action={(fd) => handleUpdate('corporate', updateRestaurantCorporate, fd)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">{t('corpComm')}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input label={t('authPerson')} name="owner_name" placeholder="Ad Soyad" defaultValue={restaurant.owner_name} />
                    <Input label={t('companyName')} name="company_name" placeholder="Ex: Main Office" defaultValue={restaurant.company_name} />
                </div>
                <Input label="Feedback & Notification Email" name="feedback_email" type="email" placeholder="feedback@restaurant.com" defaultValue={restaurant.feedback_email} />
                <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                    <Input label="Telefon" name="phone" defaultValue={restaurant.phone} />
                    <Input label="Email (General)" name="email" defaultValue={restaurant.email} />
                </div>
                <Input label="Google Maps Place ID" name="google_place_id" defaultValue={restaurant.google_place_id} placeholder="Ex: ChIJ..." />
                <Input label="Google Review Link (URL)" name="google_review_url" defaultValue={restaurant.google_review_url} placeholder="Ex: https://g.page/r/..." />
                <Input label="Table-specific QR Link" name="table_qr_link" defaultValue={restaurant.table_qr_link} placeholder="Ex: https://menu.com/table-qr" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <Input label="Instagram" name="social_instagram" defaultValue={restaurant.social_instagram} placeholder="Link..." />
                    <Input label="Facebook" name="social_facebook" defaultValue={restaurant.social_facebook} placeholder="Link..." />
                    <Input label="Twitter" name="social_twitter" defaultValue={restaurant.social_twitter} placeholder="Link..." />
                </div>
                <SaveButton section="corporate" label={t('saveComm')} />
            </form>

            <form action={(fd) => handleUpdate('campaign', updateRestaurantCampaign, fd)} className={`p-6 rounded-xl border shadow-sm space-y-4 ${restaurant.is_campaign_active ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">{t('dailyCampaign')}</h3>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-700">{t('campaignActive')}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="is_campaign_active" defaultChecked={restaurant.is_campaign_active} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>
                <div className="space-y-3">
                    <Input label={t('campaignTitleLabel')} name="campaign_title" defaultValue={restaurant.campaign_title} placeholder="Write your campaign title..." />
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">{t('campaignTextLabel')}</label>
                        <textarea name="campaign_text" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm" placeholder="Ex: Free tea with dessert!" defaultValue={restaurant.campaign_text} />
                    </div>
                </div>
                <SaveButton section="campaign" label={t('saveCampaign')} />
            </form>

            <form action={(fd) => handleUpdate('menu_appearance', updateRestaurantMenuAppearance, fd)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">{t('menuAppearance')}</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{t('caloriesInfo')}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="show_calories" defaultChecked={restaurant.show_calories ?? true} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{t('prepTime')}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="show_preparation_time" defaultChecked={restaurant.show_preparation_time ?? true} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                </div>
                <SaveButton section="menu_appearance" label={t('saveAppearance')} />
            </form>

            {/* Yönetici Paneli (Sadece Admin yetkisiyle kontrol edilebilir) */}
            <div className="bg-[#fff9f2] dark:bg-orange-950/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/40 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2 border-b border-orange-100 dark:border-orange-900/50 pb-3">
                    <span className="text-base">🔒</span> {t('adminPanelHeader')}
                </h3>

                <form action={(fd) => handleUpdate('system', updateRestaurantSystem, fd)} className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{t('licenseStatus')}</span>
                            {!isAdmin && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${restaurant.is_active ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {restaurant.is_active ? t('active') : t('inactive')}
                                </span>
                            )}
                        </div>
                        <label className={`relative inline-flex items-center ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                            <input type="checkbox" name="is_active" defaultChecked={restaurant.is_active} className="sr-only peer" disabled={!isAdmin} />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-orange-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                        </label>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">{t('subEndDate')}</label>
                        <input
                            type={isAdmin ? "datetime-local" : "text"}
                            name="subscription_end_date"
                            defaultValue={isAdmin ? (restaurant.subscription_end_date ? new Date(restaurant.subscription_end_date).toISOString().slice(0, 16) : '') : (restaurant.subscription_end_date ? new Date(restaurant.subscription_end_date).toLocaleString() : '-')}
                            readOnly={!isAdmin}
                            disabled={!isAdmin}
                            className={`w-full px-4 py-3 border rounded-xl transition-all font-medium ${isAdmin ? 'border-gray-300 bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500' : 'border-orange-100 bg-orange-50/20 text-orange-900 cursor-not-allowed'}`}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{t('onlinePayment')}</span>
                            <span className="text-[10px] text-orange-600/70">{t('onlinePaymentDesc')}</span>
                        </div>
                        <label className={`relative inline-flex items-center ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                            <input type="checkbox" name="is_payment_enabled" defaultChecked={restaurant.is_payment_enabled} className="sr-only peer" disabled={!isAdmin} />
                            <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Stripe Account ID</label>
                        <Input name="stripe_account_id" defaultValue={restaurant.stripe_account_id || ''} placeholder="acct_..." readOnly={!isAdmin} className="bg-white/50" />
                    </div>

                    {isAdmin && (
                        <>
                            <Button 
                                type="submit" 
                                fullWidth 
                                className="bg-red-600 hover:bg-red-600 active:scale-95 active:shadow-inner text-white hover:text-white font-black uppercase tracking-widest border-none shadow-xl shadow-red-500/10 rounded-xl transition-all duration-75 py-6 mt-4 ring-offset-2 ring-red-500/20 active:ring-4" 
                                disabled={loadingSection === 'system'}
                            >
                                {loadingSection === 'system' ? t('saving') : t('saveSystem')}
                            </Button>
                            <div className="mt-2 min-h-[40px]">
                                <StatusMessage section="system" />
                            </div>

                            <div className="pt-4 border-t border-orange-100 dark:border-orange-900/40 mt-2">
                                <Button type="button" variant="ghost" fullWidth className="text-red-600 hover:text-red-700 hover:bg-red-50 font-black uppercase tracking-tighter text-xs" onClick={async () => {
                                    if (confirm(t('confirmSoftDelete', { name: restaurant.name }))) {
                                        setLoadingSection('delete');
                                        try {
                                            const res = await deleteRestaurant(restaurant.id);
                                            if (res?.error) alert(res.error); else window.location.href = '/admin';
                                        } catch (e) { alert("Error!"); } finally { setLoadingSection(null); }
                                    }
                                }}>
                                    🗑️ {t('deleteRestaurantFromSystem')}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
