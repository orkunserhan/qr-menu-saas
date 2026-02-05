'use client'

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';

export function QRCodeValues({ slug, name }: { slug: string, name: string }) {
    const qrRef = useRef<SVGSVGElement>(null);

    // Tam URL (Deployment sonrası domain değişecek, şimdilik window.location veya sabit domain)
    // Client side çalıştığı için window kullanılabilir, ama SSR hatası olmaması için useEffect veya basitçe domain stringi
    // Şimdilik dinamik olarak window.location.origin kullanacağız ama admin panelinde olduğumuz için
    // menünün public url'ini manuel oluşturmak daha güvenli.

    // NOT: Canlıya alınca 'https://qrmenu.com' gibi bir base URL olmalı.
    // Şimdilik geliştirme ortamında localhost varsayıyoruz. 
    // Ancak QR kodun içine tam URL gömmek en iyisi.
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://qrmenu.com';
    const menuUrl = `${baseUrl}/${slug}`;

    const downloadQR = () => {
        const svg = qrRef.current;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        // SVG'yi base64'e çevir
        img.onload = () => {
            canvas.width = img.width + 40; // Padding
            canvas.height = img.height + 60; // Padding + Text space

            if (ctx) {
                // Arkaplan
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // QR Kodunu Çiz
                ctx.drawImage(img, 20, 20);

                // Altına Restoran Adını Yaz
                ctx.font = "bold 20px sans-serif";
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillText(name, canvas.width / 2, canvas.height - 20);

                // İndir
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `${slug}-qr.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 text-center">
            <h3 className="font-bold text-lg mb-2">QR Menü Kartı</h3>

            <div className="p-4 bg-white border-2 border-black rounded-xl shadow-lg">
                <QRCodeSVG
                    value={menuUrl}
                    size={200}
                    level={"H"} // Yüksek hata düzeltme
                    includeMargin={true}
                    ref={qrRef}
                />
            </div>

            <div className="text-sm text-gray-500 max-w-[200px] break-all">
                {menuUrl}
            </div>

            <Button onClick={downloadQR} fullWidth className="mt-2">
                QR Kodu İndir (PNG)
            </Button>
            <p className="text-xs text-gray-400 mt-1">
                Bunu yazdırıp masalarınıza yapıştırabilirsiniz.
            </p>
        </div>
    );
}

// Modal Wrapper
import { useState } from 'react';

export function QRCodeModal({ slug, name }: { slug: string, name: string }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h.01" /><path d="M7 17h.01" /><path d="M17 7h.01" /><path d="M17 17h.01" /></svg>
                QR Kod
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-200"
                >
                    Kapat [x]
                </button>

                <QRCodeValues slug={slug} name={name} />
            </div>
        </div>
    )
}
