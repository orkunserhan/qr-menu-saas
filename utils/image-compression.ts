/**
 * GÖRSEL OPTİMİZASYON ARACI (Global Standartlar v2)
 * 
 * Güncelleme: 'maxWidth' parametresi eklendi.
 * - Standart Ürün/Logo: 1000px
 * - Kapak Fotoğrafı: 1600px (Sinematik)
 */

export const compressImage = async (file: File, maxWidth: number = 1000): Promise<File> => {
    // Eğer dosya çok küçükse dokunma
    if (file.size < 200 * 1024 && file.type === 'image/webp') return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = (e) => {
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Dinamik Genişlik Sınırı
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context oluşmadı.'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // WebP Olarak Çıktı Al (0.8 Kalite)
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Sıkıştırma başarısız.'));
                        return;
                    }

                    const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });

                    resolve(optimizedFile);
                }, 'image/webp', 0.8);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
