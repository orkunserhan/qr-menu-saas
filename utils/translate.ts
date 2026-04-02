import { useTranslations, useLocale } from 'next-intl';
import { Product } from '@/types';

export function useTranslateContent() {
    const tc_intl = useTranslations('client.categories');
    const tt_intl = useTranslations('client.tags');
    const locale = useLocale();

    const tc = (name: string) => {
        try {
            // 1. Exact Match Check
            const translation = tc_intl(name);
            if (translation !== name && !translation.includes('client.categories.')) {
                return translation;
            }

            // 2. Fuzzy Keyword Matching (Smart Fallback for Categories ONLY)
            const lowName = name.toLowerCase();
            
            if (lowName.includes('pizza')) return tc_intl('Pizzalar');
            if (lowName.includes('çorba') || lowName.includes('soup') || lowName.includes('suppe') || lowName.includes('polievka')) return tc_intl('Çorbalar');
            if (lowName.includes('çocuk') || lowName.includes('kids') || lowName.includes('kinder') || lowName.includes('det')) return tc_intl('Çocuk Menüsü');
            if (lowName.includes('makarna') || lowName.includes('pasta') || lowName.includes('cestoviny') || lowName.includes('pâtes')) return tc_intl('Makarnalar');
            if (lowName.includes('burger')) return tc_intl('Burgerler');
            if (lowName.includes('tatlı') || lowName.includes('dessert') || lowName.includes('nachtisch') || lowName.includes('dezert')) return tc_intl('Tatlılar');
            if (lowName.includes('içecek') || lowName.includes('drink') || lowName.includes('getränk') || lowName.includes('nápoj') || lowName.includes('boisson')) return tc_intl('İçecekler');
            if (lowName.includes('kahvalt') || lowName.includes('breakfast') || lowName.includes('frühstück') || lowName.includes('raňajky') || lowName.includes('déjeuner')) return tc_intl('Kahvaltılıklar');
            if (lowName.includes('salata') || lowName.includes('salad')) return tc_intl('Salatalar');
            if (lowName.includes('balık') || lowName.includes('fish') || lowName.includes('fisch') || lowName.includes('ryba') || lowName.includes('poisson') || lowName.includes('deniz')) return tc_intl('Deniz Ürünleri');
            if (lowName.includes(' et ') || lowName.includes(' eti') || lowName.includes('beef') || lowName.includes('meat') || lowName.includes('rind') || lowName.includes('mäso') || lowName.includes('viande')) return tc_intl('Et Yemekleri');
            if (lowName.includes('tavuk') || lowName.includes('chicken') || lowName.includes('hähnchen') || lowName.includes('kura') || lowName.includes('poulet')) return tc_intl('Tavuk Yemekleri');

            return name;
        } catch (e) {
            return name;
        }
    };

    const tt = (tag: string) => {
        try {
            const translation = tt_intl(tag);
            if (translation === tag || translation.includes('client.tags.')) {
                return tag;
            }
            return translation;
        } catch (e) {
            return tag;
        }
    };

    /**
     * Translate Description (td)
     * Fallback Logic: Requested Locale -> English (mandatory) -> Legacy Description -> Empty String
     * Never fallbacks to Turkish unless requested.
     */
    const td = (product: Product) => {
        if (!product) return '';
        
        const translations = product.description_translations || {};
        
        // 1. Try requested locale
        if (translations[locale]) return translations[locale];
        
        // 2. Try English (SaaS Standard Fallback)
        if (translations['en']) return translations['en'];
        
        // 3. Last resort fallback (avoiding tr unless it is en)
        return product.description || '';
    };

    return { tc, tt, td };
}

