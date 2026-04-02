export type TagConfig = {
    icon: string;
    translationKey: string;
    colorClass: string;
};

// Supports both English keys (from DB) and Turkish keys (legacy)
export const PRODUCT_TAGS: Record<string, TagConfig> = {
    // ---- English keys (standardized / DB format) ----
    "pork":           { icon: "🐷", translationKey: "Domuz Eti",       colorClass: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    "beef":           { icon: "🐮", translationKey: "Sığır Eti",       colorClass: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    "lamb":           { icon: "🐑", translationKey: "Koyun Eti",       colorClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    "chicken":        { icon: "🐔", translationKey: "Tavuk Eti",       colorClass: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    "seafood":        { icon: "🐟", translationKey: "Deniz Ürünleri",  colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    "vegan":          { icon: "🟢", translationKey: "Vegan",           colorClass: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    "vegetarian":     { icon: "🌿", translationKey: "Vejetaryen",      colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    "halal":          { icon: "☪️",  translationKey: "Helal",           colorClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    "spicy":          { icon: "🌶️", translationKey: "Acı",             colorClass: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
    "very_spicy":     { icon: "🌶️🌶️", translationKey: "Çok Acı",     colorClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-bold" },
    "hot":            { icon: "🔥", translationKey: "Sıcak Servis",    colorClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    "cold":           { icon: "❄️", translationKey: "Soğuk Servis",    colorClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
    "gluten_free":    { icon: "🌾", translationKey: "Glutensiz",       colorClass: "bg-stone-50 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400" },
    "dairy":          { icon: "🥛", translationKey: "Süt Ürünü İçerir", colorClass: "bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" },
    "contains_nuts":  { icon: "🥜", translationKey: "Kuruyemiş İçerir", colorClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
    "chefs_choice":   { icon: "👨‍🍳", translationKey: "Şefin Tavsiyesi", colorClass: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    "new":            { icon: "✨", translationKey: "Yeni",             colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    "bestseller":     { icon: "🔥", translationKey: "Çok Satan",       colorClass: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
    "alcohol":        { icon: "🍷", translationKey: "Alkollü",         colorClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
    // ---- Turkish keys (legacy / backwards compat) ----
    "Domuz Eti":        { icon: "🐷", translationKey: "Domuz Eti",       colorClass: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    "Sığır Eti":        { icon: "🐮", translationKey: "Sığır Eti",       colorClass: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    "Koyun Eti":        { icon: "🐑", translationKey: "Koyun Eti",       colorClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    "Tavuk Eti":        { icon: "🐔", translationKey: "Tavuk Eti",       colorClass: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    "Deniz Ürünleri":   { icon: "🐟", translationKey: "Deniz Ürünleri",  colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    "Vegan":            { icon: "🟢", translationKey: "Vegan",           colorClass: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    "Vejetaryen":       { icon: "🌿", translationKey: "Vejetaryen",      colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    "Helal":            { icon: "☪️",  translationKey: "Helal",           colorClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    "Acı":              { icon: "🌶️", translationKey: "Acı",             colorClass: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
    "Çok Acı":          { icon: "🌶️🌶️", translationKey: "Çok Acı",     colorClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-bold" },
    "Sıcak Servis":     { icon: "🔥", translationKey: "Sıcak Servis",    colorClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    "Soğuk Servis":     { icon: "❄️", translationKey: "Soğuk Servis",    colorClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
    "Glutensiz":        { icon: "🌾", translationKey: "Glutensiz",       colorClass: "bg-stone-50 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400" },
    "Süt Ürünü İçerir": { icon: "🥛", translationKey: "Süt Ürünü İçerir", colorClass: "bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" },
    "Kuruyemiş İçerir": { icon: "🥜", translationKey: "Kuruyemiş İçerir", colorClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
    "Şefin Tavsiyesi":  { icon: "👨‍🍳", translationKey: "Şefin Tavsiyesi", colorClass: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    "Yeni":             { icon: "✨", translationKey: "Yeni",             colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse" },
    "Çok Satan":        { icon: "🔥", translationKey: "Çok Satan",       colorClass: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
    "Tükendi":          { icon: "🚫", translationKey: "Tükendi",         colorClass: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};
