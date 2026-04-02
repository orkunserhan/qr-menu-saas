'use client';

import { useState, useRef } from 'react';
import { compressImage } from '@/utils/image-compression';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ImageUploaderProps {
    name: string;
    label: string;
    existingImageUrl?: string | null;
    onChange?: (file: File) => void;
    maxWidth?: number;
    aspectRatioText?: string;
}

export function ImageUploader({ name, label, existingImageUrl, onChange, maxWidth = 1000, aspectRatioText = "1:1 Kare" }: ImageUploaderProps) {
    const t = useTranslations('components');
    const tError = useTranslations('admin.errors');
    const [preview, setPreview] = useState<string | null>(existingImageUrl || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // --- VALIDATION ---
        if (!ALLOWED_TYPES.includes(file.type)) {
            const msg = tError('invalidImageFormat');
            setError(msg);
            toast.error(msg);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        
        if (file.size > MAX_SIZE_BYTES) {
            const msg = tError('imageTooLarge');
            setError(msg);
            toast.error(msg);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setLoading(true);
        try {
            const optimizedFile = await compressImage(file, maxWidth);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setLoading(false);
            };
            reader.readAsDataURL(optimizedFile);

            if (onChange) onChange(optimizedFile);

            const dt = new DataTransfer();
            dt.items.add(optimizedFile);
            if (fileInputRef.current) {
                fileInputRef.current.files = dt.files;
            }

        } catch (err) {
            console.error("Image processing failed:", err);
            toast.error("Image processing failed.");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

            <div className="flex items-start gap-4">
                {/* Preview */}
                <div className={`relative bg-gray-50 dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center group ${maxWidth > 1000 ? 'w-48 h-28' : 'w-24 h-24'}`}>
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black dark:border-white"></div>
                    ) : preview ? (
                        <>
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" 
                                onError={(e) => { (e.target as HTMLImageElement).src = '/images/food-placeholder.svg'; }} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold">Change</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px]">No Image</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        name={name}
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-xs file:font-semibold
                            file:bg-black file:text-white
                            hover:file:bg-gray-800 cursor-pointer"
                    />
                    {error && (
                        <div className="text-[11px] text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
                            ⚠️ {error}
                        </div>
                    )}
                    <div className="text-[10px] text-gray-500 bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <strong className="block text-blue-700 dark:text-blue-400 mb-0.5">{t('idealDimensions')}</strong>
                        {aspectRatioText === "1:1 Kare" ? t('squareFormatHint') : t('cinematicFormatHint')}
                        <span className="block mt-0.5 text-gray-400">JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
