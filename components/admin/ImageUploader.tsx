'use client';

import { useState, useRef } from 'react';
import { compressImage } from '@/utils/image-compression';

interface ImageUploaderProps {
    name: string;
    label: string;
    existingImageUrl?: string | null;
    onChange?: (file: File) => void;
    maxWidth?: number; // Opsiyonel Genişlik
    aspectRatioText?: string; // Örn: "1:1 Kare" veya "16:9 Geniş"
}

export function ImageUploader({ name, label, existingImageUrl, onChange, maxWidth = 1000, aspectRatioText = "1:1 Kare" }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(existingImageUrl || null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            // Görseli Global Standartlara Göre Optimiz Et (WebP + Resize)
            const optimizedFile = await compressImage(file, maxWidth);

            // Önizleme oluştur
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

        } catch (error) {
            console.error("Görsel işlenemedi:", error);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div className="flex items-start gap-4">
                {/* Önizleme Alanı - Geniş resimler için daha geniş kutu */}
                <div className={`relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center group ${maxWidth > 1000 ? 'w-48 h-28' : 'w-24 h-24'}`}>
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    ) : preview ? (
                        <>
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold">Değiştir</span>
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-400 text-xs text-center px-1">Görsel Yok</span>
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
                    <div className="text-[10px] text-gray-500 bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <strong className="block text-blue-700 mb-0.5">💡 İdeal Boyutlar (Global Standart)</strong>
                        {aspectRatioText} formatında, ~<strong>{maxWidth}px</strong> genişliğinde yüklemeniz önerilir. Otomatik iyileştirme aktif.
                    </div>
                </div>
            </div>
        </div>
    );
}
