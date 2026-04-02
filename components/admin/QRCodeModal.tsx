'use client'

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export function QRCodeValues({ slug, name, table }: { slug: string, name: string, table?: string }) {
    const t = useTranslations('components');
    const qrRef = useRef<SVGSVGElement>(null);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const menuUrl = `${baseUrl}/${slug}${table ? `?table=${encodeURIComponent(table)}` : ''}`;

    const downloadQR = () => {
        const svg = qrRef.current;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 80;

            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 20, 20);
                
                ctx.font = "bold 24px sans-serif";
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillText(name, canvas.width / 2, canvas.height - 45);
                
                if (table) {
                    ctx.font = "16px sans-serif";
                    ctx.fillStyle = "#666";
                    ctx.fillText(table, canvas.width / 2, canvas.height - 20);
                }

                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `${slug}-${table || 'general'}-qr.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl border border-gray-100 text-center shadow-sm">
            <h3 className="font-black text-xl tracking-tight text-gray-900 leading-tight">
                {name} {table && <span className="text-orange-600 block text-sm mt-1">{table}</span>}
            </h3>

            <div className="p-6 bg-white border-[3px] border-black rounded-3xl shadow-xl hover:scale-[1.02] transition-transform duration-300">
                <QRCodeSVG
                    value={menuUrl}
                    size={220}
                    level={"H"}
                    includeMargin={true}
                    ref={qrRef}
                />
            </div>

            <div className="text-[10px] font-mono text-gray-400 max-w-[240px] break-all bg-gray-50 p-2 rounded-lg border border-gray-100">
                {menuUrl}
            </div>

            <Button onClick={downloadQR} fullWidth className="mt-2 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl py-6">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {t('qrDownloadBtn')}
            </Button>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                PRO SCAN TECHNOLOGY
            </p>
        </div>
    );
}

// Modal Wrapper
import { useState } from 'react';

export function QRCodeModal({ slug, name, table }: { slug: string, name: string, table?: string }) {
    const t = useTranslations('components');
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="flex items-center gap-2 font-bold border-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h.01" /><path d="M7 17h.01" /><path d="M17 7h.01" /><path d="M17 17h.01" /></svg>
                {t('qrCodeBtn')}
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in transition-all">
            <div className="relative w-full max-w-sm scale-in-center" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute -top-12 right-0 text-white/80 hover:text-white flex items-center gap-2 font-bold transition-colors"
                >
                    <span>CLOSE</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <QRCodeValues slug={slug} name={name} table={table} />
            </div>
        </div>
    )
}
