'use client'

import { useState } from "react";
import { updateLiteMode } from "@/app/[locale]/admin/actions";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

type Props = {
    restaurantId: string;
    initialLiteMode: boolean;
};

export default function LiteModeToggle({ restaurantId, initialLiteMode }: Props) {
    const t = useTranslations('components');
    const [isLiteMode, setIsLiteMode] = useState(initialLiteMode);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        const newValue = !isLiteMode;
        setLoading(true);
        try {
            const result = await updateLiteMode(restaurantId, newValue);
            if (result.success) {
                setIsLiteMode(newValue);
                toast.success("Mode updated successfully.");
            } else {
                toast.error(result.error || "Update error");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800 transition-colors">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-orange-900 dark:text-orange-400">{t('liteMode')}</span>
                <span className="text-[10px] text-orange-700 dark:text-orange-300 opacity-80">{t('liteModeDesc')}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={isLiteMode}
                    onChange={handleToggle}
                    disabled={loading}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-orange-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
        </div>
    );
}
