'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpWidget() {
    const t = useTranslations('restAdmin.help');
    const [isOpen, setIsOpen] = useState(false);

    // Interaction guard: Browser requires interaction to play sound.
    // We can use this toggle to also "unlock" audio context if needed in trackers.
    
    return (
        <div className="fixed bottom-6 right-6 z-[10000] flex flex-col items-end print:hidden pointer-events-auto">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-72 md:w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                                <span className="text-xl text-emerald-200 block">?</span>
                                {t('title')}
                            </h3>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                className="text-emerald-100 hover:text-white transition-colors p-1 rounded"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((num) => (
                                    <div 
                                        key={num} 
                                        className="flex gap-3 items-start p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:ring-1 hover:ring-emerald-100 dark:hover:ring-emerald-900/30 transition-all cursor-pointer group/step"
                                        onClick={() => {
                                            const id = window.location.pathname.split('restaurants/')[1]?.split('/')[0];
                                            if (!id) return;
                                            
                                            const paths = [
                                                `/admin/restaurants/${id}/settings`,
                                                `/admin/restaurants/${id}`,
                                                `#qrcode`, // This triggers the modal if open, but for now we direct to main
                                                `/admin/restaurants/${id}/settings`
                                            ];
                                            window.location.href = paths[num-1];
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 group-hover/step:scale-110 transition-transform shadow-sm">
                                            {num}
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug font-medium pt-1">
                                            {t(`step${num}`)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                            <div className="h-1 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
                aria-label="Help"
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer select-none ${
                    isOpen 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-gray-900/30' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30'
                }`}
            >
                {isOpen ? (
                    <span className="text-2xl leading-none">✕</span>
                ) : (
                    <span className="text-3xl font-black leading-none">?</span>
                )}
            </motion.button>
        </div>
    );
}
